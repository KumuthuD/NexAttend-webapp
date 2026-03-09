from fastapi import APIRouter, HTTPException, status, Body, Depends, BackgroundTasks
from app.database.mongodb import get_database
from app.services.anomaly_service import check_anomaly
from app.services.email_service import email_service
from app.models.attendance import AttendanceSession, AttendanceRecord
from app.schemas.all_attendance import (
    AttendanceStartRequest, 
    AttendanceSessionResponse,
    AttendanceMarkRequest,
    AttendanceMarkResponse,
    AttendanceBatchMarkRequest,
    AttendanceBatchMarkResponse,
    AttendanceBatchRecord,
    PaginatedHistoryResponse,
    AttendanceUpdateRequest,
    PaginatedFlaggedResponse
)
from app.models.logs import RecognitionLog, AuditLog
from app.schemas.logs import RecognitionLogCreate, RecognitionLogResponse, AuditLogCreate, AuditLogResponse
from app.services.audit_service import audit_service

from app.schemas.attendance import AttendanceUpdateRequest, AttendanceReviewRequest
from app.models.notification import Notification
from typing import Any, List, Optional
from datetime import datetime
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)


async def _find_user_or_student(db: Any, user_id: str):
    """
    Look up a user by ID — tries 'users' collection first (where face-registered
    students live), falls back to 'students' for backwards compatibility.
    Handles both string and ObjectId _id formats.
    """
    # Try users collection with ObjectId
    try:
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        if user:
            return user
    except Exception:
        pass

    # Try users collection with string _id
    user = await db["users"].find_one({"_id": user_id})
    if user:
        return user

    # Fallback to students collection
    student = await db["students"].find_one({"_id": user_id})
    return student

async def send_attendance_emails(db: Any, classroom_id: str, student_ids: List[str], session_time: datetime):
    """
    Background task to fetch student/classroom details and send confirmation emails.
    """
    # 1. Get classroom name
    classroom = await db["classrooms"].find_one({"_id": classroom_id})
    class_name = classroom.get("course_name", classroom.get("name", "Unknown Class")) if classroom else "Unknown Class"
    
    # 2. Format date
    date_str = session_time.strftime("%B %d, %Y at %I:%M %p")
    
    # 3. Fetch users and send emails
    # Try users collection first (ObjectId), then students as fallback
    for sid in student_ids:
        user = await _find_user_or_student(db, sid)
        if user and user.get("email") and user.get("email_notifications", True):
            await email_service.send_attendance_confirmation(
                email=user["email"],
                student_name=user.get("full_name", user.get("name", "Student")),
                class_name=class_name,
                date_time=date_str
            )
        
        # Also create in-app notification
        notification = Notification(
            user_id=sid,
            title="Attendance Marked",
            message=f"Your attendance was marked for {class_name} on {date_str}.",
            type="info"
        )
        await db["notifications"].insert_one(notification.model_dump(by_alias=True))

async def update_motivation_scores(db: Any, classroom_id: str, student_ids: List[str]):
    """
    Background task to update motivation scores and check for newly unlocked badges.
    """
    if not student_ids:
        return
        
    score_key = f"classroom_progress.{classroom_id}.motivation_score"
    badges_key = f"classroom_progress.{classroom_id}.unlocked_badges"
    
    # Milestone thresholds
    milestones = [
        (7.0, "Perfect"),
        (5.5, "Gold"),
        (4.0, "Silver"),
        (2.5, "Bronze"),
        (0.5, "Starter")
    ]
    
    try:
        # 1. Atomic bulk increment (+0.5 per student) 
        await db["students"].update_many(
            {"_id": {"$in": student_ids}},
            {"$inc": {score_key: 0.5}}
        )
        
        # 2. Fetch updated scores to check for new badges
        updated_students_cursor = db["students"].find(
            {"_id": {"$in": student_ids}},
            {"_id": 1, "classroom_progress": 1}
        )
        
        # We need individual bulk writes for badge updates as they depend on the student's specific new score
        from pymongo import UpdateOne
        bulk_operations = []
        
        async for student in updated_students_cursor:
            progress = student.get("classroom_progress", {}).get(classroom_id, {})
            current_score = progress.get("motivation_score", 0.0)
            existing_badges = set(progress.get("unlocked_badges", []))
            
            new_badges_to_award = []
            for threshold, badge_name in milestones:
                if current_score >= threshold and badge_name not in existing_badges:
                    new_badges_to_award.append(badge_name)
                    
            if new_badges_to_award:
                bulk_operations.append(
                    UpdateOne(
                        {"_id": student["_id"]},
                        {"$addToSet": {badges_key: {"$each": new_badges_to_award}}}
                    )
                )
                
        if bulk_operations:
            await db["students"].bulk_write(bulk_operations)
            
    except Exception as e:
        import logging
        logging.error(f"Error updating motivation scores: {str(e)}")
