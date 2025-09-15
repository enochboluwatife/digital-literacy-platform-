from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..core.security import get_current_user, get_current_active_user, get_current_admin_user, get_password_hash

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Course Management
@router.get("/courses/", response_model=List[schemas.CourseOut])
def get_courses(
    skip: int = 0,
    limit: int = 100,
    teacher_id: int = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get courses (admin and teachers can see their courses)"""
    query = db.query(models.Course)
    
    # If teacher_id is specified, filter by teacher
    if teacher_id:
        query = query.filter(models.Course.teacher_id == teacher_id)
    # If user is a teacher, only show their courses
    elif current_user.role == models.UserRole.TEACHER:
        query = query.filter(models.Course.teacher_id == current_user.id)
    
    return query.offset(skip).limit(limit).all()

@router.post("/courses/", response_model=schemas.CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(
    course: schemas.CourseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Create a new course (admin only)"""
    course_data = course.dict()
    # Set teacher_id to current user if not provided
    if 'teacher_id' not in course_data or course_data['teacher_id'] is None:
        course_data['teacher_id'] = current_user.id
    
    db_course = models.Course(**course_data)
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.put("/courses/{course_id}", response_model=schemas.CourseOut)
def update_course(
    course_id: int,
    course: schemas.CourseUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Update a course (admin only)"""
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    update_data = course.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_course, field, value)
    
    db.commit()
    db.refresh(db_course)
    return db_course

# Module Management
@router.post("/courses/{course_id}/modules", response_model=schemas.ModuleOut, status_code=status.HTTP_201_CREATED)
def create_module(
    course_id: int,
    module: schemas.ModuleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Create a new module within a course (admin only)"""
    # Verify course exists
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    db_module = models.Module(**module.dict(), course_id=course_id)
    db.add(db_module)
    db.commit()
    db.refresh(db_module)
    return db_module

# User Management
@router.get("/users/", response_model=List[schemas.UserOut])
def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get all users (admin only)"""
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.put("/users/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Update a user (admin only)"""
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_update.dict(exclude_unset=True)
    
    # Handle password hashing if password is being updated
    if 'password' in update_data and update_data['password']:
        hashed_password = get_password_hash(update_data['password'])
        del update_data['password']
        update_data['hashed_password'] = hashed_password
    
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

# Quiz Question Management
@router.post("/modules/{module_id}/questions", response_model=schemas.QuizQuestionOut, status_code=status.HTTP_201_CREATED)
def create_quiz_question(
    module_id: int,
    question: schemas.QuizQuestionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Create a new quiz question for a module (admin only)"""
    # Verify module exists
    module = db.query(models.Module).filter(models.Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    db_question = models.QuizQuestion(**question.dict(), module_id=module_id)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@router.post("/questions/{question_id}/options", response_model=schemas.QuizOptionOut, status_code=status.HTTP_201_CREATED)
def create_quiz_option(
    question_id: int,
    option: schemas.QuizOptionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Create a new quiz option for a question (admin only)"""
    # Verify question exists
    question = db.query(models.QuizQuestion).filter(models.QuizQuestion.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    db_option = models.QuizOption(**option.dict(), question_id=question_id)
    db.add(db_option)
    db.commit()
    db.refresh(db_option)
    return db_option

# Enrollment Management
@router.post("/enrollments", status_code=status.HTTP_201_CREATED)
def create_enrollment(
    user_id: int,
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Create enrollment for a user in a course (admin only)"""
    # Check if enrollment already exists
    existing = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == user_id,
        models.Enrollment.course_id == course_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User already enrolled in this course")
    
    enrollment = models.Enrollment(user_id=user_id, course_id=course_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return {"message": "Enrollment created successfully"}

# Analytics endpoints
@router.get("/analytics/overview")
def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    """Get analytics overview (admin only)"""
    total_users = db.query(models.User).count()
    total_courses = db.query(models.Course).count()
    total_enrollments = db.query(models.Enrollment).count()
    
    return {
        "total_users": total_users,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "active_users": db.query(models.User).filter(models.User.is_active == True).count()
    }