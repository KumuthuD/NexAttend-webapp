from fastapi import APIRouter, HTTPException, status, Body, Depends
from app.database.mongodb import get_database
from app.models.attendance import AttendanceSession, AttendanceRecord
from app.schemas.all_attendance import (
    AttendanceStartRequest, 
    AttendanceSessionResponse,
    AttendanceMarkRequest,
    AttendanceMarkResponse,
    AttendanceBatchMarkRequest,
    AttendanceBatchMarkResponse,
    AttendanceBatchRecord
)
from typing import Any, List
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

@router.post("/batch-mark", response_model=AttendanceBatchMarkResponse)
async def batch_mark_attendance(
    request: AttendanceBatchMarkRequest,
    db: Any = Depends(get_database)
):
    """
    Mark attendance for multiple students in a single active session.
    Efficient for multi-face recognition scenarios.
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
        
    present_student_ids = set(session.get("present_student_ids", []))
    results = []
    new_records = []
    new_student_ids = []
    
    marked_count = 0
    skipped_count = 0
    
    # 2. Process each student
    # distinct validation/error handling for partial success
    failed_ids = []
    
    for student_req in request.students:
        student_id = student_req.student_id
        
        # Verify student exists (in batch scenarios, we might want to verify)
        # For now, let's do a quick check if strict mode. 
        # But for speed, we'll assume the recognition service sends valid IDs.
        # If we really want to verify, we should do:
        # student = await db["students"].find_one({"_id": student_id})
        # if not student:
        #     failed_ids.append(student_id)
        #     continue

        # Check duplicate in current request or DB
        if student_id in present_student_ids or student_id in new_student_ids:
            skipped_count += 1
            continue
            
        record = AttendanceRecord(
            student_id=student_id,
            status="present",
            confidence=student_req.confidence,
            method=student_req.method,
            timestamp=datetime.utcnow()
        )
        
        new_records.append(record.model_dump())
        new_student_ids.append(student_id)
        
        results.append({
            "message": "Marked in batch",
            "student_name": "Batch Processed", 
            "status": "present",
            "timestamp": record.timestamp
        })
        marked_count += 1

    # 3. Bulk Update
    if new_records:
        try:
            await db["attendance_sessions"].update_one(
                {"_id": request.session_id},
                {
                    "$push": {"records": {"$each": new_records}},
                    "$addToSet": {"present_student_ids": {"$each": new_student_ids}}
                }
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating batch records: {str(e)}"
            )
        
    return {
        "message": f"Batch process complete. Marked {marked_count}, Skipped {skipped_count}",
        "marked_count": marked_count,
        "skipped_count": skipped_count,
        "results": results
    }
