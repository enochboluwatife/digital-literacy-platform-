#!/usr/bin/env python3

import sys
from pathlib import Path

# Add the parent directory to the path so we can import app
sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal
from app import models
from app.core.security import get_password_hash

def create_test_data():
    db = SessionLocal()
    
    try:
        # Get admin user
        admin_user = db.query(models.User).filter(models.User.email == "admin@example.com").first()
        if not admin_user:
            print("Admin user not found!")
            return
        
        # Create test courses
        courses_data = [
            {
                "title": "Basic Computer Skills",
                "description": "Learn fundamental computer operations, file management, and basic software usage.",
                "thumbnail_url": "/static/computer-basics.png",
                "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "content_type": "mixed",
                "is_published": True
            },
            {
                "title": "Internet Safety & Security",
                "description": "Understand online threats, privacy protection, and safe browsing practices.",
                "thumbnail_url": "/static/internet-security.jpg",
                "content_type": "text",
                "is_published": True
            },
            {
                "title": "Digital Communication",
                "description": "Master email, social media, and professional online communication.",
                "thumbnail_url": "/static/digital-communication.png",
                "content_type": "video",
                "is_published": True
            }
        ]
        
        created_courses = []
        for course_data in courses_data:
            course = models.Course(
                teacher_id=admin_user.id,
                **course_data
            )
            db.add(course)
            db.flush()  # Get the course ID
            created_courses.append(course)
        
        db.commit()
        print(f"Created {len(created_courses)} courses")
        
        # Create modules for the first course
        course1 = created_courses[0]
        modules_data = [
            {
                "title": "Introduction to Computers",
                "description": "Understanding computer hardware and software",
                "content": "Computers are electronic devices that process data using instructions stored in their memory. They consist of hardware (physical components) and software (programs and applications).",
                "content_type": "text",
                "duration": 30,
                "order": 1,
                "is_published": True
            },
            {
                "title": "Operating Systems",
                "description": "Learn about different operating systems",
                "content": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "content_type": "video",
                "duration": 25,
                "order": 2,
                "is_published": True
            },
            {
                "title": "File Management Quiz",
                "description": "Test your knowledge of file management",
                "content": "Answer the following questions about file management best practices.",
                "content_type": "quiz",
                "duration": 15,
                "order": 3,
                "is_published": True
            }
        ]
        
        for module_data in modules_data:
            module = models.Module(
                course_id=course1.id,
                **module_data
            )
            db.add(module)
            db.flush()
            
            # Create quiz questions for the quiz module
            if module_data["content_type"] == "quiz":
                question1 = models.QuizQuestion(
                    question="What is the best practice for organizing files?",
                    points=1,
                    module_id=module.id
                )
                db.add(question1)
                db.flush()
                
                # Add options for question 1
                options1 = [
                    models.QuizOption(option_text="Put all files in one folder", is_correct=False, question_id=question1.id),
                    models.QuizOption(option_text="Create folders and subfolders for different types of files", is_correct=True, question_id=question1.id),
                    models.QuizOption(option_text="Save files on the desktop only", is_correct=False, question_id=question1.id),
                    models.QuizOption(option_text="Don't organize files at all", is_correct=False, question_id=question1.id)
                ]
                db.add_all(options1)
        
        db.commit()
        print("Created modules and quiz questions")
        
        # Create enrollment for a student
        student_user = db.query(models.User).filter(models.User.email == "test@example.com").first()
        if student_user:
            enrollment = models.Enrollment(
                user_id=student_user.id,
                course_id=course1.id,
                completed=False,
                progress=0
            )
            db.add(enrollment)
            db.commit()
            print("Created student enrollment")
        
        print("Test data created successfully!")
        
    except Exception as e:
        print(f"Error creating test data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_data()
