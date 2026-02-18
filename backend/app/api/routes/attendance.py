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
    AttendanceBatchRecord,
    PaginatedHistoryResponse
)
from app.models.logs import RecognitionLog
from app.schemas.logs import RecognitionLogCreate, RecognitionLogResponse
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

    active_session = await db["attendance_sessions"].find_one({
        "classroom_id": request.classroom_id,
        "status": "active"
    })
    
    if active_session:

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

    # 4. Create Record
    record = AttendanceRecord(
        student_id=request.student_id,
        status="present",
        confidence=request.confidence,
        method=request.method,
        timestamp=datetime.utcnow()
    )
    
    # 5. Atomic Update with Duplicate Prevention
    result = await db["attendance_sessions"].update_one(
        {
            "_id": request.session_id,
            "status": "active",
            "present_student_ids": {"$ne": request.student_id}
        },
        {
            "$push": {"records": record.model_dump()},
            "$addToSet": {"present_student_ids": request.student_id}
        }
    )
    
    # If modified_count is 0, it means the student was already in the list
    if result.modified_count == 0:
        return {
            "message": "Attendance already marked",
            "student_name": student.get("full_name", "Unknown"),
            "status": "present",
            "timestamp": datetime.utcnow()
        }
    
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

@router.post("/logs", response_model=RecognitionLogResponse, status_code=status.HTTP_201_CREATED)
async def create_recognition_log(
    log_data: RecognitionLogCreate = Body(...),
    db: Any = Depends(get_database)
):
    """
    Log a recognition attempt (success, failure, etc.) for auditing.
    """
    # Create log entry
    log_entry = RecognitionLog(**log_data.model_dump())
    
    await db["recognition_logs"].insert_one(log_entry.model_dump(by_alias=True))
    
    created_log = await db["recognition_logs"].find_one({"_id": log_entry.id})
    return created_log


@router.get("/logs/{session_id}", response_model=List[RecognitionLogResponse])
async def get_session_logs(
    session_id: str,
    db: Any = Depends(get_database)
):
    """
    Retrieve all recognition logs for a specific session.
    """
    logs_cursor = db["recognition_logs"].find({"session_id": session_id}).sort("timestamp", -1)
    logs = await logs_cursor.to_list(length=1000)
    return logs


@router.get("/session/{session_id}", response_model=AttendanceSessionResponse)
async def get_session_results(
    session_id: str,
    db: Any = Depends(get_database)
):
    """
    Retrieve the results of a specific attendance session.
    """
    session = await db["attendance_sessions"].find_one({"_id": session_id})
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attendance session with ID {session_id} not found"
        )
    return session


@router.get("/classroom/{classroom_id}/history", response_model=PaginatedHistoryResponse)
async def get_classroom_attendance_history(
    classroom_id: str,
    page: int = 1,
    limit: int = 20,
    db: Any = Depends(get_database)
):
    """
    Retrieve attendance history for a specific classroom with pagination metadata.
    Returns paginated list of sessions sorted by date (newest first).
    """
    import math
    
    skip = (page - 1) * limit
    
    # Get total count
    total = await db["attendance_sessions"].count_documents({"classroom_id": classroom_id})
    
    cursor = db["attendance_sessions"].find({"classroom_id": classroom_id}).sort("session_date", -1)
    sessions = await cursor.skip(skip).limit(limit).to_list(length=limit)
    
    pages = math.ceil(total / limit) if limit > 0 else 0
    
    return {
        "items": sessions,
        "total": total,
        "page": page,
        "size": limit,
        "pages": pages
    }
