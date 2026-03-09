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

class AuditLogCreate(BaseModel):
    target_type: str
    target_id: str
    changed_by: str
    old_value: Dict[str, Any] = {}
    new_value: Dict[str, Any] = {}
    reason: Optional[str] = None

class AuditLogResponse(BaseModel):
    id: str = Field(..., alias="_id")
    target_type: str
    target_id: str
    changed_by: str
    old_value: Dict[str, Any]
    new_value: Dict[str, Any]
    reason: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True
        populate_by_name = True
