import asyncio
import os
import sys
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, AsyncMock

# Add project root to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.main import app
from app.database.mongodb import get_database

# Create Mock DB
mock_db = MagicMock()
mock_users = AsyncMock()
mock_db.__getitem__.return_value = mock_users

# Mock insert_one
mock_users.insert_one.return_value = MagicMock(inserted_id="mock_user_id")

# Mock find_one (first call for unique check returns None, second for created user returns data)
mock_users.find_one.side_effect = [
    None,  # User doesn't exist yet
    {      # User created
        "_id": "mock_user_id",
        "full_name": "Test Teacher",
        "email": "teacher@example.com",
        "role": "teacher",
        "is_active": True
    }
]

async def override_get_database():
    return mock_db

app.dependency_overrides[get_database] = override_get_database

def test_user_registration():
    print("Testing User Registration Endpoint...")
    
    with TestClient(app) as client:
        # Test Data
        user_data = {
            "full_name": "Test Teacher",
            "email": "teacher@example.com",
            "password": "securepassword123",
            "role": "teacher"
        }
        
        # Make Request
        response = client.post("/api/v1/auth/register", json=user_data)
        
        # Verify Response
        print(f"Status Code: {response.status_code}")
        if response.status_code != 201:
            print(f"Error: {response.json()}")
            
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == user_data["email"]
        assert "password" not in data # Should not return password
        assert "password_hash" not in data
        
        print(" Registration test passed!")

if __name__ == "__main__":
    test_user_registration()
