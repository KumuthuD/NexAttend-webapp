from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class RecognitionLogCreate(BaseModel):
    session_id: str
    student_id: Optional[str] = None
    confidence: float
    status: str # 'success', 'low_confidence', 'spoof', 'unknown'
    processing_time_ms: Optional[float] = None
    metadata: Dict[str, Any] = {}

class RecognitionLogResponse(BaseModel):
    id: str = Field(..., alias="_id")
    session_id: str
    student_id: Optional[str] = None
    timestamp: datetime
    confidence: float
    status: str
    metadata: Dict[str, Any]

    class Config:
        from_attributes = True
        populate_by_name = True
