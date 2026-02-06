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
from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from uuid import uuid4

class FaceEmbedding(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    student_id: str = Field(..., description="ID of the student this embedding belongs to")
    embedding: List[float] = Field(..., description="128-dimensional face embedding vector")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "student_id": "550e8400-e29b-41d4-a716-446655440000",
                "embedding": [0.1, -0.2, 0.5, "..."]
            }
        }
