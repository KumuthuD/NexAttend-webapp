from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings
from app.core import security
from app.database.mongodb import get_database
from app.models.user import User
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

async def get_current_user(
    db = Depends(get_database),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    FastAPI dependency to get the current authenticated user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verify token and extract subject (user_id)
    user_id = security.verify_token(token)
    if user_id is None:
        raise credentials_exception
    
    # Fetch user from database
    user_data = await db["users"].find_one({"_id": ObjectId(user_id)})
    if user_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    return User(**user_data)
