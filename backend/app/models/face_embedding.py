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
