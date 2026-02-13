import sys
import os
import unittest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, AsyncMock
from uuid import uuid4
from datetime import datetime

# Add local backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

# Mock environment
os.environ.setdefault("SECRET_KEY", "test_secret")
os.environ.setdefault("MONGODB_URL", "mongodb://test:27017")
os.environ.setdefault("DATABASE_NAME", "nexattend_test")

from app.main import app
from app.database.mongodb import get_database

client = TestClient(app)

class TestSessionResults(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.mock_db = MagicMock()
        app.dependency_overrides[get_database] = lambda: self.mock_db
        
    def tearDown(self):
        app.dependency_overrides = {}

    async def test_get_session_by_id(self):
        session_id = str(uuid4())
        now_iso = datetime.utcnow().isoformat()
        mock_session = {
            "_id": session_id,
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
        
        self.mock_db["attendance_sessions"].find_one = AsyncMock(return_value=mock_session)
        
        response = client.get(f"/api/v1/attendance/session/{session_id}")
        if response.status_code != 200:
            print(f"FAILED GET Response: {response.text}")
        self.assertEqual(response.status_code, 200)
        # Pydantic will map _id to id in the response
        self.assertEqual(response.json()["id"], session_id)
        print(f"✅ Successfully retrieved session {session_id}")

    async def test_get_session_not_found(self):
        self.mock_db["attendance_sessions"].find_one = AsyncMock(return_value=None)
        response = client.get("/api/v1/attendance/session/missing_id")
        self.assertEqual(response.status_code, 404)
        print("✅ Correctly handled 404 for missing session")

    async def test_list_classroom_sessions(self):
        classroom_id = "class_456"
        now_iso = datetime.utcnow().isoformat()
        mock_sessions = [
            {"_id": "s1", "classroom_id": classroom_id, "session_date": now_iso, "status": "completed", 
             "start_time": now_iso, "created_at": now_iso, "updated_at": now_iso},
            {"_id": "s2", "classroom_id": classroom_id, "session_date": now_iso, "status": "active",
             "start_time": now_iso, "created_at": now_iso, "updated_at": now_iso}
        ]
        
        mock_cursor = MagicMock()
        mock_cursor.sort.return_value = mock_cursor
        mock_cursor.to_list = AsyncMock(return_value=mock_sessions)
        self.mock_db["attendance_sessions"].find = MagicMock(return_value=mock_cursor)
        
        response = client.get(f"/api/v1/attendance/classroom/{classroom_id}/sessions")
        if response.status_code != 200:
            print(f"FAILED List Response: {response.text}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)
        self.assertEqual(response.json()[0]["id"], "s1")
        print(f"✅ Successfully listed {len(response.json())} sessions for classroom {classroom_id}")

    async def test_end_session(self):
        session_id = "sess_789"
        now_iso = datetime.utcnow().isoformat()
        self.mock_db["attendance_sessions"].update_one = AsyncMock(return_value=MagicMock(matched_count=1))
        self.mock_db["attendance_sessions"].find_one = AsyncMock(return_value={
            "_id": session_id, "status": "completed", "classroom_id": "c1", "session_date": now_iso,
            "start_time": now_iso, "created_at": now_iso, "updated_at": now_iso
        })
        
        response = client.post(f"/api/v1/attendance/session/{session_id}/end")
        if response.status_code != 200:
            print(f"FAILED End Response: {response.text}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "completed")
        self.assertEqual(response.json()["id"], session_id)
        print(f"✅ Successfully ended session {session_id}")

if __name__ == "__main__":
    unittest.main()
