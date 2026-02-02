from pydantic import BaseModel, Field, EmailStr, BeforeValidator
from typing import Optional, Annotated
from bson import ObjectId

# Helper for Pydantic v2 to handle ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class User(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    full_name: str = Field(...)
    email: EmailStr = Field(...)
    password_hash: str = Field(...)
    role: str = Field(default="teacher")  # admin, teacher
    is_active: bool = Field(default=True)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "full_name": "John Doe",
                "email": "teacher@example.com",
                "role": "teacher",
                "is_active": True
            }
        }
