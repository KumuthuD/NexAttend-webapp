# Analytics Metrics & Requirements

This document outlines the core analytics metrics defined for the NexAttend dashboard and the data structures used to serve them. These metrics provide insights into attendance trends, system performance (AI confidence), and classroom activity.

## 1. Top-Level Dashboard Metrics (Overview)
These metrics provide an at-a-glance summary of the platform's current state. They are served via the `/dashboard` endpoint and represent the `AnalyticsOverview` model.

### Key Metrics Defined:
*   **Total Students**: The total number of registered students across all active classrooms.
*   **Total Active Sessions**: The current count of attendance sessions with an `active` status.
*   **Average Attendance Rate**: The percentage of students present over the total possible attendance (calculated over the last 7 days).
    *   *Formula*: `(Total Present / Possible Attendances) * 100`
*   **Average Confidence Score**: The average confidence level of the AI face recognition system across all recorded entries. This serves as a system health indicator.
*   **Weekly Trend**: An array of daily statistics (see below) for the past 7 days.

### Daily Statistics (`DailyAttendanceStats`):
For trend analysis, each day is broken down into:
*   `date`: The specific calendar date.
*   `total_sessions`: Number of sessions that occurred on this date.
*   `total_present`: Total number of student presents recorded across those sessions.
*   `attendance_percentage`: The daily attendance rate.

---

## 2. Advanced Summary Metrics
These metrics provide deeper insights and support filtering (by classroom, date range). They are served via the `/summary` endpoint and represent the `AnalyticsSummaryResponse` model.

### Key Metrics Defined:
*   **Total Students**: Total students (filtered by classroom if specified).
*   **Total Classrooms**: Total classrooms in the system (or 1 if a specific classroom is queried).
*   **Total Sessions Completed**: Total number of sessions matching the filter criteria.
*   **Overall Attendance Rate**: The precise attendance percentage for the requested period.
*   **Average Confidence**: Average AI confidence score for the queried scope.
*   **Total Flagged Records**: The total number of attendance records marked as anomalies (statuses like `suspicious`, `spoof`, or `low_confidence`).
*   **Report Period**: A string representation of the applied date filter (e.g., "All Time", "Last 30 Days", "Since YYYY-MM-DD").

---

## 3. UI Implementation Mapping
These metrics map directly to components on the frontend `AnalyticsPage`:
*   **Stats Cards**: Display *Overall Attendance Rate*, *Total Sessions*, *Most Attended Class*, and *Lowest Attendance*.
*   **Attendance Overview (Bar Chart)**: Visualizes the `weekly_trend` data.
*   **Attendance Over Time (Trend Chart)**: Shows the progression of `attendance_percentage`.
*   **Attendance Breakdown Chart**: A visual pie-chart representation of present vs. absent students based on the filtered data.
*   **Anomalies & Confidence Indicators**: Using `Total Flagged Records` to optionally highlight sessions needing manual review.

---
*Documented on Day 23 as part of Sprint 2: Analytics Backend.*
