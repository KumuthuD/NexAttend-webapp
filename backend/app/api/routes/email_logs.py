from fastapi import APIRouter, Depends, Query
from typing import List, Optional, Any
from app.database.mongodb import get_database
from app.schemas.email_log import EmailLogResponse

router = APIRouter()

@router.get("/", response_model=List[EmailLogResponse])
async def get_email_logs(
    recipient: Optional[str] = Query(None, description="Filter logs by recipient email"),
    limit: int = Query(100, ge=1, le=500),
    db: Any = Depends(get_database)
):
    """
    Retrieve system email logs for auditing and troubleshooting.
    Returns logs sorted by timestamp (newest first).
    """
    query = {}
    if recipient:
        query["recipient_email"] = recipient

    logs_cursor = db["email_logs"].find(query).sort("timestamp", -1).limit(limit)
    logs = await logs_cursor.to_list(length=limit)
    return logs
