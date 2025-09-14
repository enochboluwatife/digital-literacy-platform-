from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/courses",
    tags=["courses"]
)

@router.get("/", response_model=List[schemas.CourseOut])
def get_courses(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # If user is a teacher, return only their courses
    if current_user.role == models.UserRole.TEACHER:
        courses = (
            db.query(models.Course)
            .filter(models.Course.teacher_id == current_user.id)
            .order_by(models.Course.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    # If user is admin, return all courses
    elif current_user.role == models.UserRole.ADMIN:
        courses = (
            db.query(models.Course)
            .order_by(models.Course.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    # For students, return only published courses
    else:
        courses = (
            db.query(models.Course)
            .filter(models.Course.is_published == True)
            .order_by(models.Course.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    return courses

def check_course_permission(db: Session, course_id: int, user: models.User):
    """Check if user has permission to modify the course"""
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Admins can modify any course
    if user.role == models.UserRole.ADMIN:
        return db_course
        
    # Teachers can only modify their own courses
    if user.role == models.UserRole.TEACHER and db_course.created_by == user.id:
        return db_course
        
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You don't have permission to modify this course"
    )

@router.get("/{course_id}", response_model=schemas.CourseOut)
def get_course(
    course_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
        
    # Only show unpublished courses to the creator or admin
    if not db_course.is_published and db_course.teacher_id != current_user.id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this course"
        )
        
    return db_course

@router.post("/", response_model=schemas.CourseOut)
def create_course(
    course: schemas.CourseCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Check if user has permission to create a course
    if current_user.role not in [models.UserRole.TEACHER, models.UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and admins can create courses"
        )
    
    # Create the course
    db_course = models.Course(**course.dict(), teacher_id=current_user.id)
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.put("/{course_id}", response_model=schemas.CourseOut)
def update_course(
    course_id: int,
    course: schemas.CourseUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Check permissions and get the course
    db_course = check_course_permission(db, course_id, current_user)
    
    # Update course data
    update_data = course.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_course, field, value)
    
    db_course.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_course)
    return db_course

@router.post("/{course_id}/modules", response_model=schemas.ModuleOut)
def create_module(
    course_id: int,
    module: schemas.ModuleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Create a new module within a course (admin and teachers only)"""
    # Check permissions and get the course
    db_course = check_course_permission(db, course_id, current_user)
    
    module_data = module.dict()
    # Map order_index to order field for database model
    if 'order_index' in module_data:
        module_data['order'] = module_data.pop('order_index')
    
    db_module = models.Module(**module_data, course_id=course_id)
    db.add(db_module)
    db.commit()
    db.refresh(db_module)
    return db_module

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Check permissions and get the course
    db_course = check_course_permission(db, course_id, current_user)
    
    # Delete the course
    db.delete(db_course)
    db.commit()
    return None
