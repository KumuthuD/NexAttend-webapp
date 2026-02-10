from fastapi import APIRouter
from app.api.routes import auth
from app.api.routes import students
from app.api.routes import health
from app.api.routes import users
from app.api.routes import faces
from app.api.routes import attendance

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["authentication"])
router.include_router(students.router, prefix="/students", tags=["students"])
router.include_router(health.router, prefix="/health", tags=["health"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(faces.router, prefix="/faces", tags=["faces"])
router.include_router(attendance.router, prefix="/attendance", tags=["attendance"])

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "NexAttend API"}
