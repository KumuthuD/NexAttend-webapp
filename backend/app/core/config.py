from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "NexAttend API"
    APP_NAME: str = "AI-Attendance-System"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True
    
    # CORS Configuration
    # add any new deployment URLs here
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://localhost:8001",
        "https://nexattend.com",
        "https://www.nexattend.com",
        "https://nex-attend-webapp.vercel.app",
        "https://nexattend.com",
        "https://api.nexattend.com",
    ]
    
    # Database
    MONGODB_URL: str 
    DATABASE_NAME: str = "nexattend_db"
    MONGODB_TLS: bool = True

    # Security
    SECRET_KEY: str 
    JWT_SECRET: str 
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Face Recognition
    FACE_MODEL: str = "Facenet"
    SIMILARITY_THRESHOLD: float = 0.85
    
    # Storage
    UPLOAD_DIR: str = "./data/face_images"
    
    # Email / SMTP
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    FROM_EMAIL: str | None = "noreply@nexattend.com"
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str | None = None
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
