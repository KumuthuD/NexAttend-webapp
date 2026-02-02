from fastapi import APIRouter, HTTPException, status, Body
from app.database.mongodb import get_database
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.security import get_password_hash

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserCreate):
    """
    Register a new user (teacher/admin).
    """
    db = await get_database()
    
    # Check if user already exists
    existing_user = await db["users"].find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_in.password)
    
    # Create user model
    user_model = User(
        full_name=user_in.full_name,
        email=user_in.email,
        password_hash=hashed_password,
        role=user_in.role
    )
    
    # Save to database
    new_user = await db["users"].insert_one(user_model.model_dump(by_alias=True))
    created_user = await db["users"].find_one({"_id": new_user.inserted_id})
    
    return created_user
