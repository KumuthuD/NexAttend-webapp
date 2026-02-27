from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class DailyAttendanceStats(BaseModel):
    date: date
    total_sessions: int
    total_present: int
    attendance_percentage: float

class AnalyticsOverview(BaseModel):
    total_students: int
    total_active_sessions: int
    average_attendance_rate: float
    average_confidence_score: float
    weekly_trend: List[DailyAttendanceStats]

class AnalyticsSummaryResponse(BaseModel):
    total_students: int
    total_classrooms: int
    total_sessions_completed: int
    overall_attendance_rate: float
    average_confidence: float
    total_flagged_records: int
    report_period: str # e.g. "All Time", "Last 30 Days", "Custom Range"
    most_attended_class: Optional[str] = None
    lowest_attendance_class: Optional[str] = None
