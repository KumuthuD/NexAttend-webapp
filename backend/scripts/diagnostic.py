import asyncio
import os
import sys
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from bson import ObjectId
from pydantic import ValidationError

# Add project root to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Mock Settings BEFORE importing anything that uses it
mock_settings = MagicMock()
mock_settings.API_V1_STR = "/api/v1"
mock_settings.PROJECT_NAME = "Test"
mock_settings.MONGODB_URL = "mongodb://localhost:27017"
mock_settings.SECRET_KEY = "test"
mock_settings.JWT_SECRET = "test"
sys.modules['app.core.config'] = MagicMock(settings=mock_settings)

# Mock AI services
sys.modules['app.services.face_detector'] = MagicMock()
sys.modules['app.services.embedding_service'] = MagicMock()
sys.modules['app.services.ai.lighting_optimizer'] = MagicMock()

async def run_logic_diagnostic():
    # Import AFTER mocking
    from app.api.routes.students import get_student_attendance_history
    from app.schemas.student import StudentAttendanceHistory, StudentAttendanceHistoryItem, StudentResponse
    
    # Setup Mock DB
    mock_db_instance = MagicMock()
    mock_collection = AsyncMock()
    
    # Mock student - use ALL fields from StudentResponse to be safe
    mock_student = {
        "_id": ObjectId("65ce276b9e1e4d98952f1978"),
        "full_name": "John Doe",
        "name": "John",
        "role": "student",
        "roll_number": "123",
        "email": "test@test.com",
        "course": "CS",
        "year": 1,
        "has_registered_face": True,
        "created_at": datetime.utcnow()
    }
    target_id = str(mock_student["_id"])
    
    # Mock aggregation result
    mock_history = [
        {
            "session_id": "session_123",
            "classroom_id": "class_456",
            "classroom_name": "Test Class",
            "session_date": datetime.utcnow(),
            "records": [
                {
                    "student_id": target_id,
                    "status": "present",
                    "timestamp": datetime.utcnow(),
                    "confidence": 0.99
                }
            ]
        }
    ]
    
    mock_collection.find_one.return_value = mock_student
    mock_cursor = AsyncMock()
    mock_cursor.to_list.return_value = mock_history
    mock_collection.aggregate.return_value = mock_cursor
    mock_db_instance.__getitem__.return_value = mock_collection

    print(f"Executing logic test for {target_id}...")
    
    with patch('app.api.routes.students.get_database', AsyncMock(return_value=mock_db_instance)):
        try:
            result = await get_student_attendance_history(target_id)
            print("LOGIC PASS")
            # Verify serialization
            print(f"Serialized: {result.model_dump_json()[:100]}...")
            
            # Now verify StudentResponse (the check mentioned by user might be here)
            resp = StudentResponse(**mock_student)
            print("STUDENT RESPONSE PASS")
            
        except ValidationError as e:
            print(f"VALIDATION FAILED: {e}")
            sys.exit(1)
        except Exception as e:
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_logic_diagnostic())
