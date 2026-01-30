from fastapi import APIRouter

router = APIRouter()

from app.schemas.health import HealthResponse

from app.database.mongodb import db

@router.get("/", response_model=HealthResponse)
async def health_check():
    """
    Check API and Database health
    """
    health_details = {"database": "disconnected"}
    status = "unhealthy"
    
    try:
        # Ping the database to verify connection
        if db.client:
            await db.client.admin.command('ping')
            health_details["database"] = "connected"
            status = "healthy"
    except Exception as e:
        health_details["database_error"] = str(e)
    
    return {
        "status": status,
        "details": health_details
    }
