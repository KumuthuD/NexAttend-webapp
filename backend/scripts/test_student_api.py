import asyncio
import os
import sys
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient

# Add project root to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.main import app
from app.database.mongodb import get_database

# Create a Mock DB structure
mock_db_instance = MagicMock()
mock_collection = AsyncMock()

# Mock find().skip().limit().to_list()
mock_cursor = AsyncMock()
mock_cursor.skip.return_value = mock_cursor
mock_cursor.limit.return_value = mock_cursor
mock_cursor.to_list.return_value = []

mock_collection.find.return_value = mock_cursor
mock_collection.find_one.return_value = None
mock_collection.insert_one.return_value = MagicMock(inserted_id="mock_id")

# Dictionary access db["students"]
mock_db_instance.__getitem__.return_value = mock_collection

async def override_get_database():
    return mock_db_instance

app.dependency_overrides[get_database] = override_get_database

def test_api_structure():
    print("Testing API Structure with MOCKED DB...")
    
    # We use TestClient as context manager to trigger startup/shutdown events if needed, 
    # but here we mocked the dependency so DB connection code in lifespan might still run and fail 
    # if we don't mock it or if it traps errors.
    # However, TestClient(app) calls lifespan. 
    # app.database.mongodb.db.connect() will try to connect.
    # We should patch app.database.mongodb.db.connect too to avoid connection error logging/delays.
    
    with TestClient(app) as client:
        # 1. Test Health
        response = client.get("/api/v1/health")
        print(f"Health Check: {response.status_code}")
        assert response.status_code == 200
        
        # 2. Test Student List
        # Should now return 200 with empty list (from mock)
        response = client.get("/api/v1/students/")
        print(f"Get Students Route Status: {response.status_code}")
        # If mock works key access error should be gone
        assert response.status_code == 200
        assert response.json() == []
        
        # 3. Test Create Student Validation
        bad_data = {"name": "Test"} # Missing fields
        response = client.post("/api/v1/students/", json=bad_data)
        print(f"Validation Check (Bad Data): {response.status_code}")
        assert response.status_code == 422
        
        print("\n API Router Structure Verified (with Mock DB)!")

if __name__ == "__main__":
    test_api_structure()
