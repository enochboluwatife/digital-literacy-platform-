from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models, schemas
from ..database import get_db
from ..auth import (
    get_current_active_user,
    get_current_active_admin,
    get_password_hash
)

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.get("/", response_model=List[schemas.UserOut])
def get_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[schemas.UserRole] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_admin)
):
    """
    Retrieve all users (admin only).
    """
    query = db.query(models.User)
    
    if role is not None:
        query = query.filter(models.User.role == role)
    
    if search:
        search = f"%{search}%"
        query = query.filter(
            (models.User.email.ilike(search)) |
            (models.User.first_name.ilike(search)) |
            (models.User.last_name.ilike(search))
        )
    
    return query.offset(skip).limit(limit).all()

@router.get("/me", response_model=schemas.UserOut)
def read_user_me(
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get current user information.
    """
    return current_user

@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get a specific user by ID.
    Regular users can only see their own profile.
    """
    if current_user.role != schemas.UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this user"
        )
    
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/me", response_model=schemas.UserOut)
def update_user_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Update current user's information.
    """
    update_data = user_update.dict(exclude_unset=True)
    
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_admin)
):
    """
    Update a user (admin only).
    """
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_update.dict(exclude_unset=True)
    
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_admin)
):
    """
    Delete a user (admin only).
    """
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return None

@router.get("/me/courses", response_model=List[schemas.EnrollmentOut])
def get_my_courses(
    skip: int = 0,
    limit: int = 100,
    completed: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get courses that the current user is enrolled in.
    """
    query = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id
    )
    
    if completed is not None:
        query = query.filter(models.Enrollment.completed == completed)
    
    return query.offset(skip).limit(limit).all()

@router.get("/me/progress", response_model=schemas.UserProgressOut)
def get_my_progress(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get current user's progress across all enrolled courses.
    """
    # Get all enrollments for the current user
    enrollments = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id
    ).all()
    
    # Calculate overall progress
    total_courses = len(enrollments)
    completed_courses = sum(1 for e in enrollments if e.completed)
    
    # Calculate average progress
    avg_progress = 0
    if total_courses > 0:
        avg_progress = sum(e.progress for e in enrollments) / total_courses
    
    return {
        "total_courses": total_courses,
        "completed_courses": completed_courses,
        "in_progress_courses": total_courses - completed_courses,
        "average_progress": avg_progress,
        "enrollments": enrollments
    }
