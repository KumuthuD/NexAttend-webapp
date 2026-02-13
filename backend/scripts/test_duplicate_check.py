import os
import sys
import unittest
from unittest.mock import MagicMock, AsyncMock

# Set environment before any imports
os.environ["MONGODB_URL"] = "mongodb://localhost:27017/test"
os.environ["SECRET_KEY"] = "test"
os.environ["JWT_SECRET"] = "test"

# Mock AI modules
sys.modules['deepface'] = MagicMock()
sys.modules['mtcnn'] = MagicMock()
sys.modules['cv2'] = MagicMock()
sys.modules['scipy'] = MagicMock()
sys.modules['scipy.spatial'] = MagicMock()
sys.modules['scipy.spatial.distance'] = MagicMock()

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from fastapi.testclient import TestClient
from app.main import app
from app.database.mongodb import get_database

class TestDuplicateCheck(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.mock_db = MagicMock()
        self.sessions_col = AsyncMock()
        self.students_col = AsyncMock()
        
        self.mock_db.__getitem__.side_effect = lambda name: {
            "attendance_sessions": self.sessions_col,
            "students": self.students_col
        }.get(name)
        
        app.dependency_overrides[get_database] = lambda: self.mock_db
        self.client = TestClient(app)

    async def test_atomic_duplicate_prevention(self):
        """
        Verify that multiple concurrent requests for the same student
        are handled atomically and don't create duplicate records.
        """
        print("\nTesting atomic duplicate prevention...")
        
        session_id = "sess_1"
        student_id = "stud_1"
        
        # 1. Mock session and student existence
        self.sessions_col.find_one.return_value = {
            "_id": session_id,
            "status": "active",
            "present_student_ids": []
        }
        self.students_col.find_one.return_value = {
            "_id": student_id,
            "full_name": "Test Student"
        }
        
        # 2. First request: Should succeed
        self.sessions_col.update_one.return_value = MagicMock(modified_count=1)
        
        payload = {
            "session_id": session_id,
            "student_id": student_id,
            "confidence": 0.9,
            "method": "face"
        }
        
        response1 = self.client.post("/api/v1/attendance/mark", json=payload)
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response1.json()["message"], "Attendance marked successfully")
        
        # Verify the query filters for non-existence of student_id
        update_call = self.sessions_col.update_one.call_args[0]
        query_filter = update_call[0]
        self.assertEqual(query_filter["present_student_ids"]["$ne"], student_id)
        
        # 3. Second request: Should return "already marked" (modified_count=0)
        self.sessions_col.update_one.return_value = MagicMock(modified_count=0)
        
        response2 = self.client.post("/api/v1/attendance/mark", json=payload)
        self.assertEqual(response2.status_code, 200)
        self.assertEqual(response2.json()["message"], "Attendance already marked")
        
        print("✅ Atomic duplicate prevention verified.")

if __name__ == "__main__":
    unittest.main()
