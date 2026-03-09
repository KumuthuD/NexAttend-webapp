from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class EmailLogBase(BaseModel):
    recipient_email: str
    subject: str
    template_used: str
    status: str
    error_message: Optional[str] = None


class EmailLogCreate(EmailLogBase):
    pass


class EmailLogResponse(EmailLogBase):
    id: str = Field(..., alias="_id")
    timestamp: datetime

    class Config:
        from_attributes = True
        populate_by_name = True