router = APIRouter()


# ── GET /flagged — Fetch all attendance records for the review page ─────────
@router.get("/flagged")
async def get_flagged_records(
    classroom_id: Optional[str] = None,
    session_id: Optional[str] = None,
    db: Any = Depends(get_database)
):
    """
    Fetch all attendance records across sessions for the Attendance Review page.
    Each student who was in a session gets a record. Enriched with student name
    and 8-digit student_id from the users collection.
    """
    # 1. Build query
    query = {}
    if classroom_id:
        query["classroom_id"] = classroom_id
    if session_id:
        query["_id"] = session_id

    # 2. Fetch sessions (most recent first)
    sessions = await db["attendance_sessions"].find(query).sort("session_date", -1).to_list(length=200)

    # 3. Collect all unique student IDs from records + present lists
    all_student_ids = set()
    for session in sessions:
        for record in session.get("records", []):
            all_student_ids.add(record.get("student_id"))
        for sid in session.get("present_student_ids", []):
            all_student_ids.add(sid)

    # 4. Bulk-fetch student info from users collection
    student_map = {}
    for sid in all_student_ids:
        if not sid:
            continue
        user = await _find_user_or_student(db, sid)
        if user:
            student_map[sid] = {
                "name": user.get("full_name", user.get("name", "Unknown")),
                "student_id": user.get("student_id", ""),  # 8-digit ID
            }

    # 5. Fetch classroom names
    classroom_ids = list(set(s.get("classroom_id") for s in sessions if s.get("classroom_id")))
    classroom_map = {}
    for cid in classroom_ids:
        cls = await db["classrooms"].find_one({"_id": cid})
        if cls:
            classroom_map[cid] = cls.get("name", "Unknown Classroom")

    # 6. Build flat list of records
    results = []
    for session in sessions:
        session_id = session.get("_id", "")
        classroom_name = classroom_map.get(session.get("classroom_id", ""), "Unknown Classroom")
        session_date = session.get("session_date", datetime.utcnow()).isoformat() if session.get("session_date") else datetime.utcnow().isoformat()

        # Get all student IDs in this session (from records + present list)
        session_student_ids = set()
        records_by_student = {}
        for record in session.get("records", []):
            sid = record.get("student_id")
            if sid:
                session_student_ids.add(sid)
                records_by_student[sid] = record

        # Also include students in present list who may not have explicit records
        for sid in session.get("present_student_ids", []):
            session_student_ids.add(sid)

        for sid in session_student_ids:
            info = student_map.get(sid, {"name": "Unknown", "student_id": ""})
            record = records_by_student.get(sid, {})

            confidence = record.get("confidence", 0)
            if confidence is None:
                confidence = 0
            # Convert from 0-1 to 0-100 if needed
            if isinstance(confidence, float) and confidence <= 1.0 and confidence > 0:
                confidence = round(confidence * 100)

            is_flagged = record.get("is_flagged", False)
            flag_reason = record.get("flag_reason", "")
            review_status = record.get("review_status", "pending")

            # Determine status
            if confidence >= 60:
                status_val = "approved"
            elif confidence == 0 and sid not in [r.get("student_id") for r in session.get("records", [])]:
                status_val = "rejected"
            else:
                status_val = review_status

            results.append({
                "id": f"{session_id}_{sid}",
                "student_name": info["name"],
                "student_id": info["student_id"],  # 8-digit ID
                "classroom_name": classroom_name,
                "session_date": session_date,
                "confidence": confidence,
                "status": status_val,
                "flagged_reason": flag_reason or ("Clear match" if confidence >= 60 else "Low confidence" if confidence > 0 else "No face detected"),
            })

    return results


