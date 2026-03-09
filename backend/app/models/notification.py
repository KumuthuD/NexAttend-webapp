from pydantic import BaseModel, ConfigDict, Field, BeforeValidator
from typing import Optional, Literal, Annotated
from datetime import datetime, timezone
from bson import ObjectId

# Helper for Pydantic v2 to handle ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class Notification(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    title: str
    message: str
    type: Literal["info", "success", "warning", "error"] = "info"
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={
            PyObjectId: str,
            datetime: lambda x: x.isoformat()
        }
    )
