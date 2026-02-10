import asyncio
import os
import sys
from unittest.mock import MagicMock, AsyncMock

# --- MOCK AI DEPENDENCIES ---
# We mock these so we can run backend tests without installing heavy AI libraries
sys.modules['deepface'] = MagicMock()
sys.modules['mtcnn'] = MagicMock()
sys.modules['cv2'] = MagicMock()
sys.modules['scipy'] = MagicMock()
sys.modules['scipy.spatial'] = MagicMock()
sys.modules['scipy.spatial.distance'] = MagicMock()
# --- END MOCK ---

# Add project root to path
PROJECT_ROOT = os.getcwd()
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

# MOCK DB globally before importing app
from app.database import mongodb

mock_classrooms_col = AsyncMock()
mock_sessions_col = AsyncMock()

mock_db_obj = MagicMock()
def get_col(name):
    if name == "classrooms": return mock_classrooms_col
    if name == "attendance_sessions": return mock_sessions_col
    return MagicMock()

mock_db_obj.__getitem__ = MagicMock(side_effect=get_col)

# REPLACING THE GLOBAL DB OBJECT
mongodb.db.db = mock_db_obj
mongodb.db.connect = MagicMock()
mongodb.db.close = MagicMock()

from fastapi.testclient import TestClient
from app.main import app
from app.database.mongodb import get_database

# OVERRIDE DEPENDENCY
async def override_get_database():
    return mock_db_obj

app.dependency_overrides[get_database] = override_get_database

def test_attendance_start():
    print("Testing Attendance Start Endpoint (MOCKED v4)...")
    
    with TestClient(app) as client:
        # Mock classroom exists
        mock_classrooms_col.find_one.return_value = {"_id": "class_123", "name": "Test Class"}
        
        # Mock no active session
        mock_sessions_col.find_one.return_value = None
        
        # Mock insert_one
        mock_sessions_col.insert_one.return_value = MagicMock(inserted_id="session_123")
        
        # Mock find_one after insertion
        mock_sessions_col.find_one.side_effect = [
            None, # First call (check active)
            {
                "_id": "session_123",
                "classroom_id": "class_123",
                "session_date": "2024-02-10T09:00:00",
                "status": "active",
                "present_student_ids": [],
                "records": [],
                "start_time": "2024-02-10T14:49:58.70"
            } # Second call (after insertion)
        ]
        
        response = client.post("/api/v1/attendance/start", json={"classroom_id": "class_123"})
        
        print(f"Status Code: {response.status_code}")
        if response.status_code != 201:
            print(f"Response: {response.json()}")
            
        assert response.status_code == 201
        data = response.json()
        assert data["classroom_id"] == "class_123"
        assert data["status"] == "active"
        
        print("✅ Attendance start test passed!")

if __name__ == "__main__":
    test_attendance_start()
