from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Any
from app.database.mongodb import get_database
from app.schemas.logs import AuditLogResponse

router = APIRouter()

@router.get("/attendance/{session_id}", response_model=List[AuditLogResponse])
async def get_session_audit_logs(
    session_id: str,
    db: Any = Depends(get_database)
):
    """
    Retrieve all audit logs related to a specific attendance session.
    """
    # Search for logs where target_id starts with session_id
    # Format used in integration: f"{session_id}_{student_id}"
    cursor = db["audit_logs"].find({
        "target_type": "attendance",
        "target_id": {"$regex": f"^{session_id}_"}
    }).sort("timestamp", -1)
    
    logs = await cursor.to_list(length=100)
    return logs

@router.get("/student/{student_id}", response_model=List[AuditLogResponse])
async def get_student_audit_logs(
    student_id: str,
    db: Any = Depends(get_database)
):
    """
    Retrieve all audit logs related to a specific student across all sessions.
    """
    cursor = db["audit_logs"].find({
        "target_type": "attendance",
        "target_id": {"$regex": f"_{student_id}$"}
    }).sort("timestamp", -1)
    
    logs = await cursor.to_list(length=100)
    return logs
