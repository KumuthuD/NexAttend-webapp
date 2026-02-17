import asyncio
import os
import sys
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime
from bson import ObjectId

# Add project root to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.api.routes.students import get_student_attendance_history
from app.database.mongodb import get_database

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

# Override get_database dependency in the module where the route is defined
# Since it's passed as a dependency, but we are calling the function directly,
# we need to ensure the function uses our mock.
# In the route: db = await get_database()
# We can patch get_database in app.api.routes.students

async def test_student_history_async():
    print(f"Testing Student Attendance History for ID: {student_id}")
    
    # Patch get_database
    import app.api.routes.students as students_route
    original_get_db = students_route.get_database
    students_route.get_database = AsyncMock(return_value=mock_db_instance)
    
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
    finally:
        # Restore original
        students_route.get_database = original_get_db

if __name__ == "__main__":
    try:
        asyncio.run(test_student_history_async())
    except Exception as e:
        print(f" Test Failed: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
