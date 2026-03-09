from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from typing import Any, Optional
from datetime import datetime
from app.database.mongodb import get_database
from app.schemas.export import AttendanceExportFilter
from app.services.export_service import export_service
import io

router = APIRouter()

@router.get("/attendance/csv")
async def export_attendance_csv(
    classroom_id: Optional[str] = Query(None, description="Filter by classroom ID"),
    start_date: Optional[datetime] = Query(None, description="Start date (inclusive)"),
    end_date: Optional[datetime] = Query(None, description="End date (inclusive)"),
    status: Optional[str] = Query(None, description="Filter by status: present, absent, excused"),
    db: Any = Depends(get_database)
):
    """
    Export filtered attendance data as a downloadable CSV file.
    
    All query parameters are optional — omit to export all data.
    """
    # 1. Build filter from query params
    filters = AttendanceExportFilter(
        classroom_id=classroom_id,
        start_date=start_date,
        end_date=end_date,
        status=status
    )

    # 2. Fetch filtered sessions
    sessions = await export_service.fetch_filtered_sessions(db, filters)

    # 3. Generate CSV string
    csv_content = export_service.generate_csv(sessions)

    # 4. Return as downloadable CSV
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=attendance_export.csv"}
    )
