from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import uuid4

class AttendanceRecord(BaseModel):
    student_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    confidence: float = 1.0
    method: str = "face" # face, manual

class AttendanceSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    classroom_id: str
    session_date: datetime = Field(default_factory=datetime.utcnow)
    status: str = "active" # active, completed
    
    # List of student IDs marked present
    present_student_ids: List[str] = []
    
    # Full records with timestamps and confidence
    records: List[AttendanceRecord] = []
    
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "classroom_id": "class_123",
                "session_date": "2024-02-10T09:00:00",
                "status": "active",
                "present_student_ids": []
            }
        }
