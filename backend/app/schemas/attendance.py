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

class AttendanceSessionBase(BaseModel):
    classroom_id: str
    session_date: datetime
    status: str = "active"

class AttendanceSessionCreate(AttendanceSessionBase):
    pass

class AttendanceSessionResponse(AttendanceSessionBase):
    id: str = Field(..., alias="_id")
    records: List[AttendanceRecordResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True
