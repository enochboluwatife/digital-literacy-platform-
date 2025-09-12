from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/quizzes", tags=["quizzes"])

@router.get("/{quiz_id}", response_model=schemas.QuizDetail)
def get_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get a quiz with its questions"""
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Get questions for this quiz
    questions = db.query(models.Question).filter(
        models.Question.quiz_id == quiz_id
    ).order_by(models.Question.order).all()
    
    # Get user's previous attempts
    previous_attempt = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.user_id == current_user.id,
        models.QuizAttempt.quiz_id == quiz_id
    ).order_by(models.QuizAttempt.completed_at.desc()).first()
    
    return {
        **quiz.__dict__,
        "questions": questions,
        "previous_score": previous_attempt.score if previous_attempt else None
    }

@router.post("/{quiz_id}/submit", response_model=schemas.QuizResult)
def submit_quiz_answers(
    quiz_id: int,
    answers: schemas.QuizAnswers,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Submit quiz answers and get results"""
    # Get the quiz and its questions
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    questions = db.query(models.Question).filter(
        models.Question.quiz_id == quiz_id
    ).all()
    
    # Calculate score
    total_questions = len(questions)
    correct_answers = 0
    
    # Check each answer
    for question in questions:
        user_answer = next(
            (a for a in answers.answers if a.question_id == question.id), 
            None
        )
        
        if user_answer and user_answer.answer_index == question.correct_answer:
            correct_answers += 1
    
    score = int((correct_answers / total_questions) * 100) if total_questions > 0 else 0
    
    # Save the attempt
    attempt = models.QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        score=score,
        passed=score >= quiz.passing_score
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    # Update lesson progress if this is associated with a lesson
    if quiz.lesson_id:
        progress = models.LessonProgress(
            user_id=current_user.id,
            lesson_id=quiz.lesson_id,
            completed=True,
            score=score
        )
        db.add(progress)
        db.commit()
    
    return {
        "score": score,
        "passed": score >= quiz.passing_score,
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "attempt_id": attempt.id
    }

@router.get("/user/progress", response_model=List[schemas.UserProgress])
def get_user_progress(
    course_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get user's progress across all courses or a specific course"""
    query = db.query(
        models.LessonProgress
    ).filter(
        models.LessonProgress.user_id == current_user.id
    )
    
    if course_id:
        query = query.join(
            models.Lesson,
            models.Lesson.id == models.LessonProgress.lesson_id
        ).filter(
            models.Lesson.course_id == course_id
        )
    
    progress = query.all()
    return progress
