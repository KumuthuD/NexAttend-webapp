from typing import Any, Dict, List, Optional
from datetime import datetime
from app.schemas.export import AttendanceExportFilter

class ExportService:
    """
    Service to handle filtered attendance data export.
    """

    @staticmethod
    def build_filter_query(filters: AttendanceExportFilter) -> Dict[str, Any]:
        """
        Dynamically constructs a MongoDB query dict from the provided filters.
        Only includes conditions for filters that are not None.
        """
        query: Dict[str, Any] = {}

        if filters.classroom_id:
            query["classroom_id"] = filters.classroom_id

        if filters.start_date or filters.end_date:
            date_filter: Dict[str, Any] = {}
            if filters.start_date:
                date_filter["$gte"] = filters.start_date
            if filters.end_date:
                date_filter["$lte"] = filters.end_date
            query["session_date"] = date_filter

        return query

    @staticmethod
    async def fetch_filtered_sessions(
        db: Any,
        filters: AttendanceExportFilter
    ) -> List[Dict[str, Any]]:
        """
        Fetches attendance sessions matching the given filters.
        If a status filter is provided, only matching records are included.
        """
        query = ExportService.build_filter_query(filters)

        cursor = db["attendance_sessions"].find(query).sort("session_date", -1)
        sessions = await cursor.to_list(length=5000)

        # Post-filter records by status if specified
        if filters.status:
            for session in sessions:
                session["records"] = [
                    r for r in session.get("records", [])
                    if r.get("status") == filters.status
                ]

        return sessions

# Global instance
export_service = ExportService()
