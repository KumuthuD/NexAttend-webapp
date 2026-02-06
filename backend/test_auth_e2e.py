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

# Mock AI modules before they are imported by the app
from unittest.mock import MagicMock
sys.modules["app.services.face_detector"] = MagicMock()
sys.modules["app.services.embedding_service"] = MagicMock()
sys.modules["deepface"] = MagicMock()

from app.main import app
from app.database.mongodb import get_database

client = TestClient(app)

class TestAuthE2E(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.mock_db = MagicMock()
        # Override dependency
        app.dependency_overrides[get_database] = lambda: self.mock_db
        
    def tearDown(self):
        app.dependency_overrides = {}

    async def test_full_auth_flow(self):
        """
        Tests the complete cycle: Register -> Login -> Access Protected Route
        """
        print("\nStarting Full Auth Flow Test...")
        user_email = "e2e@example.com"
        user_password = "password123"
        user_id = str(ObjectId())
        
        # 1. Registration
        registration_data = {
            "full_name": "E2E User",
            "email": user_email,
            "password": user_password,
            "role": "teacher"
        }
        # First call: check existing, Second call: find_one after insert
        self.mock_db["users"].find_one = AsyncMock(side_effect=[None, {"_id": user_id, **registration_data}, {"_id": user_id, **registration_data}])
        self.mock_db["users"].insert_one = AsyncMock(return_value=MagicMock(inserted_id=user_id))
        
        response = client.post("/api/v1/auth/register", json=registration_data)
        self.assertEqual(response.status_code, 201)
        print("✅ E2E Registration test passed!")

        # 2. Login
        from app.core.security import get_password_hash
        hashed_password = get_password_hash(user_password)
        mock_user = {
            "_id": user_id, 
            "email": user_email, 
            "password_hash": hashed_password,
            "full_name": "E2E User",
            "role": "teacher",
            "is_active": True
        }
        # Mock find_one for login
        self.mock_db["users"].find_one = AsyncMock(return_value=mock_user)
        
        login_data = {"username": user_email, "password": user_password}
        response = client.post("/api/v1/auth/login", data=login_data)
        self.assertEqual(response.status_code, 200)
        token = response.json()["access_token"]
        print("✅ E2E Login test passed!")

        # 3. Access Protected Route (/api/v1/auth/me)
        # The dependency call get_current_user also calls find_one
        self.mock_db["users"].find_one = AsyncMock(return_value=mock_user)
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/auth/me", headers=headers)
        if response.status_code != 200:
            print(f"Error Response: {response.json()}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["email"], user_email)
        print("✅ E2E Protected Route (/me) test passed!")

    async def test_auth_failures(self):
        """
        Tests negative cases: Invalid login, Missing token, Invalid token
        """
        print("\nStarting Auth Failures Test...")
        # 1. Invalid Login
        self.mock_db["users"].find_one = AsyncMock(return_value=None)
        response = client.post("/api/v1/auth/login", data={"username": "wrong@ex.com", "password": "p"})
        self.assertEqual(response.status_code, 401)
        print("✅ E2E Invalid Login handling passed!")

        # 2. Missing Token
        response = client.get("/api/v1/auth/me")
        self.assertEqual(response.status_code, 401)
        print("✅ E2E Missing Token handling passed!")

        # 3. Invalid Token
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/v1/auth/me", headers=headers)
        self.assertEqual(response.status_code, 401)
        print("✅ E2E Invalid Token handling passed!")

if __name__ == "__main__":
    unittest.main()
