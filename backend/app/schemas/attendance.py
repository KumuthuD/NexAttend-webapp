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

class AttendanceStartRequest(BaseModel):
    classroom_id: str

class AttendanceMarkRequest(BaseModel):
    session_id: str
    student_id: str
    confidence: Optional[float] = None
    method: str = "face" # face, manual

class AttendanceMarkResponse(BaseModel):
    message: str
    student_name: str
    status: str
    timestamp: datetime

class AttendanceUpdateRequest(BaseModel):
    """
    Request model for manual attendance status updates (Day 26/27).
    """
    session_id: str
    student_id: str
    new_status: str = Field(..., description="Target status: present, absent, excused")
    reason: Optional[str] = Field(None, description="Reason for manual override")

class AttendanceSessionResponse(AttendanceSessionBase):
    id: Optional[str] = Field(None, alias="_id")
    present_student_ids: List[str] = []
    records: List[AttendanceRecordResponse] = []
    start_time: datetime
    end_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

