from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import Optional, List, Annotated
from datetime import datetime
from bson import ObjectId

# Helper for Pydantic v2 to handle ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class FaceEmbedding(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    student_id: PyObjectId = Field(...)
    embedding: List[float] = Field(..., description="128 or 512 dimensional face vector")
    image_path: str = Field(..., description="Path to the stored face image used to generate this embedding")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                "student_id": "507f1f77bcf86cd799439011",
                "embedding": [0.12, -0.45, 0.89, "..."],
                "image_path": "/data/face_images/student_123.jpg",
                "created_at": "2024-02-05T12:00:00Z"
            }
        }
    )
