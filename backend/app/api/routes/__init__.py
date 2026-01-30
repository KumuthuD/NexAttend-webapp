from fastapi import APIRouter
from app.database.mongodb import db
from app.api.routes import auth
from app.api.routes import students

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["authentication"])
router.include_router(students.router, prefix="/students", tags=["students"])

from app.api.routes import health

router.include_router(health.router, prefix="/health", tags=["health"])
