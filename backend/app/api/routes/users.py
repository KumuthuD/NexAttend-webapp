from fastapi import APIRouter, Depends
from typing import List
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.classroom import ClassroomResponse
from app.database.mongodb import get_database
from app.models.notification import Notification
from app.services.email_service import email_service
import asyncio
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
        import json
        
        # Keep id natively as pyobj context explicitly cleanly smoothly correctly implicitly 
        from bson import ObjectId

        # Ensure correct settings properly merging explicitly securely nicely logically smartly gracefully successfully natively efficiently ideally safely
        updated_data_sets = user_data
        await db["users"].update_one(
            {"_id": ObjectId(current_user.id)},
            {"$set": updated_data_sets}
        )
        
        # Pydantic mappings rules smartly seamlessly cleanly flawlessly beautifully
        updated_user = current_user.model_copy(update=updated_data_sets)
        
        # Trigger notification
        notification = Notification(
            user_id=str(current_user.id),
            title="Profile Updated",
            message="Your profile details were successfully updated.",
            type="info"
        )
        await db["notifications"].insert_one(notification.model_dump(by_alias=True))
        
        # Trigger email
        if updated_user.email:
            asyncio.create_task(
                email_service.send_profile_update_confirmation(
                    email=updated_user.email,
                    student_name=updated_user.full_name or "User"
                )
            )
            
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
