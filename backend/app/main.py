from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.routes import router as api_router
from app.database.mongodb import db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to DB
    db.connect()
    yield
    # Shutdown: Close DB
    db.close()


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    debug=settings.DEBUG,
    lifespan=lifespan
)

# CORS Configuration - Allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to NexAttend API", "status": "running"}
