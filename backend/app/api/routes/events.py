from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from uuid import uuid4

from app.database.mongodb import get_database
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.calendar_event import (
    CalendarEventCreate,
    CalendarEventUpdate,
    CalendarEventResponse,
)

router = APIRouter()

# Default colour map keyed by event type
_DEFAULT_COLORS = {
    "class": "border-violet-500 bg-violet-50 dark:bg-violet-500/10",
    "meeting": "border-blue-500 bg-blue-50 dark:bg-blue-500/10",
    "deadline": "border-rose-500 bg-rose-50 dark:bg-rose-500/10",
}


@router.get("", response_model=List[CalendarEventResponse])
async def list_events(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2000),
    db=Depends(get_database),
    current_user: User = Depends(get_current_user),
):
    """Return all calendar events belonging to the current user.
    Optionally filter by month/year.
    """
    query = {"user_id": str(current_user.id)}

    if month and year:
        # Filter by YYYY-MM prefix
        prefix = f"{year}-{month:02d}"
        query["date"] = {"$regex": f"^{prefix}"}

    cursor = db["calendar_events"].find(query).sort("date", 1)
    events = await cursor.to_list(length=500)
    return events


@router.post("", response_model=CalendarEventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    payload: CalendarEventCreate,
    db=Depends(get_database),
    current_user: User = Depends(get_current_user),
):
    """Create a new calendar event for the current user."""
    color = payload.color or _DEFAULT_COLORS.get(payload.type, _DEFAULT_COLORS["class"])

    event_doc = {
        "_id": str(uuid4()),
        "user_id": str(current_user.id),
        "title": payload.title,
        "date": payload.date,
        "start_time": payload.start_time,
        "end_time": payload.end_time,
        "location": payload.location,
        "type": payload.type,
        "color": color,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    await db["calendar_events"].insert_one(event_doc)
    return event_doc


@router.put("/{event_id}", response_model=CalendarEventResponse)
async def update_event(
    event_id: str,
    payload: CalendarEventUpdate,
    db=Depends(get_database),
    current_user: User = Depends(get_current_user),
):
    """Update a calendar event. Only the event owner can update."""
    existing = await db["calendar_events"].find_one({"_id": event_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")
    if existing["user_id"] != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorised to edit this event")

    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Re-derive colour if event type changed but colour not explicitly set
    if "type" in update_data and "color" not in update_data:
        update_data["color"] = _DEFAULT_COLORS.get(update_data["type"], existing["color"])

    update_data["updated_at"] = datetime.utcnow()

    await db["calendar_events"].update_one({"_id": event_id}, {"$set": update_data})
    updated = await db["calendar_events"].find_one({"_id": event_id})
    return updated


@router.delete("/{event_id}", status_code=status.HTTP_200_OK)
async def delete_event(
    event_id: str,
    db=Depends(get_database),
    current_user: User = Depends(get_current_user),
):
    """Delete a calendar event. Only the event owner can delete."""
    existing = await db["calendar_events"].find_one({"_id": event_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")
    if existing["user_id"] != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorised to delete this event")

    await db["calendar_events"].delete_one({"_id": event_id})
    return {"message": "Event deleted successfully"}
