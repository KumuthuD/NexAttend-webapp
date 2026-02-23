from fastapi import APIRouter, Depends
from typing import List
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.classroom import ClassroomResponse
from app.database.mongodb import get_database
from bson import ObjectId

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_user_me(
    current_user: User = Depends(get_current_user)
):
    """
    Get current logged in user.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Update own user profile.
    """
    user_data = user_in.model_dump(exclude_unset=True)
    
    if user_data:
        await db["users"].update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": user_data}
        )
        
        # Update current_user object to return updated data
        # Pydantic v2 uses model_copy instead of copy
        updated_user = current_user.model_copy(update=user_data)
        return updated_user
        
    return current_user


@router.get("/me/classrooms", response_model=List[ClassroomResponse])
async def get_my_classrooms(
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get all classrooms belonging to the currently logged-in teacher.
    """
    classrooms = await db["classrooms"].find(
        {"teacher_id": current_user.id}
    ).to_list(100)

    response = []
    for cls in classrooms:
        response.append(ClassroomResponse(
            **cls,
            student_count=len(cls.get("student_ids", []))
        ))
    return response
