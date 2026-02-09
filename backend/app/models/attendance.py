from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AttendanceRecord(BaseModel):
    """
    Represents an individual student's attendance record within a session.
    """
    student_id: str = Field(..., description="ID of the student (UUID)")
    status: str = Field(..., description="Attendance status (present, absent, late)")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    confidence: Optional[float] = Field(None, description="AI confidence score for face recognition")

    class Config:
        json_schema_extra = {
            "example": {
                "student_id": "student_uuid_123",
                "status": "present",
                "timestamp": "2024-02-09T10:00:00Z",
                "confidence": 0.98
            }
        }
