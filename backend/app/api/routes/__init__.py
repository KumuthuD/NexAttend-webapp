from fastapi import APIRouter, Depends
from app.database.mongodb import db

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "NexAttend API"}

@router.get("/db-health")
async def db_health_check():
    """Test MongoDB connection by pinging the database"""
    try:
        # Ping the database
        await db.client.admin.command('ping')
        # Get list of collections
        collections = await db.db.list_collection_names()
        return {
            "status": "connected",
            "database": db.db.name,
            "collections": collections
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
