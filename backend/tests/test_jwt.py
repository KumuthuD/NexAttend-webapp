import sys
import os
from datetime import timedelta

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), "backend"))

# Mock environment variables for testing if not set
os.environ.setdefault("SECRET_KEY", "test_secret_key")
os.environ.setdefault("JWT_SECRET", "test_jwt_secret")
os.environ.setdefault("MONGODB_URL", "mongodb://localhost:27017")

from app.core.security import create_access_token, verify_token

def test_jwt_flow():
    user_id = "test_user_123"
    
    print("Testing JWT Flow...")
    
#Create token
    token = create_access_token(subject=user_id)
    assert token is not None
    print("Step 1: Token created successfully.")
    
    #Verify token
    decoded_sub = verify_token(token)
    assert decoded_sub == user_id
    print(f"Step 2: Token verified for subject: {decoded_sub}")

  #Test expired token (short expiry)
    expired_token = create_access_token(subject=user_id, expires_delta=timedelta(seconds=-1))
    assert verify_token(expired_token) is None
    print("Step 3: Expired token correctly rejected.")

if __name__ == "__main__":
    try:
        test_jwt_flow()
        print("\n All JWT tests passed!")
    except Exception as e:
        print(f"\n Test failed: {e}")
        sys.exit(1)
