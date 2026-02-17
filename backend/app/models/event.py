from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from typing import Optional, Annotated
from bson import ObjectId
from datetime import datetime

# Helper for Pydantic v2 to handle ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class Event(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    title: str = Field(...)
    description: Optional[str] = None
    start_time: datetime = Field(...)
    end_time: datetime = Field(...)
    location: Optional[str] = None
    type: str = Field(pattern="^(class|meeting|deadline)$")
    color: str = Field(default="bg-blue-500")
    user_id: str = Field(...)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                "title": "Math Class",
                "start_time": "2024-03-20T10:00:00",
                "end_time": "2024-03-20T11:30:00",
                "type": "class",
                "user_id": "user_object_id"
            }
        }
    )
