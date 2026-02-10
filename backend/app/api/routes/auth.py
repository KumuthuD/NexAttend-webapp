from fastapi import APIRouter, HTTPException, status, Depends, Body, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from app.database.mongodb import get_database
from pymongo.errors import DuplicateKeyError
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin, TokenResponse
from app.schemas.token import Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.services.email import send_verification_email, send_password_reset_email
from app.api import deps
from typing import Any
import uuid
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_in: UserCreate, 
    background_tasks: BackgroundTasks,
    db = Depends(get_database)
):
    """
    Register a new user (teacher/admin).
    """
    # Check if user already exists
    existing_user = await db["users"].find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_in.password)
    
    # Generate verification token
    verification_token = str(uuid.uuid4())
    
    # Create user model
    user_model = User(
        full_name=user_in.full_name,
        email=user_in.email,
        password_hash=hashed_password,
        role=user_in.role,
        is_verified=False,
        verification_token=verification_token
    )
    
    # Save to database
    try:
        user_dict = user_model.model_dump(by_alias=True, exclude=["id"])
        if user_dict.get("_id") is None:
            user_dict.pop("_id", None)
            
        new_user = await db["users"].insert_one(user_dict)
        created_user = await db["users"].find_one({"_id": new_user.inserted_id})
        
        # Send verification email in background
        background_tasks.add_task(send_verification_email, user_in.email, verification_token)
        
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    return created_user

@router.post("/verify-email")
async def verify_email(token: str = Body(..., embed=True), db = Depends(get_database)):
    """
    Verify email address using the token
    """
    user = await db["users"].find_one({"verification_token": token})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
        
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"is_verified": True, "verification_token": None}}
    )
    
    return {"message": "Email verified successfully"}

@router.post("/forgot-password")
async def forgot_password(
    background_tasks: BackgroundTasks,
    email: str = Body(..., embed=True), 
    db = Depends(get_database)
):
    """
    Request password reset email
    """
    user = await db["users"].find_one({"email": email})
    if not user:
        # Don't reveal if user exists
        return {"message": "If this email is registered, you will receive a password reset link"}
        
    reset_token = str(uuid.uuid4())
    expires = datetime.utcnow() + timedelta(hours=1)
    
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_token": reset_token, "reset_token_expires": expires}}
    )
    
    background_tasks.add_task(send_password_reset_email, email, reset_token)
    
    return {"message": "If this email is registered, you will receive a password reset link"}

@router.post("/reset-password")
async def reset_password(
    token: str = Body(...), 
    new_password: str = Body(...),
    db = Depends(get_database)
):
    """
    Reset password using the token
    """
    user = await db["users"].find_one({
        "reset_token": token,
        "reset_token_expires": {"$gt": datetime.utcnow()}
    })
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
        
    hashed_password = get_password_hash(new_password)
    
    await db["users"].update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password_hash": hashed_password,
                "reset_token": None,
                "reset_token_expires": None
            }
        }
    )
    
    return {"message": "Password reset successfully"}

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
        
    # Check if verified (Optional: enforce strictly or warn)
    # if not user.get("is_verified", False):
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Email not verified. Please check your inbox."
    #     )
    
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
            is_active=user.get("is_active", True)
        )
    )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_database)) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = await db["users"].find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = create_access_token(subject=str(user["_id"]))
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserResponse)
async def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current logged in user.
    """
    # current_user is already fetched by the dependency get_current_user
    return current_user
