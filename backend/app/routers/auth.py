from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional

from .. import models, schemas, auth
from ..database import get_db
from ..config import settings

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user and return an access token.
    """
    # Check if user with this email already exists
    db_user = auth.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    try:
        # Create the user
        db_user = auth.create_user(db=db, user=user)
        
        # Create access token with user claims
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(
            data={
                "sub": db_user.email,  # Standard JWT practice is to use email as sub
                "email": db_user.email,
                "role": db_user.role.value,  # Convert enum to string
                "user_id": db_user.id
            },
            expires_delta=access_token_expires
        )
        
        # Log successful registration
        logger.info(f"Successfully registered user: {db_user.email} (ID: {db_user.id})")
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
        
    except Exception as e:
        # Log the error
        logger.error(f"Error during user registration: {str(e)}", exc_info=True)
        
        # Rollback any database changes
        db.rollback()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration. Please try again."
        )

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    print(f"DEBUG: Login attempt - username: {form_data.username}, password length: {len(form_data.password) if form_data.password else 0}")
    user = auth.authenticate_user(
        db, 
        email=form_data.username,  # OAuth2 uses 'username' field for email
        password=form_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Create access token with user claims
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(
            data={
                "sub": user.email,  # Standard JWT practice is to use email as sub
                "email": user.email,
                "role": user.role,
                "user_id": user.id
            },
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error creating access token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create access token"
        )

@router.get("/me", response_model=schemas.UserOut)
async def read_users_me(
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Get current user information.
    """
    try:
        import logging
        logging.basicConfig(level=logging.DEBUG)
        logger = logging.getLogger(__name__)
        
        logger.debug(f"Current user: {current_user}")
        logger.debug(f"User ID: {current_user.id}")
        logger.debug(f"User email: {current_user.email}")
        logger.debug(f"User role: {current_user.role}")
        
        # Convert the user object to a dictionary to check for any serialization issues
        user_dict = {
            "id": current_user.id,
            "email": current_user.email,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "role": current_user.role,
            "is_active": current_user.is_active,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
            "updated_at": current_user.updated_at.isoformat() if current_user.updated_at else None
        }
        logger.debug(f"User dict: {user_dict}")
        
        return current_user
    except Exception as e:
        logger.error(f"Error in /me endpoint: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/refresh")
def refresh_token(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Refresh access token.
    """
    try:
        # Create a new access token with user claims
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(
            data={
                "sub": current_user.email,  # Use email as sub (standard JWT practice)
                "email": current_user.email,
                "role": current_user.role,
                "user_id": current_user.id
            },
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error refreshing token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not refresh token"
        )

@router.post("/logout")
def logout():
    """
    Logout user (client should delete the token).
    In a real app, you might want to implement token blacklisting here.
    """
    return {"message": "Successfully logged out"}
