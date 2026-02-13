from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class AttendanceRecordResponse(BaseModel):
    student_id: str
    status: str
    timestamp: datetime
    confidence: Optional[float] = None

class AttendanceSessionResponse(BaseModel):
    classroom_id: str
    session_date: datetime
    status: str
    id: str = Field(..., alias="_id")
    present_student_ids: List[str] = []
    records: List[AttendanceRecordResponse] = []
    start_time: datetime
    end_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

data = {
    "_id": "sess_123",
    "id": "sess_123",
    "classroom_id": "class_123",
    "session_date": datetime.utcnow(),
    "status": "active",
    "present_student_ids": ["student_1"],
    "records": [
        {"student_id": "student_1", "status": "present", "timestamp": datetime.utcnow()}
    ],
    "start_time": datetime.utcnow(),
    "end_time": None,
    "created_at": datetime.utcnow(),
    "updated_at": datetime.utcnow()
}

try:
    obj = AttendanceSessionResponse(**data)
    print("✅ Success!")
    print(f"Object ID: {obj.id}")
except Exception as e:
    print(f"❌ Failed: {e}")
