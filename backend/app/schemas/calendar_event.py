from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CalendarEventCreate(BaseModel):
    title: str
    date: str  # YYYY-MM-DD
    start_time: str  # HH:MM
    end_time: str  # HH:MM
    location: Optional[str] = None
    type: str = "class"  # class | meeting | deadline
    color: Optional[str] = None


class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    color: Optional[str] = None


class CalendarEventResponse(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    title: str
    date: str
    start_time: str
    end_time: str
    location: Optional[str] = None
    type: str
    color: str
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
