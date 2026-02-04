import asyncio
import os
import sys
from unittest.mock import MagicMock, AsyncMock
from bson import ObjectId

# Add project root to path
PROJECT_ROOT = os.getcwd()
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

# MOCK DB globally before importing app
from app.database import mongodb
from app.core.security import create_access_token, get_password_hash

mock_users_col = AsyncMock()

# Mock user data
mock_user_id = str(ObjectId())
mock_user_data = {
    "_id": ObjectId(mock_user_id),
    "full_name": "Test User",
    "email": "test@example.com",
    "password_hash": get_password_hash("testpassword"),
    "role": "teacher",
    "is_active": True
}

# Mock find_one for me endpoint
async def mock_find_one(query):
    if query.get("_id") == ObjectId(mock_user_id):
        return mock_user_data
    return None

mock_users_col.find_one = AsyncMock(side_effect=mock_find_one)

mock_db_obj = MagicMock()
mock_db_obj.__getitem__ = MagicMock(return_value=mock_users_col)

# REPLACING THE GLOBAL DB OBJECT
mongodb.db.db = mock_db_obj
mongodb.db.connect = MagicMock()
mongodb.db.close = MagicMock()

from fastapi.testclient import TestClient
from app.main import app

def test_get_me():
    print("Testing GET /me Endpoint (MOCKED)...")
    
    # Generate valid token
    token = create_access_token(subject=mock_user_id)
    
    with TestClient(app) as client:
        # 1. Test Successful /me
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/users/me", headers=headers)
        
        print(f"Success GET /me Status: {response.status_code}")
        if response.status_code != 200:
            print(f"Response: {response.json()}")
            
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["full_name"] == "Test User"
        print("✅ Successful /me retrieval test passed!")

        # 2. Test Invalid Token
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/v1/users/me", headers=headers)
        print(f"Invalid Token Status: {response.status_code}")
        assert response.status_code == 403
        print("✅ Invalid token rejection test passed!")

        # 3. Test Missing Token
        response = client.get("/api/v1/users/me")
        print(f"Missing Token Status: {response.status_code}")
        # OAuth2PasswordBearer returns 401 for missing token
        assert response.status_code == 401
        print("✅ Missing token rejection test passed!")

if __name__ == "__main__":
    test_get_me()
