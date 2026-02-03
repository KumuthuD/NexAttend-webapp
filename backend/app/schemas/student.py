from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# Shared properties
class StudentBase(BaseModel):
    name: str
    roll_number: str
    email: EmailStr
    course: str
    year: int

# Properties to receive on registration
class StudentCreate(StudentBase):
    pass

# Properties to receive on update
class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    course: Optional[str] = None
    year: Optional[int] = None

# Properties to return via API
class StudentResponse(StudentBase):
    id: str = Field(..., alias="_id")
    has_registered_face: bool
    created_at: datetime
    
    class Config:
        populate_by_name = True
