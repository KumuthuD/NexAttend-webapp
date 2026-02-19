from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "NexAttend API"
    APP_NAME: str = "AI-Attendance-System"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"]
    
    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "nexattend_db"
    MONGODB_TLS: bool = False # Default to False for local dev

    # Security
    SECRET_KEY: str = "your-secret-key-here"
    JWT_SECRET: str = "your-jwt-secret-here"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Face Recognition
    FACE_MODEL: str = "Facenet"
    SIMILARITY_THRESHOLD: float = 0.85
    
    # Storage
    UPLOAD_DIR: str = "./data/face_images"
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
