import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from datetime import datetime
from bson import ObjectId

# Set dummy env vars BEFORE importing app.core.config
os.environ["MONGODB_URL"] = "mongodb://localhost:27017"
os.environ["SECRET_KEY"] = "test_secret"
os.environ["JWT_SECRET"] = "test_jwt"
os.environ["FACE_MODEL"] = "Facenet"

# Mock heavy dependencies
sys.modules['app.services.face_detector'] = MagicMock()
sys.modules['app.services.embedding_service'] = MagicMock()
sys.modules['app.services.ai.lighting_optimizer'] = MagicMock()

# Import endpoint and schemas
from app.api.routes.students import get_student_attendance_history
from app.schemas.student import StudentAttendanceHistory, StudentAttendanceHistoryItem

@pytest.mark.asyncio
async def test_get_student_attendance_history():
    # Setup Mock DB
    mock_db_instance = MagicMock()
    mock_collection = AsyncMock()
    
    # Mock student
    student_id_str = "65ce276b9e1e4d98952f1978"
    mock_student = {
        "_id": ObjectId(student_id_str),
        "full_name": "John Doe",
        "role": "student"
    }
    
    # Mock aggregation result
    mock_history = [
        {
            "session_id": "session_1",
            "classroom_id": "class_1",
            "classroom_name": "Math 101",
            "session_date": datetime.utcnow(),
            "records": [
                {
                    "student_id": student_id_str,
                    "status": "present",
                    "timestamp": datetime.utcnow(),
                    "confidence": 0.98
                }
            ]
        }
    ]
    
    # Configure DB mocks
    # users.find_one
    mock_db_instance.__getitem__.return_value = mock_collection
    mock_collection.find_one.return_value = mock_student
    
    # attendance_sessions.aggregate
    mock_cursor = AsyncMock()
    mock_cursor.to_list.return_value = mock_history
    mock_collection.aggregate = MagicMock(return_value=mock_cursor)

    # Patch get_database
    with patch('app.api.routes.students.get_database', AsyncMock(return_value=mock_db_instance)):
        # Run endpoint handler directly
        response = await get_student_attendance_history(student_id_str)
        
        # Verify response
        assert response.student_id == student_id_str
        assert response.student_name == "John Doe"
        assert response.total_sessions == 1
        assert response.present_count == 1
        assert response.attendance_percentage == 100.0
        assert len(response.history) == 1
        assert response.history[0].classroom_name == "Math 101"
        assert response.history[0].confidence == 0.98

if __name__ == "__main__":
    # Allow running this file directly
    import asyncio
    asyncio.run(test_get_student_attendance_history())
    print("Test passed!")
