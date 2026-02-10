import sys
import os
import unittest
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient
from bson import ObjectId

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

class TestClassEmbeddings(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.mock_db = MagicMock()
        app.dependency_overrides[get_database] = lambda: self.mock_db
        
    def tearDown(self):
        app.dependency_overrides = {}

    async def test_get_class_embeddings(self):
        """
        Verify that the class embeddings endpoint correctly joins classroom, student, and embedding data.
        """
        print("\nTesting Get Class Embeddings Endpoint...")
        
        class_id = "test_class_123"
        student_id = "student_789"
        embedding_id = "emb_456"
        
        # 1. Mock Classroom finding
        self.mock_db["classrooms"].find_one = AsyncMock(return_value={
            "_id": class_id,
            "name": "Test Class",
            "student_ids": [student_id]
        })
        
        # 2. Mock Aggregation results
        mock_embedding = [0.1, 0.2, 0.3, 0.4]
        self.mock_db["students"].aggregate = MagicMock()
        self.mock_db["students"].aggregate.return_value.to_list = AsyncMock(return_value=[
            {
                "student_id": student_id,
                "name": "Jane Doe",
                "roll_number": "CS101",
                "embedding": mock_embedding
            }
        ])
        
        response = client.get(f"/api/v1/classes/{class_id}/embeddings")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["student_id"], student_id)
        self.assertEqual(data[0]["name"], "Jane Doe")
        self.assertEqual(data[0]["embedding"], mock_embedding)
        
        print("✅ Class embeddings retrieval verified successfully!")

if __name__ == "__main__":
    unittest.main()
