import os
import sys
from pathlib import Path

# Add the parent directory to the path so we can import app
sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal, engine
from app import models
from app.core.security import get_password_hash

# Create database tables
def init_db():
    print("Creating database tables...")
    models.Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

def create_sample_data():
    db = SessionLocal()
    
    try:
        # Create sample users
        admin_user = models.User(
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            first_name="Admin",
            last_name="User",
            role=models.UserRole.ADMIN,
            is_active=True
        )
        
        student_user = models.User(
            email="student@example.com",
            hashed_password=get_password_hash("student123"),
            first_name="Student",
            last_name="User",
            role=models.UserRole.STUDENT,
            is_active=True
        )
        
        db.add_all([admin_user, student_user])
        db.commit()
        
        # Create sample course
        course = models.Course(
            title="Introduction to Digital Literacy",
            description="Learn the fundamentals of digital literacy in this comprehensive course.",
            thumbnail_url="/static/course1.jpg",
            is_published=True,
            teacher_id=admin_user.id
        )
        db.add(course)
        db.commit()
        db.refresh(course)
        
        # Create sample modules
        module1 = models.Module(
            title="Module 1: Understanding Digital Literacy",
            description="Introduction to digital literacy and its importance",
            content="Digital literacy is the ability to use digital technology, communication tools, and/or networks to access, manage, integrate, evaluate, create, and communicate information in order to function in a knowledge society.",
            content_type="text",
            duration=30,
            order=1,
            is_published=True,
            course_id=course.id
        )
        
        module2 = models.Module(
            title="Module 2: Online Safety and Security",
            description="Learn how to stay safe online",
            content="<p>This module covers essential online safety practices including password security, recognizing phishing attempts, and protecting personal information.</p>",
            content_type="text",
            duration=45,
            order=2,
            is_published=True,
            course_id=course.id
        )
        
        module3 = models.Module(
            title="Module 3: Digital Communication",
            description="Effective communication in the digital age",
            content="https://www.youtube.com/embed/sample-video",
            content_type="video",
            duration=20,
            order=3,
            is_published=True,
            course_id=course.id
        )
        
        module4 = models.Module(
            title="Quiz: Test Your Knowledge",
            description="Take this quiz to test your understanding of digital literacy",
            content="Answer the following questions to test your knowledge.",
            content_type="quiz",
            duration=15,
            order=4,
            is_published=True,
            course_id=course.id
        )
        
        db.add_all([module1, module2, module3, module4])
        db.commit()
        
        # Create quiz questions for module 4
        question1 = models.QuizQuestion(
            question="What is digital literacy?",
            points=1,
            module_id=module4.id
        )
        db.add(question1)
        db.flush()  # Flush to get the question ID for options
        
        # Add options for question 1
        options1 = [
            models.QuizOption(option_text="The ability to read digital clocks", is_correct=False, question_id=question1.id),
            models.QuizOption(option_text="The ability to use digital technology effectively", is_correct=True, question_id=question1.id),
            models.QuizOption(option_text="The ability to type quickly", is_correct=False, question_id=question1.id),
            models.QuizOption(option_text="The ability to code in Python", is_correct=False, question_id=question1.id)
        ]
        db.add_all(options1)
        
        question2 = models.QuizQuestion(
            question="Which of the following is a good password practice?",
            points=1,
            module_id=module4.id
        )
        db.add(question2)
        db.flush()
        
        # Add options for question 2
        options2 = [
            models.QuizOption(option_text="Using the same password for all accounts", is_correct=False, question_id=question2.id),
            models.QuizOption(option_text="Using your name or birthdate as password", is_correct=False, question_id=question2.id),
            models.QuizOption(option_text="Using a combination of letters, numbers, and special characters", is_correct=True, question_id=question2.id),
            models.QuizOption(option_text="Writing down your password and keeping it near your computer", is_correct=False, question_id=question2.id)
        ]
        db.add_all(options2)
        
        # Create enrollment for the student
        enrollment = models.Enrollment(
            user_id=student_user.id,
            course_id=course.id,
            completed=False,
            progress=25
        )
        db.add(enrollment)
        
        db.commit()
        
        print("Sample data created successfully!")
        print("Admin user created with email: admin@example.com and password: admin123")
        print("Student user created with email: student@example.com and password: student123")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--sample-data":
        print("Creating sample data...")
        create_sample_data()
    
    print("Database initialization complete!")
