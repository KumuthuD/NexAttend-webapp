from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import Optional, Annotated
from datetime import datetime

# Helper for Pydantic v2 to handle ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    type: str = Field(pattern="^(class|meeting|deadline)$")
    color: Optional[str] = "bg-blue-500"

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    type: Optional[str] = None
    color: Optional[str] = None

class EventResponse(EventBase):
    id: PyObjectId = Field(..., alias="_id")
    user_id: str
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)
