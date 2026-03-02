from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ClassroomBase(BaseModel):
    name: str
    course_code: str
    description: Optional[str] = None
    schedule: Optional[str] = None


class ClassroomCreate(ClassroomBase):
    """Schema for creating a classroom. access_code is auto-generated on the backend."""
    pass


class ClassroomUpdate(BaseModel):
    name: Optional[str] = None
    course_code: Optional[str] = None
    description: Optional[str] = None
    schedule: Optional[str] = None


class ClassroomResponse(ClassroomBase):
    id: str = Field(..., alias="_id")
    teacher_id: str
    access_code: str          # Always returned so teacher can see/share it
    student_count: int = 0
    student_ids: List[str] = []
    created_at: datetime

    class Config:
        populate_by_name = True


class JoinClassroomRequest(BaseModel):
    """Schema for a student joining a classroom via access code."""
    access_code: str


class JoinClassroomResponse(BaseModel):
    message: str
    classroom_id: str
    classroom_name: str


class AnnouncementBase(BaseModel):
    content: str


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementResponse(AnnouncementBase):
    id: str = Field(..., alias="_id")
    classroom_id: str
    teacher_id: str
    created_at: datetime
    teacher_name: Optional[str] = None

    class Config:
        populate_by_name = True
