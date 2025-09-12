from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_active_user, get_current_active_admin

router = APIRouter(
    prefix="/enrollments",
    tags=["enrollments"]
)

@router.post("/", response_model=schemas.EnrollmentOut, status_code=status.HTTP_201_CREATED)
def enroll_in_course(
    enrollment: schemas.EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Enroll the current user in a course.
    """
    # Check if course exists and is published
    db_course = db.query(models.Course).filter(
        models.Course.id == enrollment.course_id,
        models.Course.is_published == True
    ).first()
    
    if not db_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found or not published"
        )
    
    # Check if already enrolled
    db_enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id,
        models.Enrollment.course_id == enrollment.course_id
    ).first()
    
    if db_enrollment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this course"
        )
    
    # Create new enrollment
    db_enrollment = models.Enrollment(
        user_id=current_user.id,
        course_id=enrollment.course_id,
        enrolled_at=datetime.utcnow(),
        progress=0.0,
        completed=False
    )
    
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    
    return db_enrollment

@router.get("/me", response_model=List[schemas.EnrollmentOut])
def get_my_enrollments(
    skip: int = 0,
    limit: int = 100,
    completed: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get the current user's course enrollments with optional filtering.
    """
    query = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id
    )
    
    if completed is not None:
        query = query.filter(models.Enrollment.completed == completed)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{enrollment_id}", response_model=schemas.EnrollmentOut)
def get_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get a specific enrollment by ID.
    Users can only view their own enrollments unless they are admins.
    """
    db_enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.id == enrollment_id
    ).first()
    
    if not db_enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    # Check permissions
    if db_enrollment.user_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this enrollment"
        )
    
    return db_enrollment

@router.put("/{enrollment_id}", response_model=schemas.EnrollmentOut)
def update_enrollment(
    enrollment_id: int,
    enrollment_update: schemas.EnrollmentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Update an enrollment (e.g., mark as completed, update progress).
    Users can only update their own enrollments unless they are admins.
    """
    db_enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.id == enrollment_id
    ).first()
    
    if not db_enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    # Check permissions
    if db_enrollment.user_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this enrollment"
        )
    
    # Update fields
    update_data = enrollment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_enrollment, field, value)
    
    db_enrollment.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_enrollment)
    
    return db_enrollment

@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
def unenroll_from_course(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Unenroll from a course.
    Users can only unenroll themselves unless they are admins.
    """
    db_enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.id == enrollment_id
    ).first()
    
    if not db_enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    # Check permissions
    if db_enrollment.user_id != current_user.id and current_user.role != schemas.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to unenroll from this course"
        )
    
    db.delete(db_enrollment)
    db.commit()
    return None

@router.get("/course/{course_id}", response_model=List[schemas.EnrollmentOut])
def get_course_enrollments(
    course_id: int,
    skip: int = 0,
    limit: int = 100,
    completed: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_admin)
):
    """
    Get all users enrolled in a specific course (admin only).
    """
    # Check if course exists
    db_course = db.query(models.Course).filter(
        models.Course.id == course_id
    ).first()
    
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    query = db.query(models.Enrollment).filter(
        models.Enrollment.course_id == course_id
    )
    
    if completed is not None:
        query = query.filter(models.Enrollment.completed == completed)
    
    return query.offset(skip).limit(limit).all()

@router.get("/user/{user_id}", response_model=List[schemas.EnrollmentOut])
def get_user_enrollments(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    completed: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_admin)
):
    """
    Get all courses a specific user is enrolled in (admin only).
    """
    # Check if user exists
    db_user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    query = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == user_id
    )
    
    if completed is not None:
        query = query.filter(models.Enrollment.completed == completed)
    
    return query.offset(skip).limit(limit).all()
