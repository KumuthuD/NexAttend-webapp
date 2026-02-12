import sys
import os
import unittest
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), "backend"))

# Mock environment variables BEFORE importing app
os.environ.setdefault("SECRET_KEY", "test_secret_key")
os.environ.setdefault("JWT_SECRET", "test_jwt_secret")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
os.environ.setdefault("MONGODB_URL", "mongodb://localhost:27017")
os.environ.setdefault("DATABASE_NAME", "nexattend_test")
os.environ.setdefault("API_V1_STR", "/api/v1")

# Mock AI modules to prevent dependency issues
sys.modules["app.services.face_detector"] = MagicMock()
sys.modules["app.services.embedding_service"] = MagicMock()
sys.modules["deepface"] = MagicMock()

from app.main import app
from app.database.mongodb import get_database

client = TestClient(app)

class TestDBOptimization(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.mock_db = MagicMock()
        app.dependency_overrides[get_database] = lambda: self.mock_db
        
    def tearDown(self):
        app.dependency_overrides = {}

    async def test_optimized_embeddings_query(self):
        """
        Verify that the embeddings endpoint uses the optimized classroom_id matching.
        """
        print("\nTesting Optimized DB Query...")
        
        class_id = "class_math_101"
        student_id = "student_s1"
        
        # 1. Mock Classroom finding (only for existence check)
        self.mock_db["classrooms"].find_one = AsyncMock(return_value={"_id": class_id})
        
        # 2. Mock Aggregation results
        mock_embedding = [0.55, -0.22, 0.11]
        self.mock_db["students"].aggregate = MagicMock()
        self.mock_db["students"].aggregate.return_value.to_list = AsyncMock(return_value=[
            {
                "student_id": student_id,
                "name": "Sudam",
                "roll_number": "R001",
                "embedding": mock_embedding
            }
        ])
        
        response = client.get(f"/api/v1/classes/{class_id}/embeddings")
        
        # Check Response
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["name"], "Sudam")
        
        # Verify Pipeline Logic (Crucial for optimization check)
        pipeline = self.mock_db["students"].aggregate.call_args[0][0]
        match_stage = pipeline[0]
        self.assertIn("$match", match_stage)
        self.assertEqual(match_stage["$match"]["classroom_id"], class_id)
        
        print("✅ Optimized query pipeline verified: Using classroom_id indexing!")

if __name__ == "__main__":
    unittest.main()
