from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ClassroomBase(BaseModel):
    name: str
    course_code: str
    description: Optional[str] = None
    schedule: Optional[str] = None

class ClassroomCreate(ClassroomBase):
    pass

class ClassroomUpdate(BaseModel):
    name: Optional[str] = None
    course_code: Optional[str] = None
    description: Optional[str] = None
    schedule: Optional[str] = None

class ClassroomResponse(ClassroomBase):
    id: str = Field(..., alias="_id")
    teacher_id: str
    student_count: int = 0
    created_at: datetime
    
    class Config:
        populate_by_name = True
