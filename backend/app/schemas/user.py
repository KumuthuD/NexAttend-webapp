from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = "teacher"

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "full_name": "John Doe",
                "email": "john@example.com",
                "password": "securepassword123",
                "role": "teacher"
            }
        }
    )

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: str = Field(..., alias="_id")
    full_name: str
    email: EmailStr
    role: str
    is_active: bool

    model_config = ConfigDict(populate_by_name=True)
