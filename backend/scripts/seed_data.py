from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models, schemas
from datetime import datetime, timedelta

def create_test_data():
    db = SessionLocal()
    
    try:
        # Create test admin user
        admin = db.query(models.User).filter(models.User.email == "admin@example.com").first()
        if not admin:
            admin = models.User(
                email="admin@example.com",
                hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # password: admin123
                first_name="Admin",
                last_name="User",
                role=models.UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
        
        # Create test student user
        student = db.query(models.User).filter(models.User.email == "student@example.com").first()
        if not student:
            student = models.User(
                email="student@example.com",
                hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # password: admin123
                first_name="Student",
                last_name="User",
                role=models.UserRole.STUDENT,
                is_active=True,
                institution="University of Lagos"
            )
            db.add(student)
            db.commit()
            db.refresh(student)
        
        # Create test course
        course = db.query(models.Course).filter(models.Course.title == "Digital Literacy Fundamentals").first()
        if not course:
            course = models.Course(
                title="Digital Literacy Fundamentals",
                description="Master essential digital skills for academic and professional success with this comprehensive course designed for Nigerian university students.",
                thumbnail_url="/digital-literacy.jpg",
                is_published=True
            )
            db.add(course)
            db.commit()
            db.refresh(course)
            
            # Create modules for the course
            modules_data = [
                {
                    "title": "Introduction to Digital Literacy",
                    "description": "Understanding the importance of digital skills in today's world",
                    "content": "This module introduces the fundamental concepts of digital literacy and why they are essential in today's digital age.",
                    "content_type": "text",
                    "duration": 20,
                    "order": 1,
                    "is_published": True
                },
                {
                    "title": "Computer Basics",
                    "description": "Learn the fundamentals of using a computer",
                    "content": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    "content_type": "video",
                    "duration": 30,
                    "order": 2,
                    "is_published": True
                },
                {
                    "title": "Internet Fundamentals",
                    "description": "Navigating the web safely and effectively",
                    "content": "This module covers how to use web browsers, search engines, and basic online safety practices.",
                    "content_type": "text",
                    "duration": 25,
                    "order": 3,
                    "is_published": True,
                    "quiz_questions": [
                        {
                            "question": "What is the capital of Nigeria?",
                            "points": 1,
                            "options": [
                                {"option_text": "Lagos", "is_correct": False},
                                {"option_text": "Abuja", "is_correct": True},
                                {"option_text": "Kano", "is_correct": False},
                                {"option_text": "Ibadan", "is_correct": False}
                            ]
                        }
                    ]
                }
            ]
            
            for module_data in modules_data:
                quiz_questions = module_data.pop('quiz_questions', [])
                module = models.Module(course_id=course.id, **module_data)
                db.add(module)
                db.commit()
                db.refresh(module)
                
                for q_data in quiz_questions:
                    options = q_data.pop('options')
                    question = models.QuizQuestion(module_id=module.id, **q_data)
                    db.add(question)
                    db.commit()
                    db.refresh(question)
                    
                    for opt_data in options:
                        option = models.QuizOption(question_id=question.id, **opt_data)
                        db.add(option)
                    db.commit()
            
            # Enroll student in the course
            enrollment = models.Enrollment(
                user_id=student.id,
                course_id=course.id,
                completed=False,
                progress=0,
                enrolled_at=datetime.utcnow()
            )
            db.add(enrollment)
            db.commit()
            
        print("✅ Test data created successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating test data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🌱 Seeding test data...")
    create_test_data()
