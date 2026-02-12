import sys
import os
import unittest
from unittest.mock import MagicMock, AsyncMock
from datetime import datetime
from fastapi.testclient import TestClient

# Add local backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

# Mock environment
os.environ.setdefault("SECRET_KEY", "test_secret")
os.environ.setdefault("JWT_SECRET", "test_jwt")
os.environ.setdefault("MONGODB_URL", "mongodb://test:27017")
os.environ.setdefault("DATABASE_NAME", "nexattend_test")
os.environ.setdefault("API_V1_STR", "/api/v1")

# Mock dependencies
sys.modules["app.services.face_detector"] = MagicMock()
sys.modules["app.services.embedding_service"] = MagicMock()
sys.modules["deepface"] = MagicMock()

from fastapi import FastAPI
from app.api.routes.attendance import router as attendance_router
from app.database.mongodb import get_database

# Create isolated app for testing
app = FastAPI()
app.include_router(attendance_router, prefix="/api/v1/attendance")

# Mock DB dependency
async def override_get_database():
    return MagicMock()

app.dependency_overrides[get_database] = override_get_database

client = TestClient(app)
import app.schemas.attendance
print(f"DEBUG: Loaded schemas from {app.schemas.attendance.__file__}")
print(f"DEBUG: Attributes in schemas: {dir(app.schemas.attendance)}")


class TestBatchAttendance(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.mock_db = MagicMock()
        app.dependency_overrides[get_database] = lambda: self.mock_db
        
    def tearDown(self):
        app.dependency_overrides = {}

    async def test_batch_mark(self):
        print("\nTesting Batch Attendance Marking...")
        
        session_id = "sess_123"
        student1 = "student_1"
        student2 = "student_2" # new
        student3 = "student_1" # duplicate in list
        
        # 1. Mock Session
        self.mock_db["attendance_sessions"].find_one = AsyncMock(return_value={
            "_id": session_id,
            "status": "active",
            "present_student_ids": [] # initially empty
        })
        
        # 2. Mock Update
        mock_result = MagicMock()
        mock_result.modified_count = 1
        self.mock_db["attendance_sessions"].update_one = AsyncMock(return_value=mock_result)
        
        payload = {
            "session_id": session_id,
            "students": [
                {"session_id": session_id, "student_id": student1, "confidence": 0.99},
                {"session_id": session_id, "student_id": student2, "confidence": 0.95},
                {"session_id": session_id, "student_id": student3, "confidence": 0.99} # Duplicate
            ]
        }
        
        response = client.post("/api/v1/attendance/batch-mark", json=payload)
        
        # Verify
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        print(f"Response: {data['message']}")
        self.assertEqual(data["marked_count"], 2) # Student 1 and 2
        self.assertEqual(data["skipped_count"], 1) # Student 3 (duplicate)
        self.assertEqual(len(data["results"]), 2)
        
        # Verify DB Call
        update_call = self.mock_db["attendance_sessions"].update_one.call_args
        update_query = update_call[0][0]
        update_op = update_call[0][1]
        
        self.assertEqual(update_query["_id"], session_id)
        self.assertIn("$push", update_op)
        self.assertEqual(len(update_op["$push"]["records"]["$each"]), 2)
        
        print("✅ Batch marking verified!")

if __name__ == "__main__":
    unittest.main()
