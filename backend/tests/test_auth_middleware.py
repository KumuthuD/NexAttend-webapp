import sys
import os
import unittest
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi import HTTPException, status

# Add the backend directory to sys.path
sys.path.insert(0, os.getcwd())

# Mock environment variables
os.environ.setdefault("SECRET_KEY", "test_secret_key")
os.environ.setdefault("JWT_SECRET", "test_jwt_secret")
os.environ.setdefault("MONGODB_URL", "mongodb://localhost:27017")

from app.api.deps import get_current_user
from app.models.user import User

class TestAuthMiddleware(unittest.IsolatedAsyncioTestCase):
    async def test_get_current_user_valid_token(self):
        # Setup mocks
        mock_db = MagicMock()
        mock_token = "valid_token"
        user_id = "65bd8c366e7f2a1b9c9e8d4a"
        mock_user_data = {
            "_id": user_id,
            "full_name": "Test User",
            "email": "test@example.com",
            "password_hash": "hashed",
            "role": "teacher",
            "is_active": True
        }
        
        # Mock security.verify_token to return user_id
        with patch("app.api.deps.security.verify_token", return_value=user_id):
            # Mock MongoDB find_one
            mock_db["users"].find_one = AsyncMock(return_value=mock_user_data)
            
            # Execute dependency
            user = await get_current_user(db=mock_db, token=mock_token)
            
            # Assertions
            self.assertIsInstance(user, User)
            self.assertEqual(user.email, "test@example.com")
            print(" Valid token test passed!")

    async def test_get_current_user_invalid_token(self):
        mock_db = MagicMock()
        mock_token = "invalid_token"
        
        with patch("app.api.deps.security.verify_token", return_value=None):
            with self.assertRaises(HTTPException) as cm:
                await get_current_user(db=mock_db, token=mock_token)
            
            self.assertEqual(cm.exception.status_code, status.HTTP_401_UNAUTHORIZED)
            print(" Invalid token test passed!")

    async def test_get_current_user_not_found(self):
        mock_db = MagicMock()
        mock_token = "valid_token"
        user_id = "65bd8c366e7f2a1b9c9e8d4a"
        
        with patch("app.api.deps.security.verify_token", return_value=user_id):
            mock_db["users"].find_one = AsyncMock(return_value=None)
            
            with self.assertRaises(HTTPException) as cm:
                await get_current_user(db=mock_db, token=mock_token)
            
            self.assertEqual(cm.exception.status_code, status.HTTP_404_NOT_FOUND)
            print(" User not found test passed!")

if __name__ == "__main__":
    unittest.main()
