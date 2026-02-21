from fastapi import APIRouter, Depends
from app.database.mongodb import get_database
from pydantic import BaseModel
from typing import Any
from datetime import datetime, time

router = APIRouter()

class DashboardStatsResponse(BaseModel):
    total_students: int
    total_classrooms: int
    total_sessions: int
    todays_attendance_count: int
    attendance_percentage: float

@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(db: Any = Depends(get_database)):
    """
    Get summary statistics for the dashboard.
    """
    # 1. Basic Counts
    total_students = await db["students"].count_documents({})
    total_classrooms = await db["classrooms"].count_documents({})
    total_sessions = await db["attendance_sessions"].count_documents({})
    
    # 2. Today's Attendance
    # Find sessions that started today (UTC)
    # Note: For production, timezone handling is critical. Using UTC for now.
    today_start = datetime.combine(datetime.utcnow().date(), time.min)
    today_end = datetime.combine(datetime.utcnow().date(), time.max)
    
    pipeline = [
        {
            "$match": {
                "session_date": {"$gte": today_start, "$lte": today_end}
            }
        },
        {
            "$project": {
                "present_student_ids": 1
            }
        },
        {
            "$unwind": "$present_student_ids"
        },
        {
            "$group": {
                "_id": None,
                "unique_students": {"$addToSet": "$present_student_ids"}
            }
        }
    ]
    
    attendance_result = await db["attendance_sessions"].aggregate(pipeline).to_list(1)
    
    todays_attendance_count = 0
    if attendance_result and len(attendance_result) > 0 and "unique_students" in attendance_result[0]:
        todays_attendance_count = len(attendance_result[0]["unique_students"])
        
    # Calculate percentage based on total registered students
    attendance_percentage = 0.0
    if total_students > 0:
        attendance_percentage = (todays_attendance_count / total_students) * 100
        
    return {
        "total_students": total_students,
        "total_classrooms": total_classrooms,
        "total_sessions": total_sessions,
        "todays_attendance_count": todays_attendance_count,
        "attendance_percentage": round(attendance_percentage, 1)
    }
