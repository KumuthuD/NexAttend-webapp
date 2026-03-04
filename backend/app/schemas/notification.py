from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class NotificationCreate(BaseModel):
    user_id: str
    title: str 
    message: str
    type: Literal["info", "success", "warning", "error"] = "info"

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: Literal["info", "success", "warning", "error"]
    read: bool
    created_at: datetime

    class Config:
        populate_by_name = True
