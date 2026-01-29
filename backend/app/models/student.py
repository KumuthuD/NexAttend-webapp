from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import uuid4

class Student(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    name: str = Field(..., min_length=2, max_length=100)
    roll_number: str = Field(..., unique=True)
    email: EmailStr
    course: str
    year: int
    
    # AI Face Recognition Data
    face_embedding_id: Optional[str] = None  # Reference to FaceEmbedding
    has_registered_face: bool = False
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "roll_number": "CS2024001",
                "email": "john.doe@example.com",
                "course": "Computer Science",
                "year": 3
            }
        }
