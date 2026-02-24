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

# allow origin wildcard (*) with credentials is invalid in CORS spec
# browsers block it — use explicit origin list from settings instead
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to NexAttend API", "status": "running"}

