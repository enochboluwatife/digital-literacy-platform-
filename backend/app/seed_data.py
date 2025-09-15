#!/usr/bin/env python3
"""
Automatic data seeding for production deployment
Runs on startup to ensure demo data exists
"""
import os
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models, auth
from app.core.security import get_password_hash

def seed_demo_data():
    """Seed the database with demo data if it's empty"""
    db = SessionLocal()
    try:
        # Check if we already have data
        user_count = db.query(models.User).count()
        if user_count > 0:
            print(f"Database already has {user_count} users, skipping seed")
            return
        
        print("Seeding database with demo data...")
        
        # Create demo users
        users_data = [
            {
                "email": "admin@demo.com",
                "password": "admin123",
                "first_name": "Demo",
                "last_name": "Admin",
                "role": models.UserRole.ADMIN
            },
            {
                "email": "teacher@demo.com", 
                "password": "teacher123",
                "first_name": "Sarah",
                "last_name": "Johnson",
                "role": models.UserRole.TEACHER
            },
            {
                "email": "student@demo.com",
                "password": "student123", 
                "first_name": "John",
                "last_name": "Smith",
                "role": models.UserRole.STUDENT
            }
        ]
        
        created_users = {}
        for user_data in users_data:
            user = models.User(
                email=user_data["email"],
                hashed_password=get_password_hash(user_data["password"]),
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                role=user_data["role"],
                is_active=True
            )
            db.add(user)
            db.flush()
            created_users[user_data["role"]] = user
            print(f"Created user: {user.email} ({user.role})")
        
        # Create demo courses
        courses_data = [
            {
                "title": "Digital Literacy Fundamentals",
                "description": "Master the essential skills for navigating the digital world. Learn computer basics, internet safety, and digital communication.",
                "content_type": "video",
                "is_published": True
            },
            {
                "title": "Internet Safety & Security", 
                "description": "Learn how to protect yourself online. Understand phishing, secure passwords, privacy settings, and safe browsing practices.",
                "content_type": "video",
                "is_published": True
            },
            {
                "title": "Microsoft Office Essentials",
                "description": "Get productive with Word, Excel, and PowerPoint. Learn document creation, spreadsheet basics, and presentation skills.",
                "content_type": "video", 
                "is_published": True
            },
            {
                "title": "Email & Communication",
                "description": "Master professional email communication, video conferencing, and digital collaboration tools.",
                "content_type": "video",
                "is_published": True
            },
            {
                "title": "Social Media Literacy",
                "description": "Navigate social media safely and effectively. Learn about privacy, digital footprints, and responsible sharing.",
                "content_type": "video",
                "is_published": True
            },
            {
                "title": "Online Banking & E-commerce",
                "description": "Safely manage your finances online. Learn secure banking practices and how to shop online safely.",
                "content_type": "video",
                "is_published": True
            }
        ]
        
        created_courses = {}
        teacher_user = created_users[models.UserRole.TEACHER]
        
        for course_data in courses_data:
            course = models.Course(
                title=course_data["title"],
                description=course_data["description"],
                content_type=course_data["content_type"],
                is_published=course_data["is_published"],
                teacher_id=teacher_user.id
            )
            db.add(course)
            db.flush()
            created_courses[course.title] = course
            print(f"Created course: {course.title}")
        
        # Create quiz modules and questions
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
            ]
        }
        
        for course_title, questions_data in quiz_data.items():
            if course_title in created_courses:
                course = created_courses[course_title]
                
                # Create quiz module
                quiz_module = models.Module(
                    title=f"{course.title} - Assessment",
                    description=f"Test your knowledge of {course.title}",
                    content="Interactive quiz to assess your understanding of the course material.",
                    content_type="quiz",
                    course_id=course.id,
                    order=99,
                    is_published=True
                )
                db.add(quiz_module)
                db.flush()
                
                # Create questions
                for q_data in questions_data:
                    question = models.QuizQuestion(
                        question=q_data["question"],
                        module_id=quiz_module.id,
                        points=1
                    )
                    db.add(question)
                    db.flush()
                    
                    # Create options
                    for option_data in q_data["options"]:
                        option = models.QuizOption(
                            option_text=option_data["text"],
                            is_correct=option_data["is_correct"],
                            question_id=question.id
                        )
                        db.add(option)
                
                print(f"Created quiz module for: {course.title}")
        
        db.commit()
        print("✅ Demo data seeded successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def init_db():
    """Initialize database tables and seed demo data"""
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
    
    # Seed demo data
    seed_demo_data()

if __name__ == "__main__":
    init_db()
