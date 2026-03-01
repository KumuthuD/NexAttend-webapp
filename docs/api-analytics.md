# Analytics API Reference

## Overview
The Analytics API provides endpoints for retrieving attendance statistics, student participation trends, and system-wide analytics overviews. These endpoints are primarily used by the Teacher and Admin dashboards.

---

## Base URL
`/api/analytics`

---

## Table of Contents
- [Overview](#overview)
- [Base URL](#base-url)
- [Endpoints](#endpoints)
  - [1. Dashboard Analytics](#1-dashboard-analytics)
  - [2. Analytics Summary](#2-analytics-summary)
  - [3. Email Logs (Audit Trail)](#3-email-logs-audit-trail)
- [Data Models & Schemas](#data-models--schemas)
- [Error Responses & Status Codes](#error-responses--status-codes)

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

### 3. Email Logs (Audit Trail)
**Endpoint:** `GET /email-logs`
**Base URL:** `/api/email-logs`
**Purpose:** Retrieves system email logs for auditing and troubleshooting sent notifications.

**Query Parameters:**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `recipient` | string | No | Filter logs by recipient email address. |
| `limit` | int | No | Maximum number of logs to return (default: 100, max: 500). |

**Response:** `List[EmailLogResponse]` (200 OK)
```json
[
  {
    "_id": "65e0f8b1c2e4...",
    "recipient_email": "student@example.com",
    "subject": "Attendance Confirmed - NexAttend",
    "template_used": "attendance_confirmation",
    "status": "sent",
    "error_message": null,
    "timestamp": "2024-03-01T10:00:00Z"
  }
]
```

---

## Data Models & Schemas

### 1. DailyAttendanceStats
Represents a single day's attendance aggregation.
- `date` (string): ISO format date (YYYY-MM-DD).
- `total_sessions` (int): Number of sessions held.
- `total_present` (int): Count of unique present students.
- `attendance_percentage` (float): Percentage of enrollment present (0-100).

### 2. AnalyticsOverview
Primary schema for the main dashboard and weekly trends.
- `total_students` (int): Total enrolled students.
- `total_active_sessions` (int): Currently running sessions.
- `average_attendance_rate` (float): Global attendance rate.
- `average_confidence_score` (float): Mean AI recognition confidence (0.0 - 1.0).
- `weekly_trend` (List[DailyAttendanceStats]): Array of the last 7 days of data for trend visualization.

### 3. AnalyticsSummaryResponse
Schema for the detailed summary report.
- `total_students` (int): Student count in filtered scope.
- `total_classrooms` (int): Classroom count in filtered scope.
- `total_sessions_completed` (int): Count of finished sessions.
- `overall_attendance_rate` (float): Aggregated attendance percentage.
- `average_confidence` (float): Mean AI confidence in report period.
- `total_flagged_records` (int): Count of suspicious or low-confidence detections.
- `report_period` (string): Descriptive range (e.g., "Since 2024-01-01").
- `most_attended_class` (string\|null): Name of class with highest rate.
- `lowest_attendance_class` (string\|null): Name of class with lowest rate.
### 4. EmailLogResponse
Record of a system-generated email.
- `_id` (string): Unique log identifier.
- `recipient_email` (string): Destination address.
- `subject` (string): Email subject line.
- `template_used` (string): Name of the Jinja2 template.
- `status` (string): "sent" or "failed".
- `error_message` (string|null): Details if status is "failed".
- `timestamp` (datetime): When the email was processed.

---

---

## Error Responses & Status Codes

The API uses standard HTTP status codes to indicate the success or failure of an inquiry.

| Status Code | Description | Typical Scenario |
| :--- | :--- | :--- |
| `200 OK` | Success | The request was successful and data is returned. |
| `400 Bad Request` | Validation Error | Invalid query parameters (e.g. malformed date). |
| `401 Unauthorized` | Authentication Failed | Missing or invalid JWT token. |
| `403 Forbidden` | Access Denied | User does not have permission to view these logs. |
| `404 Not Found` | Resource Missing | The requested analytics scope or classroom does not exist. |
| `500 Internal Server Error` | Server Error | An unexpected error occurred on the server. |

### Example Error Response (400 Bad Request)
```json
{
  "detail": [
    {
      "loc": ["query", "start_date"],
      "msg": "invalid date format",
      "type": "value_error.date"
    }
  ]
}
```
