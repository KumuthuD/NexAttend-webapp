from pydantic import BaseModel
from typing import List, Optional
from app.schemas.attendance import AttendanceMarkResponse

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
