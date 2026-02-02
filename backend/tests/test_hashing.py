import sys
import os

# Add the backend directory to sys.path to allow imports from app
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.core.security import get_password_hash, verify_password
from app.services.auth_service import auth_service

def test_password_hashing():
    password = "securepassword123"
    hashed = get_password_hash(password)
    
    # Test direct hashing util
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False
    
    # Test auth service wrapper
    service_hashed = auth_service.hash_password(password)
    assert auth_service.verify_password(password, service_hashed) is True
    assert auth_service.verify_password("wrongpassword", service_hashed) is False
    
    print("✅ All password hashing tests passed!")

if __name__ == "__main__":
    test_password_hashing()
