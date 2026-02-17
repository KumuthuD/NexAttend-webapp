from fastapi import APIRouter, HTTPException, status, Body, Depends
from app.database.mongodb import get_database
from app.models.event import Event
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.api.deps import get_current_user
from app.models.user import User
from typing import Any, List
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.get("", response_model=List[EventResponse])
async def get_events(
    current_user: User = Depends(get_current_user),
    db: Any = Depends(get_database)
):
    """
    Retrieve all events for the current user.
    """
    events_cursor = db["events"].find({"user_id": str(current_user.id)})
    events = await events_cursor.to_list(length=1000)
    return events

@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_in: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Any = Depends(get_database)
):
    """
    Create a new event.
    """
    event = Event(**event_in.model_dump(), user_id=str(current_user.id))
    
    event_data = event.model_dump(by_alias=True, exclude=["id"])
    if "_id" in event_data and event_data["_id"] is None:
        del event_data["_id"]
        
    new_event = await db["events"].insert_one(event_data)
    
    created_event = await db["events"].find_one({"_id": new_event.inserted_id})
    return created_event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: Any = Depends(get_database)
):
    """
    Delete an event.
    """
    event = await db["events"].find_one({"_id": ObjectId(event_id), "user_id": str(current_user.id)})
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
        
    await db["events"].delete_one({"_id": ObjectId(event_id)})
    return None
