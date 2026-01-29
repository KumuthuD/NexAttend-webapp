from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.STUDENT
    is_active: bool = True

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None

# Properties stored in DB
class UserInDBBase(UserBase):
    id: Optional[str] = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Config:
        populate_by_name = True

# Properties to return to client
class User(UserInDBBase):
    pass

# Additional properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str
