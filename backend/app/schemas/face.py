from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

class FaceEmbeddingBase(BaseModel):
    student_id: str
    image_path: str

class FaceEmbeddingCreate(FaceEmbeddingBase):
    embedding: List[float]

class FaceEmbeddingUpdate(BaseModel):
    embedding: Optional[List[float]] = None
    image_path: Optional[str] = None

class FaceEmbeddingResponse(FaceEmbeddingBase):
    id: str
    embedding: List[float]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class FaceDetectionResult(BaseModel):
    box: List[int]
    confidence: float
    student_id: Optional[str] = None
    name: Optional[str] = None
    match_score: Optional[float] = None
