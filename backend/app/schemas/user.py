from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = "teacher"

    class Config:
        schema_extra = {
            "example": {
                "full_name": "John Doe",
                "email": "john@example.com",
                "password": "securepassword123",
                "role": "teacher"
            }
        }

class UserResponse(BaseModel):
    id: str = Field(..., alias="_id")
    full_name: str
    email: EmailStr
    role: str
    is_active: bool

    class Config:
        populate_by_name = True
