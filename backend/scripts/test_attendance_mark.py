import os
import sys
from unittest.mock import MagicMock, AsyncMock

# --- MOCK AI DEPENDENCIES ---
sys.modules['deepface'] = MagicMock()
sys.modules['mtcnn'] = MagicMock()
sys.modules['cv2'] = MagicMock()
sys.modules['scipy'] = MagicMock()
sys.modules['scipy.spatial'] = MagicMock()
sys.modules['scipy.spatial.distance'] = MagicMock()
# --- END MOCK ---

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

# Mock Env Vars
os.environ["MONGODB_URL"] = "mongodb://localhost:27017/test"
os.environ["SECRET_KEY"] = "test"
os.environ["JWT_SECRET"] = "test"

from fastapi.testclient import TestClient
from app.main import app
from app.database.mongodb import get_database

# Mock database
mock_db = MagicMock()
mock_classrooms_col = MagicMock()
mock_sessions_col = MagicMock()
mock_students_col = MagicMock()

mock_db.__getitem__.side_effect = lambda name: {
    "classrooms": mock_classrooms_col,
    "attendance_sessions": mock_sessions_col,
    "students": mock_students_col
}[name]

def override_get_database():
    return mock_db

app.dependency_overrides[get_database] = override_get_database

def test_attendance_mark():
    print("Testing Attendance Mark Endpoint (Day 12)...")
    
    with TestClient(app) as client:
        # 1. Setup Data
        session_id = "session_123"
        student_id = "student_456"
        student_name = "Thiviru Gunathilaka"
        
        # Mock Session exists and is active
        mock_sessions_col.find_one.return_value = {
            "_id": session_id,
            "status": "active",
            "present_student_ids": [], # Not yet marked
            "records": []
        }
        
        # Mock Student exists
        mock_students_col.find_one.return_value = {
            "_id": student_id,
            "full_name": student_name
        }
        
        # Mock Update Result
        mock_sessions_col.update_one.return_value = AsyncMock()

        # 2. Test Marking Attendance
        payload = {
            "session_id": session_id,
            "student_id": student_id,
            "confidence": 0.95,
            "method": "face"
        }
        
        response = client.post("/api/v1/attendance/mark", json=payload)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code != 200:
            print(f"Response: {response.json()}")
            
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Attendance marked successfully"
        assert data["student_name"] == student_name
        assert data["status"] == "present"
        
        # 3. Test duplicate marking (Idempotency)
        # Update mock to show student already present
        mock_sessions_col.find_one.return_value = {
            "_id": session_id,
            "status": "active",
            "present_student_ids": [student_id], # Already marked
            "records": [{"student_id": student_id}]
        }
        
        response_dup = client.post("/api/v1/attendance/mark", json=payload)
        assert response_dup.status_code == 200
        data_dup = response_dup.json()
        assert data_dup["message"] == "Attendance already marked"
        
        print("✅ Attendance mark test passed!")

if __name__ == "__main__":
    test_attendance_mark()