# ── PUT /flagged/{record_id} — Approve/reject a record ─────────────────────
@router.put("/flagged/{record_id}")
async def update_flagged_record_endpoint(
    record_id: str,
    body: dict = Body(...),
    db: Any = Depends(get_database)
):
    """
    Approve or reject an attendance record from the review page.
    record_id format: {session_id}_{student_id}
    """
    parts = record_id.split("_", 1)
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Invalid record ID format")

    session_id, student_id = parts
    action = body.get("action", "approve")

    now = datetime.utcnow()

    if action == "approve":
        # Mark as present with full confidence
        result = await db["attendance_sessions"].update_one(
            {"_id": session_id, "records.student_id": student_id},
            {
                "$set": {
                    "records.$.review_status": "approved",
                    "records.$.is_flagged": False,
                    "records.$.confidence": 1.0,
                    "records.$.status": "present",
                    "updated_at": now
                },
                "$addToSet": {"present_student_ids": student_id}
            }
        )
    else:
        # Reject
        result = await db["attendance_sessions"].update_one(
            {"_id": session_id, "records.student_id": student_id},
            {
                "$set": {
                    "records.$.review_status": "rejected",
                    "records.$.is_flagged": True,
                    "records.$.status": "absent",
                    "updated_at": now
                },
                "$pull": {"present_student_ids": student_id}
            }
        )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")

    return {"message": f"Record {action}d successfully"}

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
    background_tasks: BackgroundTasks,
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

    # 2. Verify Student/User exists (check users collection first, then students)
    student = await _find_user_or_student(db, request.student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {request.student_id} not found"
        )

    # 4. Create Record
    anomaly = check_anomaly(request.confidence or 0.0, request.student_id)
    record = AttendanceRecord(
        student_id=request.student_id,
        status="present",
        confidence=request.confidence,
        is_flagged=anomaly["is_flagged"],
        flag_reason=anomaly["flag_reason"],
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
        
    try:
        if student.get("email") and student.get("email_notifications", True):
            classroom = await db["classrooms"].find_one({"_id": session.get("classroom_id")})
            classroom_name = classroom.get("course_name", classroom.get("name", "Your Classroom")) if classroom else "Your Classroom"
            date_time = datetime.utcnow()
            background_tasks.add_task(
                email_service.send_attendance_confirmation,
                student["email"],
                student.get("full_name", student.get("name", "Student")),
                classroom_name,
                date_time
            )
            
            # Create notification
            date_str = date_time.strftime("%B %d, %Y at %I:%M %p")
            notification = Notification(
                user_id=request.student_id,
                title="Attendance Marked",
                message=f"Your attendance was marked for {classroom_name} on {date_str}.",
                type="info"
            )
            await db["notifications"].insert_one(notification.model_dump(by_alias=True))
    except Exception as e:
        pass
        
    try:
        # Also trigger motivation score update for manual/single overrides
        background_tasks.add_task(
            update_motivation_scores,
            db,
            session["classroom_id"],
            [request.student_id]
        )
    except Exception as e:
        pass
    
    return {
        "message": "Attendance marked successfully",
        "student_name": student.get("full_name", "Unknown"),
        "status": "present",
        "timestamp": record.timestamp
    }

@router.post("/batch-mark", response_model=AttendanceBatchMarkResponse)
async def batch_mark_attendance(
    background_tasks: BackgroundTasks,
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
            
        anomaly = check_anomaly(student_req.confidence or 0.0, student_id)
        record = AttendanceRecord(
            student_id=student_id,
            status="present",
            confidence=student_req.confidence,
            is_flagged=anomaly["is_flagged"],
            flag_reason=anomaly["flag_reason"],
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
            
        try:
            if new_student_ids:
                # Look up users from 'users' collection (where face-registered students live)
                students = []
                for sid in new_student_ids:
                    u = await _find_user_or_student(db, sid)
                    if u:
                        students.append(u)
                classroom = await db["classrooms"].find_one({"_id": session.get("classroom_id")})
                classroom_name = classroom.get("course_name", classroom.get("name", "Your Classroom")) if classroom else "Your Classroom"
                date_time = datetime.utcnow()
                date_str = date_time.strftime("%B %d, %Y at %I:%M %p")
                
                for student in students:
                    if student.get("email") and student.get("email_notifications", True):
                        background_tasks.add_task(
                            email_service.send_attendance_confirmation,
                            student["email"],
                            student.get("full_name", student.get("name", "Student")),
                            classroom_name,
                            date_time
                        )
                        
                    # Create notification
                    notification = Notification(
                        user_id=str(student.get("_id")),
                        title="Attendance Marked",
                        message=f"Your attendance was marked for {classroom_name} on {date_str}.",
                        type="info"
                    )
                    await db["notifications"].insert_one(notification.model_dump(by_alias=True))
        except Exception as e:
            pass
            
        try:
            # Trigger motivation score update for batch overrides
            if new_student_ids:
                background_tasks.add_task(
                    update_motivation_scores,
                    db,
                    session["classroom_id"],
                    new_student_ids
                )
        except Exception as e:
            pass
        
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


@router.post("/close/{session_id}", response_model=AttendanceSessionResponse)
async def close_attendance_session(
    session_id: str,
    background_tasks: BackgroundTasks,
    db: Any = Depends(get_database)
):
    """
    Close an active attendance session by marking it as completed.
    Sets end_time to the current UTC time and updates status to 'completed'.
    """
    # 1. Verify session exists and is still active
    session = await db["attendance_sessions"].find_one({
        "_id": session_id,
        "status": "active"
    })

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active attendance session found with ID {session_id}"
        )

    end_time = datetime.utcnow()

    # 2. Mark session as completed
    await db["attendance_sessions"].update_one(
        {"_id": session_id},
        {
            "$set": {
                "status": "completed",
                "end_time": end_time,
                "updated_at": end_time
            }
        }
    )
    
    # 3. Trigger confirmation emails and motivation score updates in background
    if session.get("present_student_ids"):
        background_tasks.add_task(
            send_attendance_emails, 
            db, 
            session["classroom_id"], 
            session["present_student_ids"],
            session.get("session_date", datetime.utcnow())
        )
        background_tasks.add_task(
            update_motivation_scores,
            db,
            session["classroom_id"],
            session["present_student_ids"]
        )

    # 4. Return the updated session document
    updated_session = await db["attendance_sessions"].find_one({"_id": session_id})
    return updated_session


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

@router.post("/update")
async def update_attendance(
    background_tasks: BackgroundTasks,
    request: AttendanceUpdateRequest = Body(...),
    db: Any = Depends(get_database)
):
    """
    Manual attendance status update (Day 26/27).
    
    Allows teachers to manually override a student's attendance status.
    - If status is 'present', it increments motivation scores.
    - Records an audit log entry for the change (Commit 4).
    """
    # 1. Verify Session exists
    session = await db["attendance_sessions"].find_one({"_id": request.session_id})
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attendance session {request.session_id} not found"
        )
    
    # 2. Verify Student exists
    student = await _find_user_or_student(db, request.student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student {request.student_id} not found"
        )

    # 3. Get old status for auditing
    old_status = "unknown"
    for record in session.get("records", []):
        if record.get("student_id") == request.student_id:
            old_status = record.get("status", "unknown")
            break

    # 4. Perform atomic update
    try:
        now = datetime.utcnow()
        
        # Helper for present_student_ids list
        if request.new_status == "present":
            array_op = {"$addToSet": {"present_student_ids": request.student_id}}
        else:
            array_op = {"$pull": {"present_student_ids": request.student_id}}

        # Step 1: Try to update an existing record in the array
        result = await db["attendance_sessions"].update_one(
            {"_id": request.session_id, "records.student_id": request.student_id},
            {
                "$set": {
                    "records.$.status": request.new_status,
                    "records.$.timestamp": now,
                    "records.$.method": "manual",
                    "updated_at": now
                },
                **array_op
            }
        )

        # Step 2: If no existing record was found (e.g. marking a previously absent student)
        # Step 2: If no existing record was found, push a new one
        if result.matched_count == 0:
            new_record = {
                "student_id": request.student_id,
                "status": request.new_status,
                "timestamp": now,
                "method": "manual"
            }
            await db["attendance_sessions"].update_one(
                {"_id": request.session_id},
                {
                    "$push": {"records": new_record},
                    "$set": {"updated_at": now},
                    **array_op
                }
            )

        # 5. INTEGRATION: Record Audit Log (Commit 4)
        # Note: In a real app, changed_by would come from the auth token
        background_tasks.add_task(
            audit_service.log_change,
            db,
            target_type="attendance",
            target_id=f"{request.session_id}_{request.student_id}",
            changed_by="admin_teacher", # Placeholder for auth implementation
            old_value={"status": old_status},
            new_value={"status": request.new_status},
            reason=request.reason
        )

        # 6. Trigger motivation score update if marked present
        if request.new_status == "present" and old_status != "present":
            background_tasks.add_task(
                update_motivation_scores,
                db,
                session["classroom_id"],
                [request.student_id]
            )

        # 7. Return the updated session
        updated_session = await db["attendance_sessions"].find_one({"_id": request.session_id})
        return {
            "message": f"Attendance successfully updated to {request.new_status}",
            "student_name": student.get("full_name", student.get("name", "Student")),
            "session": updated_session
        }
    except Exception as e:
        logger.error(f"Manual update failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update attendance record"
        )

@router.post("/review")
async def review_attendance_record(
    request: AttendanceReviewRequest = Body(...),
    db: Any = Depends(get_database)
):
    """
    Review a flagged attendance record (Day 27 - Sudam).
    Allows administrators to approve or reject anomalies.
    """
    # 1. Verify Session exists
    session = await db["attendance_sessions"].find_one({"_id": request.session_id})
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attendance session {request.session_id} not found"
        )

    # 2. Update the review_status in the records array
    now = datetime.utcnow()
    result = await db["attendance_sessions"].update_one(
        {"_id": request.session_id, "records.student_id": request.student_id},
        {
            "$set": {
                "records.$.review_status": request.status,
                "records.$.is_flagged": False if request.status == "approved" else True,
                "updated_at": now
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attendance record for student {request.student_id} not found in this session"
        )

    return {
        "message": f"Record successfully {request.status}",
        "session_id": request.session_id,
        "student_id": request.student_id,
        "review_status": request.status
    }
