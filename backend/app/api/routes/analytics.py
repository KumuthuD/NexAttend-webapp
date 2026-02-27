from fastapi import APIRouter, Depends, Query
from typing import Any, List, Optional
from datetime import date
from app.database.mongodb import get_database
from app.schemas.analytics import AnalyticsOverview, AnalyticsSummaryResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter()

@router.get("/dashboard", response_model=AnalyticsOverview)
async def get_dashboard_analytics(db: Any = Depends(get_database)):
    """
    Get top-level analytics for the dashboard via AnalyticsService.
    """
    return await AnalyticsService.get_dashboard_overview(db)

@router.get("/summary", response_model=AnalyticsSummaryResponse)
async def get_analytics_summary(
    classroom_id: Optional[str] = Query(None, description="Filter by classroom"),
    start_date: Optional[date] = Query(None, description="Filter by start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Filter by end date (YYYY-MM-DD)"),
    db: Any = Depends(get_database)
):
    """
    Get a summary of analytics data via AnalyticsService.
    """
    return await AnalyticsService.get_analytics_summary(
        db=db,
        classroom_id=classroom_id,
        start_date=start_date,
        end_date=end_date
    )
