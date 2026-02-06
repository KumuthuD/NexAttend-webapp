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

from app.main import app
from app.database.mongodb import get_database

client = TestClient(app)

class TestAuthE2E(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.mock_db = MagicMock()
        # Override dependency
        app.dependency_overrides[get_database] = lambda: self.mock_db
        
    async def test_auth_registration_and_login_flow(self):
        # 1. Test Registration
        user_email = "e2e@example.com"
        user_password = "password123"
        registration_data = {
            "full_name": "E2E User",
            "email": user_email,
            "password": user_password,
            "role": "teacher"
        }
        
        # Mock registration: Check existing user (none)
        self.mock_db["users"].find_one = AsyncMock(side_effect=[None, {"_id": "test_id", **registration_data}])
        self.mock_db["users"].insert_one = AsyncMock(return_value=MagicMock(inserted_id="test_id"))
        
        response = client.post("/api/v1/auth/register", json=registration_data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["email"], user_email)
        print("✅ E2E Registration test passed!")

        # 2. Test Login
        # Mock login: find user and verify password
        from app.core.security import get_password_hash
        hashed_password = get_password_hash(user_password)
        mock_user = {
            "_id": "test_id", 
            "email": user_email, 
            "password_hash": hashed_password
        }
        self.mock_db["users"].find_one = AsyncMock(return_value=mock_user)
        
        login_data = {"username": user_email, "password": user_password}
        response = client.post("/api/v1/auth/login", data=login_data)
        
        self.assertEqual(response.status_code, 200)
        token_data = response.json()
        self.assertIn("access_token", token_data)
        self.assertEqual(token_data["token_type"], "bearer")
        print("✅ E2E Login test passed!")
        
        return token_data["access_token"]

if __name__ == "__main__":
    unittest.main()
