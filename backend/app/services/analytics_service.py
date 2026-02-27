from datetime import datetime, timedelta, date
from typing import Any, List, Optional
from app.schemas.analytics import AnalyticsOverview, DailyAttendanceStats, AnalyticsSummaryResponse

class AnalyticsService:
    @staticmethod
    async def get_dashboard_overview(db: Any) -> AnalyticsOverview:
        # 1. Pipeline for Summary Stats and Weekly Trend
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        seven_days_ago = today - timedelta(days=7)
        
        # Aggregate sessions with their classroom student counts
        pipeline = [
            {
                "$match": {
                    "session_date": {"$gte": seven_days_ago}
                }
            },
            {
                "$lookup": {
                    "from": "classrooms",
                    "localField": "classroom_id",
                    "foreignField": "_id",
                    "as": "classroom_info"
                }
            },
            {
                "$unwind": "$classroom_info"
            },
            {
                "$project": {
                    "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$session_date"}},
                    "present_count": {"$size": {"$ifNull": ["$present_student_ids", []]}},
                    "student_count": {"$size": {"$ifNull": ["$classroom_info.student_ids", []]}}
                }
            },
            {
                "$group": {
                    "_id": "$date",
                    "total_sessions": {"$sum": 1},
                    "total_present": {"$sum": "$present_count"},
                    "total_possible": {"$sum": "$student_count"}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        
        trend_results = await db["attendance_sessions"].aggregate(pipeline).to_list(length=7)
        
        # 2. General Stats (Independent of 7-day filter where needed)
        total_students = await db["students"].count_documents({})
        total_active_sessions = await db["attendance_sessions"].count_documents({"status": "active"})
        
        # Average Confidence (All time or could be filtered)
        confidence_pipeline = [{"$unwind": "$records"}, {"$group": {"_id": None, "avg": {"$avg": "$records.confidence"}}}]
        conf_res = await db["attendance_sessions"].aggregate(confidence_pipeline).to_list(1)
        avg_confidence = conf_res[0]["avg"] if conf_res else 0.0

        # 3. Process Trend and Overall Rate
        weekly_trend = []
        overall_present = 0
        overall_possible = 0
        
        for res in trend_results:
            possible = res["total_possible"] if res["total_possible"] > 0 else 1
            percentage = (res["total_present"] / possible) * 100
            
            weekly_trend.append(DailyAttendanceStats(
                date=date.fromisoformat(res["_id"]),
                total_sessions=res["total_sessions"],
                total_present=res["total_present"],
                attendance_percentage=round(percentage, 2)
            ))
            overall_present += res["total_present"]
            overall_possible += res["total_possible"]

        avg_attendance_rate = (overall_present / overall_possible * 100) if overall_possible > 0 else 0.0

        return AnalyticsOverview(
            total_students=total_students,
            total_active_sessions=total_active_sessions,
            average_attendance_rate=round(avg_attendance_rate, 2),
            average_confidence_score=round(avg_confidence, 4),
            weekly_trend=weekly_trend
        )

    @staticmethod
    async def get_analytics_summary(
        db: Any,
        classroom_id: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> AnalyticsSummaryResponse:
        # 1. Build Match Filter
        match_filter = {}
        if classroom_id:
            match_filter["classroom_id"] = classroom_id
        
        if start_date or end_date:
            date_filter = {}
            if start_date:
                date_filter["$gte"] = datetime.combine(start_date, datetime.min.time())
            if end_date:
                date_filter["$lte"] = datetime.combine(end_date, datetime.max.time())
            match_filter["session_date"] = date_filter

        report_period = "All Time"
        if start_date and end_date:
            report_period = f"{start_date} to {end_date}"
        elif start_date:
            report_period = f"Since {start_date}"
        elif end_date:
            report_period = f"Until {end_date}"

        # 2. Get Global Stats for the Filtered Scope
        pipeline = [
            {"$match": match_filter},
            {
                "$lookup": {
                    "from": "classrooms",
                    "localField": "classroom_id",
                    "foreignField": "_id",
                    "as": "classroom_info"
                }
            },
            {"$unwind": "$classroom_info"},
            {
                "$project": {
                    "classroom_name": "$classroom_info.name",
                    "classroom_id": 1,
                    "records": 1,
                    "present_count": {"$size": {"$ifNull": ["$present_student_ids", []]}},
                    "student_count": {"$size": {"$ifNull": ["$classroom_info.student_ids", []]}}
                }
            },
            {
                "$group": {
                    "_id": "$classroom_id",
                    "name": {"$first": "$classroom_name"},
                    "total_sessions": {"$sum": 1},
                    "total_present": {"$sum": "$present_count"},
                    "total_possible": {"$sum": "$student_count"},
                    "all_records": {"$push": "$records"}
                }
            }
        ]

        class_results = await db["attendance_sessions"].aggregate(pipeline).to_list(length=1000)

        # 3. Get Total Students & Classrooms (Correct logic)
        if classroom_id:
            classroom = await db["classrooms"].find_one({"_id": classroom_id})
            total_students_count = len(classroom.get("student_ids", [])) if classroom else 0
            total_classrooms_count = 1
        else:
            total_students_count = await db["students"].count_documents({})
            total_classrooms_count = await db["classrooms"].count_documents({})

        if not class_results:
            return AnalyticsSummaryResponse(
                total_students=total_students_count,
                total_classrooms=total_classrooms_count,
                total_sessions_completed=0,
                overall_attendance_rate=0.0,
                average_confidence=0.0,
                total_flagged_records=0,
                report_period=report_period
            )

        # 4. Process Aggregated Results
        total_sessions = 0
        total_present = 0
        total_possible = 0
        total_confidence = 0.0
        record_count = 0
        flagged_anomalies = 0
        
        class_rates = []

        for res in class_results:
            total_sessions += res["total_sessions"]
            total_present += res["total_present"]
            total_possible += res["total_possible"]
            
            # Classroom-level rate for rankings
            rate = (res["total_present"] / res["total_possible"] * 100) if res["total_possible"] > 0 else 0
            class_rates.append({"name": res["name"], "rate": rate})
            
            # Stats across all records in this classrooms sessions
            for session_records in res["all_records"]:
                for record in session_records:
                    if isinstance(record, dict):
                        conf = record.get("confidence")
                        if conf is not None:
                            total_confidence += float(conf)
                            record_count += 1
                        if record.get("status") in ["suspicious", "spoof", "low_confidence"]:
                            flagged_anomalies += 1

        # 5. Determine Rankings
        class_rates.sort(key=lambda x: x["rate"], reverse=True)
        most_attended = class_rates[0]["name"] if class_rates else None
        lowest_attendance = class_rates[-1]["name"] if class_rates else None

        return AnalyticsSummaryResponse(
            total_students=total_students_count,
            total_classrooms=total_classrooms_count,
            total_sessions_completed=total_sessions,
            overall_attendance_rate=round(total_present / total_possible * 100 if total_possible > 0 else 0, 2),
            average_confidence=round(total_confidence / record_count if record_count > 0 else 0, 4),
            total_flagged_records=flagged_anomalies,
            report_period=report_period,
            most_attended_class=most_attended,
            lowest_attendance_class=lowest_attendance
        )
