from fastapi import APIRouter, HTTPException, status, Body
from app.database.mongodb import get_database
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin, TokenResponse
from app.core.security import get_password_hash, verify_password, create_access_token

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


@router.post("/login", response_model=TokenResponse)
async def login_user(user_in: UserLogin):
    """
    OAuth2 compatible token login.
    Authenticate user and return JWT access token.
    """
    db = await get_database()
    
    # Find user by email
    user = await db["users"].find_one({"email": user_in.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(user_in.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is disabled"
        )
    
    # Create access token
    access_token = create_access_token(subject=str(user["_id"]))
    
    # Return token and user info
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=str(user["_id"]),
            full_name=user["full_name"],
            email=user["email"],
            role=user["role"],
            is_active=user.get("is_active", True)
        )
    )
