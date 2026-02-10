from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AttendanceStartRequest(BaseModel):
    classroom_id: str

class AttendanceRecordBase(BaseModel):
    student_id: str
    status: str
    confidence: Optional[float] = None

class AttendanceRecordCreate(AttendanceRecordBase):
    pass

class AttendanceRecordResponse(AttendanceRecordBase):
    timestamp: datetime
    method: str = "face"

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
    present_student_ids: List[str] = []
    records: List[AttendanceRecordResponse] = []
    start_time: datetime
    end_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True
