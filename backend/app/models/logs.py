from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import uuid4

class RecognitionLog(BaseModel):
    """
    Log of a face recognition attempt (success or failure).
    Useful for auditing and debugging.
    """
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    session_id: str = Field(..., description="Reference to AttendanceSession")
    student_id: Optional[str] = Field(None, description="Matched Student ID (if any)")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    confidence: float = Field(..., description="Confidence score of recognition")
    status: str = Field(..., description="Result status: 'success', 'low_confidence', 'spoof', 'unknown'")
    processing_time_ms: Optional[float] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "session_id": "session_123",
                "student_id": "student_456",
                "confidence": 0.85,
                "status": "success",
                "processing_time_ms": 150.5,
                "metadata": {"camera_id": "cam_01"}
            }
        }
