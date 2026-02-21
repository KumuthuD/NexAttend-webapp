import asyncio
import os
import sys
from unittest.mock import MagicMock, AsyncMock

# Add project root to path
PROJECT_ROOT = os.getcwd()
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

# MOCK DB globally before importing app
from app.database import mongodb

mock_students_col = AsyncMock()
mock_embeddings_col = AsyncMock()

mock_db_obj = MagicMock()
def get_col(name):
    if name == "students": return mock_students_col
    if name == "face_embeddings": return mock_embeddings_col
    return MagicMock()

mock_db_obj.__getitem__ = MagicMock(side_effect=get_col)

# REPLACING THE GLOBAL DB OBJECT
mongodb.db.db = mock_db_obj
mongodb.db.connect = MagicMock()
mongodb.db.close = MagicMock()

from fastapi.testclient import TestClient
from app.main import app
from app.database.mongodb import get_database

# OVERRIDE DEPENDENCY
async def override_get_database():
    return mock_db_obj

app.dependency_overrides[get_database] = override_get_database

def test_student_registration_with_face():
    print("Testing Student Registration with Face (MOCKED)...")
    
    with TestClient(app) as client:
        # Mock find_one to return None (student doesn't exist)
        mock_students_col.find_one.return_value = None
        
        # Mock insert_one to simulate insertion
        mock_students_col.insert_one.return_value = MagicMock(inserted_id="mock_student_id")
        mock_embeddings_col.insert_one.return_value = MagicMock(inserted_id="mock_embedding_id")
        
        # Mock find_one after insertion to return the created student
        mock_students_col.find_one.side_effect = [
            None, # First call (check exists)
            {
                "_id": "mock_student_id_123",
                "name": "Jane Doe",
                "roll_number": "CS2024002",
                "email": "jane@example.com",
                "course": "Computer Science",
                "year": 1,
                "has_registered_face": True,
                "created_at": "2024-02-05T00:00:00"
            } # Second call (after insertion)
        ]
        
        student_data = {
            "name": "Jane Doe",
            "roll_number": "CS2024002",
            "email": "jane@example.com",
            "course": "Computer Science",
            "year": 1,
            "face_embedding": [0.1] * 128
        }
        
        response = client.post("/api/v1/students/register", json=student_data)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code != 201:
            print(f"Response: {response.json()}")
            
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "jane@example.com"
        assert data["has_registered_face"] is True
        
        # Verify both collections were called
        assert mock_students_col.insert_one.called
        assert mock_embeddings_col.insert_one.called
        
        print(" Student registration with face test passed!")

if __name__ == "__main__":
    test_student_registration_with_face()
