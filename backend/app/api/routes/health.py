from fastapi import APIRouter

router = APIRouter()

from app.schemas.health import HealthResponse

@router.get("/", response_model=HealthResponse)
async def health_check():
    """
    Basic health check endpoint
    """
    return {"status": "ok"}
