from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict
from datetime import datetime

class ClassroomProgress(BaseModel):
    motivation_score: float = 0.0
    unlocked_badges: List[str] = []

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
    id: Optional[str] = Field(None, alias="_id")
    has_registered_face: bool = False
    is_active: bool = True
    classroom_progress: Dict[str, ClassroomProgress] = {}
    created_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True

class StudentAttendanceHistoryItem(BaseModel):
    session_id: str
    classroom_id: str
    classroom_name: str = "Unknown Classroom"
    session_date: datetime = Field(default_factory=datetime.utcnow)
    attendance_status: str = "absent" # present, absent, late
    timestamp: Optional[datetime] = None
    confidence: Optional[float] = None

class StudentAttendanceHistory(BaseModel):
    student_id: str
    student_name: str = "Unknown Student"
    total_sessions: int = 0
    present_count: int = 0
    attendance_percentage: float = 0.0
    history: List[StudentAttendanceHistoryItem] = Field(default_factory=list)
