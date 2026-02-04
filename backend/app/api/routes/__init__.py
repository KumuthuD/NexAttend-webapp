from fastapi import APIRouter
from app.api.routes import auth
from app.api.routes import students
from app.api.routes import health
from app.api.routes import faces

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["authentication"])
router.include_router(students.router, prefix="/students", tags=["students"])
router.include_router(health.router, prefix="/health", tags=["health"])
router.include_router(faces.router, prefix="/faces", tags=["faces"])

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "NexAttend API"}
