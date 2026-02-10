from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AttendanceStartRequest(BaseModel):
    classroom_id: str

class AttendanceRecordResponse(BaseModel):
    student_id: str
    timestamp: datetime
    confidence: float
    method: str

class AttendanceSessionResponse(BaseModel):
    id: str = Field(..., alias="_id")
    classroom_id: str
    session_date: datetime
    status: str
    present_student_ids: List[str]
    start_time: datetime
    end_time: Optional[datetime] = None

    class Config:
        populate_by_name = True
