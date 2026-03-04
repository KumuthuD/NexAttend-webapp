import csv
import io
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from app.database.mongodb import get_database
from typing import Any, Optional, List
from datetime import datetime, timezone
from bson import ObjectId

router = APIRouter()

async def _find_user_or_student(db: Any, user_id: str):
    """
    Helper to resolve student names. 
    Duplicate of logic in attendance.py - consider refactoring to a shared service later.
    """
    try:
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        if user: return user
    except Exception: pass
    
    user = await db["users"].find_one({"_id": user_id})
    if user: return user
    
    return await db["students"].find_one({"_id": user_id})

@router.get("/csv")
async def export_attendance_csv(
    classroom_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Any = Depends(get_database)
):
    """
    Export attendance data to CSV.
    Day 28 Task - Sudam (Plumbing & Basic Export)
    """
    
    # 1. Build Query (Thisandu will expand this, but Sudam provides the basic structure)
    query = {}
    if classroom_id:
        query["classroom_id"] = classroom_id
        
    # Date filtering (Basic implementation)
    if start_date or end_date:
        date_query = {}
        if start_date:
            try:
                date_query["$gte"] = datetime.fromisoformat(start_date)
            except ValueError:
                pass
        if end_date:
            try:
                date_query["$lte"] = datetime.fromisoformat(end_date)
            except ValueError:
                pass
        if date_query:
            query["session_date"] = date_query

    # 2. Fetch Sessions
    cursor = db["attendance_sessions"].find(query).sort("session_date", -1)
    
    # 3. Define Generator for StreamingResponse
    async def generate():
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            "Session ID", "Classroom Name", "Date", 
            "Student Name", "Student Email", "Status", 
            "Confidence", "Method", "Flagged", "Flag Reason"
        ])
        yield output.getvalue()
        output.truncate(0)
        output.seek(0)

        # Cache for classrooms and students to avoid redundant DB calls per record
        classroom_cache = {}
        student_cache = {}

        async for session in cursor:
            # Resolve Classroom Name
            cid = session.get("classroom_id")
            if cid not in classroom_cache:
                classroom = await db["classrooms"].find_one({"_id": cid})
                if classroom:
                    classroom_cache[cid] = classroom.get("course_name", classroom.get("name", "Unknown"))
                else:
                    classroom_cache[cid] = "Unknown"
            
            classroom_name = classroom_cache[cid]
            session_date = session.get("session_date")
            if isinstance(session_date, datetime):
                date_str = session_date.strftime("%Y-%m-%d %H:%M:%S")
            else:
                date_str = str(session_date)
                
            session_id = str(session.get("_id"))

            for record in session.get("records", []):
                sid = record.get("student_id")
                
                # Filter by status if requested (Thisandu's part, but adding base)
                if status_filter and record.get("status") != status_filter:
                    continue

                if sid not in student_cache:
                    student = await _find_user_or_student(db, sid)
                    if student:
                        student_cache[sid] = {
                            "name": student.get("full_name", student.get("name", "Unknown")),
                            "email": student.get("email", "N/A")
                        }
                    else:
                        student_cache[sid] = {"name": "Unknown", "email": "N/A"}
                
                student_info = student_cache[sid]
                
                writer.writerow([
                    session_id,
                    classroom_name,
                    date_str,
                    student_info["name"],
                    student_info["email"],
                    record.get("status", "N/A"),
                    record.get("confidence", "N/A"),
                    record.get("method", "N/A"),
                    record.get("is_flagged", False),
                    record.get("flag_reason", "")
                ])
                
                yield output.getvalue()
                output.truncate(0)
                output.seek(0)

    filename = f"attendance_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return StreamingResponse(
        generate(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
