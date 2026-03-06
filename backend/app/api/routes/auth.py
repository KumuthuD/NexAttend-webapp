from fastapi import APIRouter, HTTPException, status, Depends, Form, File, UploadFile
from typing import List, Optional
from app.database.mongodb import get_database
from pymongo.errors import DuplicateKeyError
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin, TokenResponse

from app.schemas.token import Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.api import deps
from app.services.student_id_service import generate_student_id
from typing import Any
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.core.config import settings
from app.schemas.user import GoogleLogin

router = APIRouter()

# Initialize services for face processing
from app.services.face_detector import FaceDetector
from app.services.embedding_service import embedding_service
import numpy as np
import cv2
import logging

logger = logging.getLogger(__name__)
detector = FaceDetector(min_face_size=30)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    full_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: str = Form(...),
    files: List[UploadFile] = File(None),
    db = Depends(get_database)
):
    """
    Register a new user.
    If role is 'student' and files are provided, registers their face for recognition.
    """
    # Check if user already exists
    existing_user = await db["users"].find_one({"email": email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Hash password
    hashed_password = get_password_hash(password)
    
    # Prepare user data
    from datetime import datetime, timezone
    user_data = {
        "full_name": full_name,
        "email": email,
        "password_hash": hashed_password,
        "role": role,
        "is_active": True,
        "has_registered_face": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    # Generate unique 8-digit student ID for students
    if role == "student":
        user_data["student_id"] = await generate_student_id(db)

    # Process Face (if student and files provided)
    if role == "student" and files and len(files) > 0:
        try:
            # We use the first valid image for the embedding
            
            valid_face_found = False
            
            for file in files:
                contents = await file.read()
                nparr = np.frombuffer(contents, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if image is None:
                    continue
                    
                # Detect
                faces = detector.detect_faces(image)
                if not faces:
                    continue
                
                # Get the largest face
                # Sort by area (w * h)
                faces.sort(key=lambda x: x['box'][2] * x['box'][3], reverse=True)
                target_face = faces[0]
                
                # Crop with padding
                x, y, w, h = target_face['box']
                h_img, w_img = image.shape[:2]
                pad = int(w * 0.1)
                x1, y1 = max(0, x - pad), max(0, y - pad)
                x2, y2 = min(w_img, x + w + pad), min(h_img, y + h + pad)
                
                face_crop = image[y1:y2, x1:x2]
                
                # Generate Embedding
                embedding = embedding_service.generate_embedding(face_crop)
                
                if embedding:
                    user_data["embedding"] = embedding
                    user_data["has_registered_face"] = True
                    valid_face_found = True
                    logger.info(f"Generated face embedding for student {email}")
                    break
            
            if not valid_face_found:
                logger.warning(f"No valid face found in uploaded photos for {email}")
                # We don't block registration, but they won't have face ID yet
                
        except Exception as e:
            logger.error(f"Error processing face images: {e}")
            # Continue registration without face data
            
    # Save to database
    try:
        new_user = await db["users"].insert_one(user_data)
        created_user = await db["users"].find_one({"_id": new_user.inserted_id})
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    return created_user


@router.post("/login", response_model=TokenResponse)
async def login_user(user_in: UserLogin, db = Depends(get_database)):
    """
    OAuth2 compatible token login.
    Authenticate user and return JWT access token with user info.
    """
    # Find user by email
    user = await db["users"].find_one({"email": user_in.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(user_in.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is disabled"
        )
    
    # Create access token
    access_token = create_access_token(subject=str(user["_id"]))
    
    # Return token and user info
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=str(user["_id"]),
            full_name=user["full_name"],
            email=user["email"],
            role=user["role"],
            is_active=user.get("is_active", True),
            avatar=user.get("avatar"),
            date_of_birth=user.get("date_of_birth"),
            gender=user.get("gender"),
            created_at=user.get("created_at"),
            student_id=user.get("student_id")
        )
    )
def get_google_user_info(token: str):
    import requests
    try:
        # Try as ID token first
        try:
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )
            return idinfo
        except ValueError:
            # If ID token verification fails, try as Access Token
            response = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token}"}
            )
            if response.status_code == 200:
                return response.json()
            return None
    except Exception:
        return None

@router.post("/google", response_model=TokenResponse)
async def google_login(login_data: GoogleLogin, db = Depends(get_database)):
    """
    Authenticate user via Google ID Token.
    """
    user_info = get_google_user_info(login_data.token)
    
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )
    
    email = user_info.get("email")
    full_name = user_info.get("name")
    avatar = user_info.get("picture")
    
    if not email:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account must have an email"
        )

    # Check if user exists
    user = await db["users"].find_one({"email": email})
    
    if not user:
        # Create new user
        from datetime import datetime, timezone
        user_data = {
            "full_name": full_name,
            "email": email,
            "role": login_data.role,
            "avatar": avatar,
            "is_active": True,
            "has_registered_face": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "auth_provider": "google"
        }

        # Generate unique student ID for student role
        if login_data.role == "student":
            user_data["student_id"] = await generate_student_id(db)
        
        result = await db["users"].insert_one(user_data)
        user = await db["users"].find_one({"_id": result.inserted_id})
    else:
        # Update avatar if it changed
        if avatar and user.get("avatar") != avatar:
            await db["users"].update_one(
                {"_id": user["_id"]},
                {"$set": {"avatar": avatar}}
            )
            user["avatar"] = avatar

    # Create access token
    access_token = create_access_token(subject=str(user["_id"]))
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=str(user["_id"]),
            full_name=user["full_name"],
            email=user["email"],
            role=user["role"],
            is_active=user.get("is_active", True),
            avatar=user.get("avatar"),
            created_at=user.get("created_at"),
            student_id=user.get("student_id")
        )
    )

@router.get("/me", response_model=UserResponse)
async def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current logged in user.
    """
    # current_user is already fetched by the dependency get_current_user
    return current_user
