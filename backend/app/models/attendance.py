from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import uuid4

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

class AttendanceSession(BaseModel):
    """
    Represents an attendance session for a specific classroom.
    """
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    classroom_id: str = Field(..., description="Reference to Classroom ID")
    session_date: datetime = Field(default_factory=datetime.utcnow)
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    status: str = Field("active", description="Session status (active, completed)")
    records: List[AttendanceRecord] = Field(default_factory=list)
    present_student_ids: List[str] = Field(default_factory=list)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "classroom_id": "classroom_uuid_456",
                "session_date": "2024-02-09T10:00:00Z",
                "status": "active",
                "records": []
            }
        }
