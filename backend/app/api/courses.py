from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/courses", tags=["courses"])

@router.get("/", response_model=List[schemas.Course])
def get_courses(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get a list of all available courses"""
    courses = db.query(models.Course).offset(skip).limit(limit).all()
    return courses

@router.get("/{course_id}", response_model=schemas.CourseDetail)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get detailed information about a specific course"""
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if user is enrolled
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id,
        models.Enrollment.course_id == course_id
    ).first()
    
    # Get modules for the course
    modules = db.query(models.Module).filter(
        models.Module.course_id == course_id
    ).order_by(models.Module.order).all()
    
    # Get user progress
    progress = db.query(models.LessonProgress).filter(
        models.LessonProgress.user_id == current_user.id,
        models.LessonProgress.course_id == course_id
    ).all()
    
    # Calculate completion percentage
    total_lessons = sum(len(module.lessons) for module in modules)
    completed_lessons = len(progress)
    completion_percentage = int((completed_lessons / total_lessons * 100)) if total_lessons > 0 else 0
    
    return {
        **course.__dict__,
        "enrolled": enrollment is not None,
        "completion_percentage": completion_percentage,
        "modules": modules
    }

@router.get("/{course_id}/modules/{module_id}", response_model=schemas.ModuleDetail)
def get_module(
    course_id: int,
    module_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get detailed information about a specific module"""
    # Verify the module exists and belongs to the course
    module = db.query(models.Module).filter(
        models.Module.id == module_id,
        models.Module.course_id == course_id
    ).first()
    
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Get all lessons for this module
    lessons = db.query(models.Lesson).filter(
        models.Lesson.module_id == module_id
    ).order_by(models.Lesson.order).all()
    
    # Get user progress for these lessons
    lesson_ids = [lesson.id for lesson in lessons]
    completed_lessons = db.query(models.LessonProgress).filter(
        models.LessonProgress.user_id == current_user.id,
        models.LessonProgress.lesson_id.in_(lesson_ids)
    ).all()
    completed_lesson_ids = [cl.lesson_id for cl in completed_lessons]
    
    # Add completion status to each lesson
    for lesson in lessons:
        lesson.completed = lesson.id in completed_lesson_ids
    
    return {
        **module.__dict__,
        "lessons": lessons
    }
