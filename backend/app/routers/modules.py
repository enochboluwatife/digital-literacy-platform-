from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_active_user

router = APIRouter(
    prefix="/courses/{course_id}/modules",
    tags=["modules"]
)

@router.get("/", response_model=List[schemas.ModuleOut])
def get_course_modules(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Verify course exists
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if user is enrolled in the course
    if current_user.role != models.UserRole.ADMIN:
        enrollment = db.query(models.Enrollment).filter(
            models.Enrollment.user_id == current_user.id,
            models.Enrollment.course_id == course_id
        ).first()
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not enrolled in this course"
            )
    
    # Get all published modules for the course
    modules = db.query(models.Module).filter(
        models.Module.course_id == course_id,
        models.Module.is_published == True
    ).order_by(models.Module.order).all()
    
    return modules

@router.get("/{module_id}", response_model=schemas.ModuleWithContent)
def get_module(
    course_id: int,
    module_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Verify course exists
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if user is enrolled in the course
    if current_user.role != models.UserRole.ADMIN:
        enrollment = db.query(models.Enrollment).filter(
            models.Enrollment.user_id == current_user.id,
            models.Enrollment.course_id == course_id
        ).first()
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not enrolled in this course"
            )
    
    # Get the module with its quiz questions if any
    module = db.query(models.Module).filter(
        models.Module.id == module_id,
        models.Module.course_id == course_id
    ).first()
    
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    return module

@router.post("/{module_id}/complete", status_code=status.HTTP_200_OK)
def complete_module(
    course_id: int,
    module_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Verify course and module exist
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    module = db.query(models.Module).filter(
        models.Module.id == module_id,
        models.Module.course_id == course_id
    ).first()
    
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Check if user is enrolled in the course
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id,
        models.Enrollment.course_id == course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not enrolled in this course"
        )
    
    # Update progress
    total_modules = db.query(models.Module).filter(
        models.Module.course_id == course_id,
        models.Module.is_published == True
    ).count()
    
    # In a real app, you would update a user's progress in a more sophisticated way
    # This is a simplified version that just increments the progress
    if enrollment.progress < 100:
        progress_per_module = 100 // total_modules
        enrollment.progress = min(100, enrollment.progress + progress_per_module)
        
        if enrollment.progress >= 100 and not enrollment.completed:
            enrollment.completed = True
            enrollment.completed_at = datetime.utcnow()
        
        db.commit()
    
    return {"message": "Module marked as completed", "progress": enrollment.progress}
