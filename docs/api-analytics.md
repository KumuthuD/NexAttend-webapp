# Analytics API Reference

## Overview
The Analytics API provides endpoints for retrieving attendance statistics, student participation trends, and system-wide analytics overviews. These endpoints are primarily used by the Teacher and Admin dashboards.

---

## Base URL
`/api/analytics`

---

## Endpoints

### 1. Dashboard Analytics
**Endpoint:** `GET /dashboard`
**Purpose:** Retrieves top-level analytics summary for the main dashboard display.

**Response:** `AnalyticsOverview` (200 OK)
```json
{
  "total_students": 150,
  "total_active_sessions": 45,
  "average_attendance_rate": 88.5,
  "average_confidence_score": 0.94,
  "weekly_trend": [
    {
      "date": "2024-03-01",
      "total_sessions": 5,
      "total_present": 120,
      "attendance_percentage": 92.0
    }
  ]
}
```

---

### 2. Analytics Summary
**Endpoint:** `GET /summary`
**Purpose:** Retrieves detailed analytics data with support for classroom and date filtering.

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `classroom_id` | string | No | Filter data by a specific classroom ID. |
| `start_date` | date (YYYY-MM-DD) | No | Start of the report period. |
| `end_date` | date (YYYY-MM-DD) | No | End of the report period. |

**Response:** `AnalyticsSummaryResponse` (200 OK)
```json
{
  "total_students": 150,
  "total_classrooms": 10,
  "total_sessions_completed": 45,
  "overall_attendance_rate": 88.5,
  "average_confidence": 0.94,
  "total_flagged_records": 12,
  "report_period": "Last 30 Days",
  "most_attended_class": "Computer Science 101",
  "lowest_attendance_class": "Calculus II"
}
```

---

## Data Models

### DailyAttendanceStats
- `date`: Date of the record.
- `total_sessions`: Number of sessions held on this date.
- `total_present`: Unique students marked as present.
- `attendance_percentage`: Ratio of presence vs. enrollment.
