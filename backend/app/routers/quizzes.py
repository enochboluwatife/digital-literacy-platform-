from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_active_user

router = APIRouter(
    prefix="/quizzes",
    tags=["quizzes"]
)

@router.get("/module/{module_id}", response_model=List[schemas.QuizQuestionOut])
def get_quiz_questions(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get all quiz questions for a specific module.
    """
    # Verify the module exists and user has access to it
    module = db.query(models.Module).filter(models.Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Check if user is enrolled in the course
    if current_user.role != models.UserRole.ADMIN:
        enrollment = db.query(models.Enrollment).filter(
            models.Enrollment.user_id == current_user.id,
            models.Enrollment.course_id == module.course_id
        ).first()
        
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not enrolled in this course"
            )
    
    # Get all published quiz questions for the module with their options
    questions = db.query(models.QuizQuestion).filter(
        models.QuizQuestion.module_id == module_id
    ).all()
    
    return questions

@router.post("/submit/{module_id}", response_model=schemas.QuizResult)
def submit_quiz_answers(
    module_id: int,
    submission: schemas.QuizSubmission,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Submit quiz answers and get results.
    """
    # Verify the module exists and user has access to it
    module = db.query(models.Module).filter(models.Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Check if user is enrolled in the course
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id,
        models.Enrollment.course_id == module.course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not enrolled in this course"
        )
    
    # Get all questions for the module
    questions = db.query(models.QuizQuestion).filter(
        models.QuizQuestion.module_id == module_id
    ).all()
    
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No questions found for this module"
        )
    
    # Process the submission
    total_questions = len(questions)
    correct_answers = 0
    question_results: List[Dict[str, Any]] = []
    
    # Get all question IDs for validation
    question_ids = {q.id for q in questions}
    
    # Check each answer
    for answer in submission.answers:
        if answer.question_id not in question_ids:
            continue  # Skip invalid question IDs
        
        # Get the question and its correct options
        question = next((q for q in questions if q.id == answer.question_id), None)
        if not question:
            continue
        
        # Get the selected option
        selected_option = db.query(models.QuizOption).filter(
            models.QuizOption.id == answer.selected_option_id,
            models.QuizOption.question_id == answer.question_id
        ).first()
        
        is_correct = selected_option and selected_option.is_correct
        
        # Record the attempt
        attempt = models.QuizAttempt(
            user_id=current_user.id,
            question_id=answer.question_id,
            selected_option_id=answer.selected_option_id,
            is_correct=is_correct
        )
        db.add(attempt)
        
        # Update stats
        if is_correct:
            correct_answers += 1
        
        # Add to results
        question_results.append({
            "question_id": answer.question_id,
            "selected_option_id": answer.selected_option_id,
            "is_correct": is_correct,
            "correct_option_id": next(
                (opt.id for opt in question.options if opt.is_correct), None
            ) if question.options else None
        })
    
    # Calculate score
    score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
    passed = score >= 70  # 70% passing score
    
    # Update user progress if this is the first attempt or the score is better
    db_attempt = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.user_id == current_user.id,
        models.QuizAttempt.question_id.in_([q.id for q in questions])
    ).first()
    
    if not db_attempt or score > (enrollment.progress or 0):
        enrollment.progress = int(score)
        if passed and not enrollment.completed:
            enrollment.completed = True
            enrollment.completed_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "score": score,
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "passed": passed,
        "feedback": "Congratulations! You passed!" if passed else "Keep trying! You can do better!"
    }

@router.get("/results/{module_id}", response_model=Dict[str, Any])
def get_quiz_results(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get quiz results for a specific module.
    """
    # Verify the module exists and user has access to it
    module = db.query(models.Module).filter(models.Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Check if user is enrolled in the course
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.user_id == current_user.id,
        models.Enrollment.course_id == module.course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not enrolled in this course"
        )
    
    # Get all questions for the module
    questions = db.query(models.QuizQuestion).filter(
        models.QuizQuestion.module_id == module_id
    ).all()
    
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No questions found for this module"
        )
    
    # Get all user's attempts for these questions
    attempts = db.query(models.QuizAttempt).filter(
        models.QuizAttempt.user_id == current_user.id,
        models.QuizAttempt.question_id.in_([q.id for q in questions])
    ).all()
    
    # Calculate results
    total_questions = len(questions)
    correct_answers = sum(1 for a in attempts if a.is_correct)
    score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
    passed = score >= 70
    
    # Get detailed results for each question
    question_results = []
    for question in questions:
        attempt = next((a for a in attempts if a.question_id == question.id), None)
        correct_option = next((opt for opt in question.options if opt.is_correct), None)
        
        question_results.append({
            "question_id": question.id,
            "question_text": question.question,
            "selected_option_id": attempt.selected_option_id if attempt else None,
            "is_correct": attempt.is_correct if attempt else False,
            "correct_option_id": correct_option.id if correct_option else None,
            "explanation": ""  # Could be added to the Question model
        })
    
    return {
        "module_id": module_id,
        "score": score,
        "passed": passed,
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "attempts": len(attempts) // len(questions) if questions else 0,
        "completed_at": enrollment.completed_at,
        "questions": question_results
    }
