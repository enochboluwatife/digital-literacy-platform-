#!/usr/bin/env python3
"""
Simple script to add quizzes to courses using direct database access
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models

def create_quiz_content():
    db = SessionLocal()
    try:
        # Get existing courses
        courses = db.query(models.Course).all()
        print(f"Found {len(courses)} courses")
        
        # Quiz data for each course
        quiz_data = {
            "Digital Literacy Fundamentals": [
                {
                    "question": "What is the main function of an operating system?",
                    "options": [
                        {"text": "Manage hardware and software resources", "is_correct": True},
                        {"text": "Browse the internet", "is_correct": False},
                        {"text": "Create documents", "is_correct": False},
                        {"text": "Send emails", "is_correct": False}
                    ]
                },
                {
                    "question": "Which of the following is a secure password practice?",
                    "options": [
                        {"text": "Using the same password everywhere", "is_correct": False},
                        {"text": "Including personal information", "is_correct": False},
                        {"text": "Using a mix of letters, numbers, and symbols", "is_correct": True},
                        {"text": "Sharing passwords with friends", "is_correct": False}
                    ]
                }
            ],
            "Internet Safety & Security": [
                {
                    "question": "What is phishing?",
                    "options": [
                        {"text": "A type of fishing", "is_correct": False},
                        {"text": "Fraudulent attempts to obtain sensitive information", "is_correct": True},
                        {"text": "A social media platform", "is_correct": False},
                        {"text": "A computer virus", "is_correct": False}
                    ]
                },
                {
                    "question": "What should you do if you receive a suspicious email?",
                    "options": [
                        {"text": "Click all links to investigate", "is_correct": False},
                        {"text": "Forward it to friends", "is_correct": False},
                        {"text": "Delete it and report as spam", "is_correct": True},
                        {"text": "Reply with personal information", "is_correct": False}
                    ]
                }
            ],
            "Microsoft Office Essentials": [
                {
                    "question": "Which Microsoft Office application is best for creating spreadsheets?",
                    "options": [
                        {"text": "Word", "is_correct": False},
                        {"text": "Excel", "is_correct": True},
                        {"text": "PowerPoint", "is_correct": False},
                        {"text": "Outlook", "is_correct": False}
                    ]
                },
                {
                    "question": "What is the purpose of using templates in Office applications?",
                    "options": [
                        {"text": "To make documents look unprofessional", "is_correct": False},
                        {"text": "To save time and ensure consistency", "is_correct": True},
                        {"text": "To make files larger", "is_correct": False},
                        {"text": "To confuse users", "is_correct": False}
                    ]
                }
            ]
        }
        
        created_modules = 0
        created_questions = 0
        created_options = 0
        
        for course in courses:
            if course.title in quiz_data:
                questions_data = quiz_data[course.title]
                
                # Create a quiz module for this course
                quiz_module = models.Module(
                    title=f"{course.title} - Assessment",
                    description=f"Test your knowledge of {course.title}",
                    content="Interactive quiz to assess your understanding of the course material.",
                    content_type="quiz",
                    course_id=course.id,
                    order=99,  # Put quiz at the end
                    is_published=True
                )
                db.add(quiz_module)
                db.flush()  # Get the module ID
                
                print(f"Created quiz module: {quiz_module.title} for course: {course.title}")
                created_modules += 1
                
                # Create questions for this module
                for q_data in questions_data:
                    question = models.QuizQuestion(
                        question=q_data["question"],
                        module_id=quiz_module.id,
                        points=1
                    )
                    db.add(question)
                    db.flush()  # Get the question ID
                    created_questions += 1
                    print(f"  Added question: {q_data['question'][:50]}...")
                    
                    # Create options for this question
                    for option_data in q_data["options"]:
                        option = models.QuizOption(
                            option_text=option_data["text"],
                            is_correct=option_data["is_correct"],
                            question_id=question.id
                        )
                        db.add(option)
                        created_options += 1
        
        db.commit()
        print(f"\nSummary:")
        print(f"Created {created_modules} quiz modules")
        print(f"Created {created_questions} questions")
        print(f"Created {created_options} options")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_quiz_content()
