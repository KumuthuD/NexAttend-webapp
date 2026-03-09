# Motivation Scoring Algorithm & Architecture

This document defines the blueprint for the Motivation Scoring feature, scheduled for Day 24 of Sprint 2. It serves as the primary reference for the Backend, Frontend, and Database implementations.

---

## 1. Overview & Core Logic
The goal of Motivation Scoring is to positively reinforce student attendance. These scores are designed to contribute to the student's final grade and are therefore calculated **per classroom**.

*   **The Golden Rule:** 1 Attendance = +0.5 marks.
*   **Deductions:** None. This is strictly positive reinforcement (no negative marks for being absent).
*   **Visibility:** The motivation score and accompanying badges must be prominently displayed **only on the Student Dashboard** to encourage regular attendance.

---

## 2. Badges & Milestones (For Yasitha - Frontend UI)
Because a standard semester typically contains 12-15 lectures, the maximum possible motivation score a student might earn is around **6.0 to 7.5 marks** per classroom. 

Badges should be awarded when specific score milestones are reached within a classroom:

| Badge Level | Points Required | Equivalent to... | Visual Theme (Suggestion) |
| :--- | :--- | :--- | :--- |
| **Starter** | 0.5 points | 1st class attended | Small star, grey/uncommon color |
| **Bronze** | 2.5 points | 5 classes attended | Bronze shield/medal |
| **Silver** | 4.0 points | 8 classes attended | Silver star/medal |
| **Gold** | 5.5 points | 11 classes attended | Glowing Gold trophy |
| **Perfect** | 7.0+ points | 14+ classes attended | Diamond/Crown with animations |

*Yasitha:* You will need to build the UI components for these badges. They should appear alongside the score on the Student Dashboard.

---

## 3. Database Modifications (For Thisandu - Backend DB)
Because scores need to be tracked *per classroom*, the score cannot be a single float on the root of the Student model. 

### `Student` Model Updates:
Add a `classroom_progress` dictionary (or map) to the Student schema that links a `classroom_id` to the student's current score and unlocked badges.

**Example Schema Addition:**
```python
# app/models/student.py (or schemas)
from typing import Dict, List
from pydantic import BaseModel

class ClassroomProgress(BaseModel):
    motivation_score: float = 0.0
    unlocked_badges: List[str] = []

class StudentModel(BaseModel):
    # existing fields...
    # Mapping of classroom_id (string) to their progress
    classroom_progress: Dict[str, ClassroomProgress] = {} 
```

---

## 4. Backend Calculation Algorithm (For Sudam - Backend Logic)
The backend is responsible for calculating and updating the score precisely when attendance is resolved.

### Calculation Triggers:
1.  **Automated AI Session End**: When a session finishes and valid attendance records are finalized.
2.  **Manual Override**: When a teacher manually changes a student's record from "Absent" to "Present". 
    *   *Note:* The system does not support manually downgrading "Present" to "Absent", so we do not need to build subtraction logic. Once points are awarded, they stay.

### Execution Flow:
1.  Iterate through the `present_student_ids` in a specific `classroom_id`.
2.  For each student, check if the `classroom_id` exists in their `classroom_progress` dictionary. If not, initialize it.
3.  Perform an atomic increment (`$inc` in MongoDB) of `0.5` on the `classroom_progress.<classroom_id>.motivation_score`.
4.  **Badge Check:** After the score increments, evaluate the new score against the Badge Milestones (defined in Section 2). If a new threshold is crossed (e.g., score hits 2.5), pushed the new badge string (e.g., `"Bronze"`) into `classroom_progress.<classroom_id>.unlocked_badges` using `$addToSet` to prevent duplicates.

---

## 5. Frontend Display (For Thiviru - Dashboard Integration)
The frontend needs to retrieve this nested data and display it elegantly.

### API Consumption:
*   Ensure the Student endpoints (like `/me` or `/students/:id`) return the complete `classroom_progress` object.
*   When a student selects a specific classroom on their dashboard, the UI should extract that specific classroom's score and badges.

### UI Requirements:
*   **Prominent Display:** The current score (e.g., "4.5 / 7.5 Expected") should be a focal point on the Student Dashboard.
*   **Progress Bar:** Consider a progress bar showing how close they are to unlocking the next badge tier.
*   **Badge Showcase:** A section highlighting the highest badge earned, or a row displaying all unlocked badges for the active classroom.
