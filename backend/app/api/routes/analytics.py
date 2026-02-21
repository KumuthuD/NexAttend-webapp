from fastapi import APIRouter, Depends
from typing import Any, List
from datetime import datetime, timedelta, date
from app.database.mongodb import get_database
from app.schemas.analytics import AnalyticsOverview, DailyAttendanceStats

router = APIRouter()

@router.get("/dashboard", response_model=AnalyticsOverview)
async def get_dashboard_analytics(db: Any = Depends(get_database)):
    """
    Get top-level analytics for the dashboard.
    """
    # 1. Basic Stats
    total_students = await db["students"].count_documents({})
    total_active_sessions = await db["attendance_sessions"].count_documents({"status": "active"})
    
    # 2. Average Confidence Score
    confidence_pipeline = [
        {"$unwind": "$records"},
        {
            "$group": {
                "_id": None,
                "avg_confidence": {"$avg": "$records.confidence"}
            }
        }
    ]
    confidence_result = await db["attendance_sessions"].aggregate(confidence_pipeline).to_list(length=1)
    avg_confidence = confidence_result[0]["avg_confidence"] if confidence_result and "avg_confidence" in confidence_result[0] else 0.0
    
    # 3. Weekly Trend (Last 7 Days)
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    seven_days_ago = today - timedelta(days=7)
    
    trend_pipeline = [
        {
            "$match": {
                "session_date": {"$gte": seven_days_ago}
            }
        },
        {
            "$project": {
                "date": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$session_date"}
                },
                "present_count": {"$size": {"$ifNull": ["$present_student_ids", []]}}
            }
        },
        {
            "$group": {
                "_id": "$date",
                "total_sessions": {"$sum": 1},
                "total_present": {"$sum": "$present_count"}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    trend_results = await db["attendance_sessions"].aggregate(trend_pipeline).to_list(length=7)
    
    weekly_trend = []
    total_attendance_rate = 0.0
    
    # Map results to daily stats
    for result in trend_results:
        # Simple percentage calculation: present / (sessions * total_students)
        # This is an approximation. In a real scenario, it would be based on classroom size.
        possible_presence = result["total_sessions"] * total_students if total_students > 0 else 1
        percentage = (result["total_present"] / possible_presence) * 100
        
        daily_stat = DailyAttendanceStats(
            date=date.fromisoformat(result["_id"]),
            total_sessions=result["total_sessions"],
            total_present=result["total_present"],
            attendance_percentage=round(percentage, 2)
        )
        weekly_trend.append(daily_stat)
        total_attendance_rate += percentage

    # Overall Avg Attendance Rate (last 7 days)
    avg_attendance_rate = total_attendance_rate / len(weekly_trend) if weekly_trend else 0.0

    return AnalyticsOverview(
        total_students=total_students,
        total_active_sessions=total_active_sessions,
        average_attendance_rate=round(avg_attendance_rate, 2),
        average_confidence_score=round(avg_confidence, 4),
        weekly_trend=weekly_trend
    )
