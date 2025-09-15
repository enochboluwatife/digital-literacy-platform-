from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Union
import jwt
from jwt import PyJWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import os
from . import models, schemas
from .database import get_db

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
optional_oauth2_scheme = HTTPBearer(auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    print(f"DEBUG: Attempting to authenticate user with email: {email}")
    user = get_user_by_email(db, email)
    if not user:
        print(f"DEBUG: No user found with email: {email}")
        return None
    print(f"DEBUG: User found: {user.email}, ID: {user.id}")
    print(f"DEBUG: Verifying password...")
    password_valid = verify_password(password, user.hashed_password)
    print(f"DEBUG: Password verification result: {password_valid}")
    if not password_valid:
        return None
    print(f"DEBUG: Authentication successful for user: {user.email}")
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    # Convert expiration time to Unix timestamp (integer)
    to_encode.update({"exp": int(expire.timestamp())})
    
    # Ensure we have the required 'sub' claim which is standard in JWT
    if 'sub' not in to_encode and 'email' in to_encode:
        to_encode['sub'] = to_encode['email']
    
    # Convert any non-JSON-serializable data to strings
    for key, value in to_encode.items():
        if key == 'exp':
            continue  # Skip 'exp' as we've already handled it
        if isinstance(value, (datetime, timedelta)):
            to_encode[key] = str(value)
        elif hasattr(value, 'value') and hasattr(value, '__class__') and hasattr(value, '__module__'):
            # Handle enums by getting their value
            to_encode[key] = value.value if hasattr(value, 'value') else str(value)
    
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Get the subject (email) from the token
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
            
        # Create TokenData with the payload
        token_data = schemas.TokenData(
            sub=email,
            email=email,
            user_id=payload.get("user_id"),
            role=payload.get("role")
        )
        
        # Get user from database
        user = get_user_by_email(db, email=email)
        if user is None:
            raise credentials_exception
            
        return user
        
    except PyJWTError as e:
        print(f"JWT Error in auth.get_current_user: {str(e)}")
        raise credentials_exception
    except Exception as e:
        print(f"Unexpected error in auth.get_current_user: {str(e)}")
        raise credentials_exception

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[models.User]:
    """Get current user but return None if no valid token is provided"""
    if not credentials:
        return None
        
    try:
        # Decode the JWT token
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Get the subject (email) from the token
        email: str = payload.get("sub")
        if email is None:
            return None
            
        # Get user from database
        user = get_user_by_email(db, email=email)
        return user
        
    except PyJWTError:
        return None
    except Exception:
        return None

async def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_active_admin(
    current_user: models.User = Depends(get_current_active_user),
) -> models.User:
    if current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    # Log the incoming user data for debugging
    print(f"Creating user with email: {user.email}")
    print(f"User data: {user.dict()}")
    
    # Hash the password
    hashed_password = get_password_hash(user.password)
    
    # Create the user object with all required fields
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        institution=user.institution,  # This can be None if not provided
        role=user.role or models.UserRole.STUDENT,  # Default to STUDENT if not provided
        is_active=True
    )
    
    # Add to database
    db.add(db_user)
    
    try:
        db.commit()
        db.refresh(db_user)
        print(f"Successfully created user with ID: {db_user.id}")
        return db_user
    except Exception as e:
        db.rollback()
        print(f"Error creating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user in database"
        )

def update_user(
    db: Session, 
    user_id: int, 
    user_update: schemas.UserUpdate,
    current_user: models.User
) -> models.User:
    # Only allow admins or the user themselves to update
    if current_user.role != schemas.UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )
    
    db_user = get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_update.dict(exclude_unset=True)
    
    # Only admins can change roles
    if "role" in update_data and current_user.role != schemas.UserRole.ADMIN:
        del update_data["role"]
    
    # Handle password hashing if password is being updated
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user
