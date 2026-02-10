
"""
Face Management Routes
Handles face registration and related operations.

Kumuthu Dahanayake
Week 02 Day 8
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from app.api.deps import get_current_user
from app.models.user import User
from app.services.face_detector import FaceDetector
from app.services.embedding_service import embedding_service
from app.database.mongodb import db
import numpy as np
import cv2
import logging
from bson import ObjectId

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize detector for this endpoint
# We use a slightly stricter threshold for registration to ensure high quality
detector = FaceDetector(min_face_size=50, min_confidence=0.95)

@router.post("/register", status_code=status.HTTP_200_OK)
async def register_face(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Register a face for the currently authenticated user.
    
    1. Validates the uploaded image.
    2. Detects exactly one face.
    3. Generates embedding.
    4. Saves embedding to the user's profile in MongoDB.
    """
    # 1. Validate File Type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # 2. Read Image
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Could not decode image")
    except Exception as e:
        logger.error(f"Error reading file: {e}")
        raise HTTPException(status_code=400, detail="Invalid image file")

    # 3. Detect Face
    # We want exactly ONE face for strict registration
    faces = detector.detect_faces(image)
    
    if len(faces) == 0:
        raise HTTPException(status_code=400, detail="No face detected in the image. Please ensure good lighting and face camera directly.")
    
    if len(faces) > 1:
        # If multiple, maybe pick the largest? But for registration, strict is better (security).
        # Let's check if the primary face is significantly larger/central?
        # For now, reject to be safe.
        raise HTTPException(status_code=400, detail="Multiple faces detected. Please ensure only you are in the photo.")

    # 4. Generate Embedding
    target_face = faces[0]
    
    # Optional: Check face quality/blurriness here? (Detector has some checks)
    
    # Crop the face (with padding)
    x, y, w, h = target_face['box']
    
    # Basic bounds check for cropping
    h_img, w_img = image.shape[:2]
    # Add minimal padding for embedding generation stability
    pad = int(w * 0.1)
    x1, y1 = max(0, x - pad), max(0, y - pad)
    x2, y2 = min(w_img, x + w + pad), min(h_img, y + h + pad)
    
    face_crop = image[y1:y2, x1:x2]
    
    embedding = embedding_service.generate_embedding(face_crop)
    
    if not embedding:
        raise HTTPException(status_code=500, detail="Failed to generate face embedding. Please try again.")

    # 5. Save to Database
    try:
        # Update the user document with the new embedding
        result = await db.db["users"].update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": {"embedding": embedding, "has_registered_face": True}}
        )
        
        if result.modified_count == 0:
            logger.warning(f"User {current_user.id} embedding update failed (might be same data)")
            
        logger.info(f"Registered face for user {current_user.email} ({current_user.id})")
        
        return {
            "message": "Face registered successfully",
            "user_id": str(current_user.id)
        }

    except Exception as e:
        logger.error(f"Database update error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error saving registration")


@router.post("/detect", status_code=status.HTTP_200_OK)
async def detect_faces_only(
    file: UploadFile = File(...)
):
    """
    Detect faces in an image and return bounding boxes.
    Used for frontend video overlay (drawing boxes on faces).
    """
    #Validate File Type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    #Read Image
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Could not decode image")
    #Detect Faces
    except Exception as e:
        logger.error(f"Error reading file: {e}")
        raise HTTPException(status_code=400, detail="Invalid image file")

    faces = detector.detect_faces(image)
    
    faces_data = []
    if len(faces) > 0:
        for face in faces:
    #Convert numpy types to native Python types for JSON
            box = [int(coord) for coord in face['box']]
            conf = float(face['confidence'])
            kps = {k: [int(coord) for coord in v] for k, v in face['keypoints'].items()}
            
            faces_data.append({
                "box": box,
                "confidence": conf,
                "keypoints": kps
            })
            
    return {
        "count": len(faces_data),
        "faces": faces_data
    }
