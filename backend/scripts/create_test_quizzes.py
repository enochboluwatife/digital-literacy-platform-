import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import sessionmaker
from app.database import get_db
from app.models import Course, Module, QuizQuestion, QuizOption, User, UserRole

def create_test_quizzes():
    # Get database session
    db = next(get_db())
    
    # Get courses to add modules and quizzes to
    courses = db.query(Course).all()
    
    if not courses:
        print("No courses found! Please create courses first.")
        return
    
    created_modules = []
    created_questions = []
    
    for course in courses[:3]:  # Add modules to first 3 courses
        print(f"Adding modules and quizzes to course: {course.title}")
        
        # Create modules for the course
        modules_data = [
            {
                "title": "Introduction",
                "description": f"Introduction to {course.title}",
                "content": f"Welcome to {course.title}! This module covers the basics.",
                "content_type": "text",
                "duration": 30,
                "order": 1,
                "course_id": course.id,
                "is_published": True
            },
            {
                "title": "Core Concepts",
                "description": f"Core concepts of {course.title}",
                "content": f"Learn the fundamental concepts of {course.title}.",
                "content_type": "text",
                "duration": 45,
                "order": 2,
                "course_id": course.id,
                "is_published": True
            },
            {
                "title": "Practical Application",
                "description": f"Practical application of {course.title}",
                "content": f"Apply what you've learned in {course.title}.",
                "content_type": "text",
                "duration": 60,
                "order": 3,
                "course_id": course.id,
                "is_published": True
            }
        ]
        
        for module_data in modules_data:
            # Check if module already exists
            existing_module = db.query(Module).filter(
                Module.title == module_data["title"],
                Module.course_id == course.id
            ).first()
            
            if existing_module:
                print(f"  Module '{module_data['title']}' already exists")
                module = existing_module
            else:
                print(f"  Creating module '{module_data['title']}'")
                module = Module(**module_data)
                db.add(module)
                db.flush()  # Get the ID
                created_modules.append(module)
            
            # Create quiz questions for each module
            quiz_questions = [
                {
                    "question": f"What is the main focus of {module.title}?",
                    "module_id": module.id,
                    "points": 1,
                    "options": [
                        {"option_text": f"Learning {course.title} basics", "is_correct": True},
                        {"option_text": "Advanced programming", "is_correct": False},
                        {"option_text": "Database management", "is_correct": False},
                        {"option_text": "Network security", "is_correct": False}
                    ]
                },
                {
                    "question": f"Which skill is most important in {module.title}?",
                    "module_id": module.id,
                    "points": 1,
                    "options": [
                        {"option_text": "Critical thinking", "is_correct": True},
                        {"option_text": "Memorization", "is_correct": False},
                        {"option_text": "Speed reading", "is_correct": False},
                        {"option_text": "Typing fast", "is_correct": False}
                    ]
                }
            ]
            
            for question_data in quiz_questions:
                # Check if question already exists
                existing_question = db.query(QuizQuestion).filter(
                    QuizQuestion.question == question_data["question"],
                    QuizQuestion.module_id == module.id
                ).first()
                
                if existing_question:
                    print(f"    Question already exists: {question_data['question'][:50]}...")
                    continue
                
                print(f"    Creating question: {question_data['question'][:50]}...")
                
                # Create the question
                options_data = question_data.pop("options")
                question = QuizQuestion(**question_data)
                db.add(question)
                db.flush()  # Get the ID
                created_questions.append(question)
                
                # Create the options
                for option_data in options_data:
                    option = QuizOption(
                        question_id=question.id,
                        **option_data
                    )
                    db.add(option)
    
    try:
        db.commit()
        print(f"\n✅ Successfully created {len(created_modules)} modules and {len(created_questions)} quiz questions!")
        
        # Show summary
        print("\nSummary:")
        print("-" * 60)
        for course in courses[:3]:
            modules = db.query(Module).filter(Module.course_id == course.id).all()
            print(f"📚 {course.title}")
            for module in modules:
                questions_count = db.query(QuizQuestion).filter(QuizQuestion.module_id == module.id).count()
                print(f"  📖 {module.title} - {questions_count} quiz questions")
            print("-" * 60)
            
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating quizzes: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_quizzes()
