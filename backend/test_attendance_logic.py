from app.models.attendance import AttendanceRecord, AttendanceSession
from app.schemas.attendance import AttendanceSessionResponse
from datetime import datetime
import json

def test_attendance_logic():
    print("Testing Attendance Model and Schema Logic...")

    # 1. Test AttendanceRecord
    record = AttendanceRecord(
        student_id="student_123",
        status="present",
        confidence=0.95
    )
    print(f"Step 1: AttendanceRecord created: {record.student_id} - {record.status}")

    # 2. Test AttendanceSession
    session = AttendanceSession(
        classroom_id="classroom_abc",
        records=[record]
    )
    print(f"Step 2: AttendanceSession created with {len(session.records)} record(s)")

    # 3. Test Schema Validation (Response)
    session_dict = session.model_dump(by_alias=True)
    # Mock created_at and updated_at since they are set in the model
    session_dict["created_at"] = datetime.utcnow()
    session_dict["updated_at"] = datetime.utcnow()
    
    response = AttendanceSessionResponse(**session_dict)
    print(f"Step 3: AttendanceSessionResponse validation successful: {response.id}")

    # 4. JSON Serialization check
    serialized = response.model_dump_json(by_alias=True)
    assert "_id" in serialized
    print("Step 4: JSON serialization with alias successful")

    print("\n✅ Attendance model and schema verification passed!")

if __name__ == "__main__":
    test_attendance_logic()
