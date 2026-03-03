from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import uuid4


class CalendarEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    user_id: str  # Owner – teacher or student
    title: str
    date: str  # ISO date YYYY-MM-DD
    start_time: str  # e.g. "09:00"
    end_time: str  # e.g. "10:00"
    location: Optional[str] = None
    type: str = "class"  # class | meeting | deadline
    color: str = "border-violet-500 bg-violet-50 dark:bg-violet-500/10"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "title": "Data Structures Lecture",
                "date": "2026-03-10",
                "start_time": "09:00",
                "end_time": "10:30",
                "location": "Room 201",
                "type": "class",
            }
        }
