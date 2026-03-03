from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AttendanceRecordBase(BaseModel):
    student_id: str
    status: str
    confidence: Optional[float] = None
    is_flagged: bool = False
    flag_reason: Optional[str] = None

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

class AttendanceStartRequest(BaseModel):
    classroom_id: str

class AttendanceBatchRecord(BaseModel):
    """
    Individual student item in a batch request.
    Does not need session_id as it's in the parent request.
    """
    student_id: str
    confidence: Optional[float] = None
    method: str = "face"

class AttendanceBatchMarkRequest(BaseModel):
    """
    Request model for marking attendance for multiple students at once.
    """
    session_id: str
    students: List[AttendanceBatchRecord] 

class AttendanceBatchMarkResponse(BaseModel):
    """
    Response model for batch attendance marking.
    """
    message: str
    marked_count: int
    skipped_count: int
    results: List[AttendanceMarkResponse]

class PaginatedHistoryResponse(BaseModel):
    items: List[AttendanceSessionResponse]
    total: int
    page: int
    size: int
    pages: int
