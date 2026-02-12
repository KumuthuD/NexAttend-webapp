from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# Shared properties
class StudentBase(BaseModel):
    name: str
    roll_number: str
    email: EmailStr
    course: str
    year: int
    classroom_id: Optional[str] = None

# Properties to receive on registration
class StudentCreate(StudentBase):
    face_embedding: Optional[List[float]] = Field(None, description="128-dimensional face embedding vector")

# Properties to receive on update
class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    course: Optional[str] = None
    year: Optional[int] = None
    classroom_id: Optional[str] = None

# Properties to return via API
class StudentResponse(StudentBase):
    id: str = Field(..., alias="_id")
    has_registered_face: bool
    created_at: datetime
    
    class Config:
        populate_by_name = True
