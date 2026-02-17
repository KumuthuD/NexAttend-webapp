import asyncio
import os
import sys
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from bson import ObjectId

# Add project root to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Mock the heavy AI services BEFORE importing the router
# This prevents the script from failing if TF/OpenCV are not fully configured in this shell
sys.modules['app.services.face_detector'] = MagicMock()
sys.modules['app.services.embedding_service'] = MagicMock()
sys.modules['app.services.ai.lighting_optimizer'] = MagicMock()

# Now import the route handler
from app.api.routes.students import get_student_attendance_history

# Setup Mock DB
mock_db_instance = MagicMock()
mock_collection = AsyncMock()

# Mock student data
mock_student = {
    "_id": ObjectId(),
    "full_name": "John Doe",
    "role": "student",
    "email": "john@example.com"
}
student_id = str(mock_student["_id"])

# Mock aggregation result
mock_history = [
    {
        "session_id": "session1",
        "classroom_id": "class1",
        "classroom_name": "CS101",
        "session_date": datetime.utcnow(),
        "record": [
            {
                "student_id": student_id,
                "status": "present",
                "timestamp": datetime.utcnow(),
                "confidence": 0.95
            }
        ]
    }
]

# Configure mocks
mock_collection.find_one.return_value = mock_student
mock_cursor = AsyncMock()
mock_cursor.to_list.return_value = mock_history
mock_collection.aggregate.return_value = mock_cursor

# Dictionary access db["users"], db["attendance_sessions"], db["classrooms"]
mock_db_instance.__getitem__.side_effect = lambda name: mock_collection

async def test_student_history_async():
    print(f"Testing Student Attendance History for ID: {student_id}")
    
    # Patch get_database dependency
    with patch('app.api.routes.students.get_database', AsyncMock(return_value=mock_db_instance)):
        try:
            data = await get_student_attendance_history(student_id)
            
            print(f"Result for: {data.student_name}")
            print(f"Total Sessions: {data.total_sessions}")
            print(f"Attendance Rate: {data.attendance_percentage}%")
            
            assert data.student_id == student_id
            assert data.student_name == "John Doe"
            assert len(data.history) == 1
            assert data.history[0].attendance_status == "present"
            assert data.history[0].classroom_name == "CS101"
            
            print("\n Student Attendance History Logic Verified Successfully!")
        except Exception as e:
            print(f" Logic Error: {e}")
            import traceback
            traceback.print_exc()
            raise

if __name__ == "__main__":
    try:
        asyncio.run(test_student_history_async())
    except Exception as e:
        print(f" Test Execution Failed: {e}")
        exit(1)
