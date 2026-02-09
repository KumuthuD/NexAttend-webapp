from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AttendanceRecordBase(BaseModel):
    student_id: str
    status: str
    confidence: Optional[float] = None

class AttendanceRecordCreate(AttendanceRecordBase):
    pass

class AttendanceRecordResponse(AttendanceRecordBase):
    timestamp: datetime

    class Config:
        from_attributes = True
