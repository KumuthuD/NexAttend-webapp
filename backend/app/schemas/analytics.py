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
