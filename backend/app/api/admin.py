from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user
from ..core.security import get_current_active_superuser

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Course Management
@router.post("/courses/", response_model=schemas.Course, status_code=status.HTTP_201_CREATED)
def create_course(
    course: schemas.CourseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_superuser)
):
    """Create a new course (admin only)"""
    db_course = models.Course(**course.dict())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.put("/courses/{course_id}", response_model=schemas.Course)
def update_course(
    course_id: int,
    course: schemas.CourseUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_superuser)
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
@router.post("/courses/{course_id}/modules", response_model=schemas.Module, status_code=status.HTTP_201_CREATED)
def create_module(
    course_id: int,
    module: schemas.ModuleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_superuser)
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

# Lesson Management
@router.post("/modules/{module_id}/lessons", response_model=schemas.Lesson, status_code=status.HTTP_201_CREATED)
def create_lesson(
    module_id: int,
    lesson: schemas.LessonCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_superuser)
):
    """Create a new lesson within a module (admin only)"""
    # Verify module exists
    module = db.query(models.Module).filter(models.Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    db_lesson = models.Lesson(**lesson.dict(), module_id=module_id)
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

# Quiz Management
@router.post("/lessons/{lesson_id}/quiz", response_model=schemas.Quiz, status_code=status.HTTP_201_CREATED)
def create_quiz(
    lesson_id: int,
    quiz: schemas.QuizCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_superuser)
):
    """Create a quiz for a lesson (admin only)"""
    # Verify lesson exists
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    db_quiz = models.Quiz(**quiz.dict(), lesson_id=lesson_id)
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    return db_quiz

@router.post("/quizzes/{quiz_id}/questions", response_model=schemas.Question, status_code=status.HTTP_201_CREATED)
def add_question_to_quiz(
    quiz_id: int,
    question: schemas.QuestionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_superuser)
):
    """Add a question to a quiz (admin only)"""
    # Verify quiz exists
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    db_question = models.Question(**question.dict(), quiz_id=quiz_id)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

# User Management
@router.get("/users/", response_model=List[schemas.User])
def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_superuser)
):
    """Get all users (admin only)"""
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.put("/users/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_superuser)
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
