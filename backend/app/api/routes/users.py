from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from typing import List
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, UserPasswordUpdate
from app.schemas.classroom import ClassroomResponse
from app.database.mongodb import get_database
from app.models.notification import Notification
from app.services.email_service import email_service
from app.core.security import get_password_hash, verify_password
import asyncio
from bson import ObjectId
import os
import shutil
import uuid

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
        await db["notifications"].insert_one(notification.model_dump(by_alias=True, exclude_none=True))
        
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

@router.post("/me/avatar", response_model=UserResponse)
async def upload_user_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Upload a new profile avatar.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )

    # Generate secure filename
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    
    filepath = os.path.join("uploads", "avatars", filename)
    
    # Save file
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    avatar_url = f"http://127.0.0.1:8000/uploads/avatars/{filename}"
    
    # Update user in DB
    await db["users"].update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"avatar": avatar_url}}
    )
    
    updated_user = current_user.model_copy(update={"avatar": avatar_url})
    
    return updated_user

@router.put("/me/password")
async def update_user_password(
    password_data: UserPasswordUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Update own user password.
    """
    # 1. Fetch the user document from the db to get the hashed password
    user_doc = await db["users"].find_one({"_id": ObjectId(current_user.id)})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # 2. Verify current password
    if not verify_password(password_data.current_password, user_doc.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )

    # 3. Hash the new password
    hashed_password = get_password_hash(password_data.new_password)

    # 4. Update the password in db
    await db["users"].update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {"password_hash": hashed_password}}
    )

    # 5. Trigger security notification
    notification = Notification(
        user_id=str(current_user.id),
        title="Security Alert",
        message="Your password was successfully updated.",
        type="warning"
    )
    await db["notifications"].insert_one(notification.model_dump(by_alias=True, exclude_none=True))

    return {"message": "Password updated successfully"}

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
