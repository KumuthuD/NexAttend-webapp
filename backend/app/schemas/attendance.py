from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

class AttendanceRecordBase(BaseModel):
    student_id: str
    status: str
    confidence: Optional[float] = None

class AttendanceRecordCreate(AttendanceRecordBase):
    pass

class AttendanceRecordResponse(AttendanceRecordBase):
    model_config = ConfigDict(from_attributes=True)
    timestamp: datetime

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

class AttendanceSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    id: str = Field(..., alias="_id")
    classroom_id: str
    session_date: datetime
    status: str
    present_student_ids: List[str] = []
    records: List[AttendanceRecordResponse] = []
    start_time: datetime
    end_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
