from datetime import datetime, timedelta
from typing import Optional
import jwt
from jwt import PyJWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import os
import logging
from dotenv import load_dotenv

from .. import models, schemas
from ..database import get_db

# Load environment variables
load_dotenv()

# Security configurations - Import from config
from .config import settings
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate a password hash."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    # Ensure we have the required 'sub' claim which is standard in JWT
    if 'sub' not in to_encode and 'email' in to_encode:
        to_encode['sub'] = to_encode['email']
    
    to_encode.update({"exp": expire})
    
    # Convert any non-JSON-serializable data to strings
    for key, value in to_encode.items():
        if isinstance(value, (datetime, timedelta)):
            to_encode[key] = str(value)
        elif hasattr(value, 'value'):
            # Handle enums by getting their value
            to_encode[key] = value.value
        elif not isinstance(value, (str, int, float, bool, list, dict)):
            to_encode[key] = str(value)
    
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """
    Get the current authenticated user from the token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Log the token for debugging (remove in production)
        logger = logging.getLogger(__name__)
        logger.setLevel(logging.DEBUG)
        
        logger.debug(f"Received token: {token}")
        
        # Check if token is present
        if not token or token == "null" or token == "undefined":
            logger.error("No token provided in the Authorization header")
            raise credentials_exception
            
        # Decode the JWT token
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            logger.debug(f"Decoded token payload: {payload}")
        except jwt.ExpiredSignatureError:
            logger.error("Token has expired")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired. Please log in again.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid token: {str(e)}")
            raise credentials_exception
            
        # Get the subject (email) from the token
        email: str = payload.get("sub")
        if not email:
            logger.error("No 'sub' claim in token")
            raise credentials_exception
            
        # Log the email for debugging
        logger.debug(f"Looking up user with email: {email}")
            
        # Get the user from the database
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            logger.error(f"User with email {email} not found")
            raise credentials_exception
            
        # Check if user is active
        if not user.is_active:
            logger.error(f"User {email} is inactive")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive. Please contact support.",
            )
            
        logger.debug(f"Successfully authenticated user: {email}")
        return user
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
        
    except Exception as e:
        print(f"Unexpected error in get_current_user: {str(e)}")
        raise credentials_exception

def get_current_active_user(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """Get the current active user."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_admin_user(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """Get the current admin user."""
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user
