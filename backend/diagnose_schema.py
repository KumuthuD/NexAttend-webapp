from app.schemas.attendance import AttendanceSessionResponse
from datetime import datetime
import pydantic

now_iso = datetime.utcnow().isoformat()
d = {
    "_id": "866504a2-ca8b-494b-97d7-939a79753112",
    "classroom_id": "class_123",
    "session_date": now_iso,
    "status": "active",
    "present_student_ids": ["student_1"],
    "records": [
        {"student_id": "student_1", "status": "present", "timestamp": now_iso}
    ],
    "start_time": now_iso,
    "end_time": None,
    "created_at": now_iso,
    "updated_at": now_iso
}

print(f"DIAGNOSING WITH DICT: {d}")

try:
    AttendanceSessionResponse(**d)
    print("SUCCESS: AttendanceSessionResponse validated successfully with string dates")
except pydantic.ValidationError as e:
    print(f"VALIDATION ERROR: {e}")
    for error in e.errors():
        print(f"  Field: {error['loc']} - {error['msg']} - Type: {error['type']}")
except Exception as e:
    print(f"UNEXPECTED ERROR: {e}")
