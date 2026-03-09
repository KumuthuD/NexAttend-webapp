from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AttendanceExportFilter(BaseModel):
    """
    Filter schema for attendance CSV export.
    All fields are optional — omit a field to skip that filter.
    """
    classroom_id: Optional[str] = Field(None, description="Filter by specific classroom")
    start_date: Optional[datetime] = Field(None, description="Start of date range (inclusive)")
    end_date: Optional[datetime] = Field(None, description="End of date range (inclusive)")
    status: Optional[str] = Field(None, description="Filter by record status: present, absent, excused")
