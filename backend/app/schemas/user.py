from pydantic import BaseModel, EmailStr, Field, ConfigDict, BeforeValidator
from typing import Optional, Annotated

# Helper for Pydantic v2 to handle ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

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
    id: PyObjectId = Field(..., alias="_id")
    full_name: str
    email: EmailStr
    role: str
    is_active: bool
    avatar: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    created_at: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "full_name": "Jane Doe",
                "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=JD",
                "date_of_birth": "1990-01-01",
                "gender": "Female"
            }
        }
    )

class UserLogin(BaseModel):
    email: EmailStr
    password: str

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "john@example.com",
                "password": "securepassword123"
            }
        }
    )

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
