from pydantic_settings import BaseSettings
from typing import Optional, List, Union
import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "Digital Literacy Platform"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./digital_literacy.db")
    
    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS settings
    CORS_ORIGINS: Union[str, List[str]] = os.getenv("CORS_ORIGINS", "*")
    
    # File upload settings
    UPLOAD_FOLDER: str = "uploads"
    MAX_CONTENT_LENGTH: int = int(os.getenv("MAX_UPLOAD_SIZE", "16")) * 1024 * 1024  # Convert MB to bytes
    MAX_UPLOAD_SIZE: int = int(os.getenv("MAX_UPLOAD_SIZE", "16"))  # In MB
    ALLOWED_EXTENSIONS: set = {"png", "jpg", "jpeg", "gif", "pdf", "doc", "docx", "mp4"}
    
    # Email settings (if needed)
    SMTP_SERVER: Optional[str] = os.getenv("SMTP_SERVER")
    SMTP_PORT: Optional[int] = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")
    EMAIL_FROM: Optional[str] = os.getenv("EMAIL_FROM")
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields in .env file

# Create settings instance
settings = Settings()

# Convert CORS_ORIGINS to list if it's a string
if isinstance(settings.CORS_ORIGINS, str):
    if settings.CORS_ORIGINS.strip() == "*":
        settings.CORS_ORIGINS = ["*"]
    else:
        settings.CORS_ORIGINS = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
