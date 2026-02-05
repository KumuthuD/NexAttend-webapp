from fastapi import APIRouter, HTTPException, status, Body
from typing import List
from app.database.mongodb import get_database
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentResponse, StudentUpdate

from app.models.face_embedding import FaceEmbedding

router = APIRouter()

@router.post("/", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(student: StudentCreate = Body(...)):
    """
    Register a new student.
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
async def register_student(student: StudentCreate = Body(...)):
    """
    Register a new student with face data.
    """
    return await create_student(student)

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
