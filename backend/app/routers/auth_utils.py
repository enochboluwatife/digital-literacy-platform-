from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app import models
from app.core.config import settings
from app.core.security import (
    get_password_hash, 
    verify_password,
    create_access_token,
    oauth2_scheme,
    get_current_user
)

def get_auth_token(user: models.User) -> dict:
    """Generate an auth token for the user."""
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "institution": user.institution
        }
    }
