import os
import sys
from unittest.mock import MagicMock, AsyncMock

# MOCK AI DEPENDENCIES 
sys.modules['deepface'] = MagicMock()
sys.modules['mtcnn'] = MagicMock()
sys.modules['cv2'] = MagicMock()
sys.modules['scipy'] = MagicMock()
sys.modules['scipy.spatial'] = MagicMock()
sys.modules['scipy.spatial.distance'] = MagicMock()
#  END MOCK

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

# Mock Env Vars
os.environ["MONGODB_URL"] = "mongodb://localhost:27017/test"
os.environ["SECRET_KEY"] = "test"
os.environ["JWT_SECRET"] = "test"

from fastapi.testclient import TestClient
from app.main import app
from app.database.mongodb import get_database
from datetime import datetime

# Mock database
mock_db = MagicMock()
mock_logs_col = MagicMock()

mock_db.__getitem__.side_effect = lambda name: {
    "recognition_logs": mock_logs_col
}.get(name, MagicMock())

def override_get_database():
    return mock_db

app.dependency_overrides[get_database] = override_get_database

def test_recognition_logs():
    print("Testing Recognition Logs Endpoint (Day 13)...")
    
    with TestClient(app) as client:
        # 1. Test Creating a Log
        log_payload = {
            "session_id": "session_123",
            "student_id": "student_456",
            "confidence": 0.92,
            "status": "success",
            "processing_time_ms": 120.5,
            "metadata": {"camera_id": "cam_01"}
        }
        
        # Mock Insert
        mock_logs_col.insert_one = AsyncMock()
        mock_logs_col.find_one = AsyncMock(return_value={
            "_id": "log_uuid_789",
            **log_payload,
            "timestamp": datetime.utcnow()
        })
        
        response = client.post("/api/v1/attendance/logs", json=log_payload)
        
        print(f"POST Status: {response.status_code}")
        assert response.status_code == 201
        data = response.json()
        assert data["session_id"] == "session_123"
        assert data["status"] == "success"
        
        # 2. Test Retrieving Logs
        # Mock Find Cursor
        mock_cursor = MagicMock()
        mock_cursor.to_list = AsyncMock(return_value=[
            {
                "_id": "log_uuid_789",
                **log_payload,
                "timestamp": datetime.utcnow()
            },
            {
                "_id": "log_uuid_790",
                "session_id": "session_123",
                "confidence": 0.45,
                "status": "low_confidence",
                "timestamp": datetime.utcnow(),
                "metadata": {}
            }
        ])
        mock_logs_col.find.return_value.sort.return_value = mock_cursor
        
        response_get = client.get("/api/v1/attendance/logs/session_123")
        
        print(f"GET Status: {response_get.status_code}")
        assert response_get.status_code == 200
        logs = response_get.json()
        assert len(logs) == 2
        assert logs[0]["status"] == "success"
        assert logs[1]["status"] == "low_confidence"
        
        print("✅ Recognition logs test passed!")

if __name__ == "__main__":
    test_recognition_logs()
