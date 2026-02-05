from fastapi import APIRouter, HTTPException, status, Body, UploadFile, File, Form
from typing import List, Optional
from pydantic import EmailStr
from app.database.mongodb import get_database
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentResponse, StudentUpdate
from app.models.face_embedding import FaceEmbedding
from app.services.face_detector import FaceDetector
from app.services.embedding_service import embedding_service
import numpy as np
import cv2
import logging

# Initialize logger
logger = logging.getLogger(__name__)

# Initialize Detector (Strict checks for registration)
detector = FaceDetector(min_face_size=50, min_confidence=0.95)

router = APIRouter()

@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(student: StudentCreate = Body(...)):
    """
    Register a new student (JSON-only version, mostly for testing).
    Expects pre-calculated embeddings or none.
    """
    db = await get_database()
    
    # Check if roll number or email already exists
    existing_student = await db["students"].find_one({
        "$or": [
            {"roll_number": student.roll_number},
            {"email": student.email}
        ]
    })
    
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student with this roll number or email already exists"
        )
    
    # Prepare student model
    student_data = student.model_dump(exclude={"face_embedding"})
    student_model = Student(**student_data)
    
    # Handle face embedding if provided
    face_embedding_id = None
    if student.face_embedding:
        face_embedding = FaceEmbedding(
            student_id=student_model.id,
            embedding=student.face_embedding
        )
        face_embedding_id = face_embedding.id
        await db["face_embeddings"].insert_one(face_embedding.model_dump(by_alias=True))
        student_model.face_embedding_id = face_embedding_id
        student_model.has_registered_face = True
    
    # Save student to database
    await db["students"].insert_one(student_model.model_dump(by_alias=True))
    created_student = await db["students"].find_one({"_id": student_model.id})
    return created_student

@router.post("/register", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def register_student(
    name: str = Form(...),
    roll_number: str = Form(...),
    email: EmailStr = Form(...),
    course: str = Form(...),
    year: int = Form(...),
    file: UploadFile = File(...)
):
    """
    Register a new student WITH Face (Multipart Integration).
    
    1. Validates unique student (email/roll_number).
    2. Validates & decodes the image.
    3. Detects face & generates embedding (AI).
    4. Saves Embedding document + Student document.
    """
    db = await get_database()
    
    # 1. Validation: Duplicates
    existing = await db["students"].find_one({
        "$or": [{"roll_number": roll_number}, {"email": email}]
    })
    if existing:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Student with this roll number or email already exists")

    # 2. Validation: Image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "File must be a valid image")
        
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Could not decode image")
    except Exception as e:
        logger.error(f"Image processing failed: {e}")
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid image data")

    # 3. AI Processing: Detection
    faces = detector.detect_faces(image)
    if not faces:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No face detected. Please use a clear photo.")
    if len(faces) > 1:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Multiple faces detected. Registration requires a single student.")
    
    # AI Processing: Embedding
    # Crop the face with padding
    x, y, w, h = faces[0]['box']
    h_img, w_img = image.shape[:2]
    pad = int(w * 0.1) # 10% padding
    x1, y1 = max(0, x - pad), max(0, y - pad)
    x2, y2 = min(w_img, x + w + pad), min(h_img, y + h + pad)
    
    face_crop = image[y1:y2, x1:x2]
    
    embedding = embedding_service.generate_embedding(face_crop)
    if not embedding:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Failed to generate face embedding")

    # 4. Save Data
    # Create Student Model (without embedding first)
    student_model = Student(
        name=name,
        roll_number=roll_number,
        email=email,
        course=course,
        year=year,
        has_registered_face=True # We just got it!
    )
    
    # Save Embedding Document
    face_emb_doc = FaceEmbedding(
        student_id=student_model.id,
        embedding=embedding
    )
    await db["face_embeddings"].insert_one(face_emb_doc.model_dump(by_alias=True))
    
    # Link and Save Student Document
    student_model.face_embedding_id = face_emb_doc.id
    await db["students"].insert_one(student_model.model_dump(by_alias=True))
    
    return await db["students"].find_one({"_id": student_model.id})

@router.get("/", response_model=List[StudentResponse])
async def list_students(skip: int = 0, limit: int = 100):
    """
    List all students with pagination.
    """
    db = await get_database()
    students = await db["students"].find().skip(skip).limit(limit).to_list(limit)
    return students

@router.get("/{id}", response_model=StudentResponse)
async def get_student(id: str):
    """
    Get a specific student by ID.
    """
    db = await get_database()
    student = await db["students"].find_one({"_id": id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.put("/{id}", response_model=StudentResponse)
async def update_student(id: str, student_update: StudentUpdate = Body(...)):
    """
    Update student details.
    """
    db = await get_database()
    
    # Filter out None values
    update_data = {k: v for k, v in student_update.model_dump().items() if v is not None}
    
    if len(update_data) >= 1:
        update_result = await db["students"].update_one(
            {"_id": id}, {"$set": update_data}
        )
        if update_result.modified_count == 0:
            existing = await db["students"].find_one({"_id": id})
            if not existing:
                 raise HTTPException(status_code=404, detail="Student not found to update")
    
    # Return updated student
    updated_student = await db["students"].find_one({"_id": id})
    if not updated_student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    return updated_student

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(id: str):
    """
    Delete a student.
    """
    db = await get_database()
    delete_result = await db["students"].delete_one({"_id": id})
    
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return
