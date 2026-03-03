from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.database.mongodb import get_database
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse
from app.api.deps import get_current_user
from app.models.user import User
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
async def get_user_notifications(
    db=Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """
    Get all notifications for the current user, sorted by creation date descending.
    """
    try:
        user_id = str(current_user.id)
        cursor = db["notifications"].find({"user_id": user_id}).sort("created_at", -1)
        notifications = await cursor.to_list(length=100)
        
        response = []
        for notif in notifications:
            notif["id"] = str(notif["_id"])
            response.append(NotificationResponse(**notif))
            
        return response
    except Exception as e:
        logger.error(f"Error fetching notifications for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch notifications"
        )


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: str,
    db=Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """
    Mark a specific notification as read.
    """
    user_id = str(current_user.id)
    try:
        obj_id = ObjectId(notification_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notification ID format"
        )

    # Ensure the notification belongs to this user
    notif = await db["notifications"].find_one({"_id": obj_id, "user_id": user_id})
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    result = await db["notifications"].update_one(
        {"_id": obj_id},
        {"$set": {"read": True}}
    )

    if result.modified_count == 0 and not notif.get("read"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notification as read"
        )

    updated_notif = await db["notifications"].find_one({"_id": obj_id})
    updated_notif["id"] = str(updated_notif["_id"])
    return NotificationResponse(**updated_notif)


@router.put("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_notifications_read(
    db=Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """
    Mark all notifications for the current user as read.
    """
    user_id = str(current_user.id)
    try:
        result = await db["notifications"].update_many(
            {"user_id": user_id, "read": False},
            {"$set": {"read": True}}
        )
        return {"message": f"Successfully marked {result.modified_count} notifications as read"}
    except Exception as e:
        logger.error(f"Error marking all notifications read for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notifications as read"
        )


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: str,
    db=Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a specific notification.
    """
    user_id = str(current_user.id)
    try:
        obj_id = ObjectId(notification_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notification ID format"
        )

    result = await db["notifications"].delete_one({"_id": obj_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return {"message": "Notification deleted successfully"}

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def clear_all_notifications(
    db=Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """
    Delete all notifications for the current user.
    """
    user_id = str(current_user.id)
    try:
        await db["notifications"].delete_many({"user_id": user_id})
        return {"message": "All notifications cleared"}
    except Exception as e:
        logger.error(f"Error clearing notifications for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear notifications"
        )
