from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import uuid4


class EmailLog(BaseModel):
    """
    Log of an email sent by the system.
    Tracks delivery status for auditing and debugging purposes.
    """
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    recipient_email: str = Field(..., description="The email address the message was sent to")
    subject: str = Field(..., description="Subject line of the email")
    template_used: str = Field(..., description="Name of the HTML template used (e.g. 'attendance_confirmation')")
    status: str = Field(..., description="Delivery status: 'sent' or 'failed'")
    error_message: Optional[str] = Field(None, description="Error details if status is 'failed'")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Time the email was processed")

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "recipient_email": "student@example.com",
                "subject": "Attendance Confirmed - NexAttend",
                "template_used": "attendance_confirmation",
                "status": "sent",
                "error_message": None,
                "timestamp": "2024-02-26T10:00:00Z"
            }
        }
