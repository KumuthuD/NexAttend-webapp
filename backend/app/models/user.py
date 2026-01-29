from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

class UserModel(BaseModel):
    """
    User database model representation
    """
    id: Optional[str] = Field(default=None, alias="_id")
    email: EmailStr
    hashed_password: str
    full_name: str
    role: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "email": "teacher@example.com",
                "full_name": "John Doe",
                "role": "teacher",
                "is_active": True
            }
        }
