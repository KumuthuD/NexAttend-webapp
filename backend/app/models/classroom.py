from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import uuid4

class Classroom(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    name: str = Field(..., description="e.g. CS101 - Intro to CS")
    course_code: str
    description: Optional[str] = None
    
    teacher_id: str  # Reference to User (Teacher)
    
    # List of enrolled student IDs
    student_ids: List[str] = []
    
    # Schedule (simplified for now)
    schedule: Optional[str] = Field(None, description="e.g. Mon 10:00 AM")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "Data Structures",
                "course_code": "CS201",
                "teacher_id": "user_12345",
                "description": "Advanced algorithms and data structures"
            }
        }
