import secrets
import string
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import uuid4


def generate_access_code(length: int = 6) -> str:
    """Generate a random uppercase alphanumeric access code."""
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


class Classroom(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    name: str = Field(..., description="e.g. CS101 - Intro to CS")
    course_code: str
    description: Optional[str] = None

    teacher_id: str  # Reference to User (Teacher)

    # Unique access code students use to join
    access_code: str = Field(default_factory=generate_access_code)

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
