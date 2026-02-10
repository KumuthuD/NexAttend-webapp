from fastapi import APIRouter, HTTPException, status, Body, Depends
from app.database.mongodb import get_database
from app.models.attendance import AttendanceSession, AttendanceRecord
from app.schemas.attendance import (
    AttendanceStartRequest, 
    AttendanceSessionResponse,
    AttendanceMarkRequest,
    AttendanceMarkResponse
)
from typing import Any
from datetime import datetime

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


@router.post("/mark", response_model=AttendanceMarkResponse)
async def mark_attendance(
    request: AttendanceMarkRequest = Body(...),
    db: Any = Depends(get_database)
):
    """
    Mark a student as present in an active session.
    """
    # 1. Verify Session exists and is active
    session = await db["attendance_sessions"].find_one({
        "_id": request.session_id,
        "status": "active"
    })
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active attendance session not found"
        )

    # 2. Verify Student exists
    student = await db["students"].find_one({"_id": request.student_id})
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {request.student_id} not found"
        )

    # 3. Check for Duplicate (Idempotency)
    # Check if student_id is already in present_student_ids
    if request.student_id in session.get("present_student_ids", []):
        return {
            "message": "Attendance already marked",
            "student_name": student.get("full_name", "Unknown"),
            "status": "present",
            "timestamp": datetime.utcnow() # Return current time or fetch from record
        }

    # 4. Create Record
    record = AttendanceRecord(
        student_id=request.student_id,
        status="present",
        confidence=request.confidence,
        method=request.method,
        timestamp=datetime.utcnow()
    )
    
    # 5. Atomic Update
    await db["attendance_sessions"].update_one(
        {"_id": request.session_id},
        {
            "$push": {"records": record.model_dump()},
            "$addToSet": {"present_student_ids": request.student_id}
        }
    )
    
    return {
        "message": "Attendance marked successfully",
        "student_name": student.get("full_name", "Unknown"),
        "status": "present",
        "timestamp": record.timestamp
    }
