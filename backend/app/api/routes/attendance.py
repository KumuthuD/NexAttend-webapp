from fastapi import APIRouter, HTTPException, status, Body, Depends
from app.database.mongodb import get_database
from app.models.attendance import AttendanceSession
from app.schemas.attendance import AttendanceStartRequest, AttendanceSessionResponse
from typing import Any

router = APIRouter()

@router.post("/start", response_model=AttendanceSessionResponse, status_code=status.HTTP_201_CREATED)
async def start_attendance(
    request: AttendanceStartRequest = Body(...),
    db: Any = Depends(get_database)
):
    """
    Start a new attendance session for a classroom.
    """
    # 1. Verify classroom exists
    classroom = await db["classrooms"].find_one({"_id": request.classroom_id})
    if not classroom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Classroom with ID {request.classroom_id} not found"
        )
    
    # 2. Check if there's already an active session for this classroom
    # (Optional: limit to one active session at a time)
    active_session = await db["attendance_sessions"].find_one({
        "classroom_id": request.classroom_id,
        "status": "active"
    })
    
    if active_session:
        # We can either return the existing session or raise an error.
        # Let's return the existing one if it's already active.
        return active_session

    # 3. Create new session
    session = AttendanceSession(classroom_id=request.classroom_id)
    
    await db["attendance_sessions"].insert_one(session.model_dump(by_alias=True))
    
    created_session = await db["attendance_sessions"].find_one({"_id": session.id})
    return created_session
