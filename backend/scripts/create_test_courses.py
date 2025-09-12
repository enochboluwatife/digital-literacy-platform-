import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import sessionmaker
from app.database import get_db
from app.models import Course, User, UserRole

def create_test_courses():
    # Get database session
    db = next(get_db())
    
    # Find admin and teacher users
    admin_user = db.query(User).filter(User.email == "admin@test.com").first()
    teacher_user = db.query(User).filter(User.email == "teacher@test.com").first()
    
    if not admin_user or not teacher_user:
        print("Admin or teacher user not found!")
        return
    
    # Test courses with video content
    test_courses = [
        {
            "title": "Digital Literacy Fundamentals",
            "description": "Learn the basics of digital literacy including computer skills, internet safety, and digital communication.",
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "content_type": "video",
            "teacher_id": teacher_user.id,
            "is_published": True
        },
        {
            "title": "Internet Safety and Security",
            "description": "Understanding online threats and how to protect yourself in the digital world.",
            "video_url": "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
            "content_type": "video",
            "teacher_id": teacher_user.id,
            "is_published": True
        },
        {
            "title": "Basic Computer Skills",
            "description": "Master fundamental computer operations, file management, and software basics.",
            "video_url": "https://vimeo.com/123456789",
            "content_type": "video",
            "teacher_id": admin_user.id,
            "is_published": True
        },
        {
            "title": "Email and Communication",
            "description": "Learn professional email etiquette and digital communication tools.",
            "video_url": "https://www.youtube.com/watch?v=ScMzIvxBSi4",
            "content_type": "video",
            "teacher_id": teacher_user.id,
            "is_published": True
        },
        {
            "title": "Social Media Literacy",
            "description": "Navigate social media platforms safely and responsibly.",
            "video_url": "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
            "content_type": "video",
            "teacher_id": admin_user.id,
            "is_published": True
        }
    ]
    
    created_courses = []
    
    for course_data in test_courses:
        # Check if course already exists
        existing_course = db.query(Course).filter(Course.title == course_data["title"]).first()
        
        if existing_course:
            print(f"Course '{course_data['title']}' already exists, updating...")
            for key, value in course_data.items():
                setattr(existing_course, key, value)
            created_courses.append(existing_course)
        else:
            print(f"Creating course '{course_data['title']}'...")
            new_course = Course(**course_data)
            db.add(new_course)
            created_courses.append(new_course)
    
    try:
        db.commit()
        print(f"\n✅ Successfully created/updated {len(created_courses)} test courses!")
        
        print("\nCourse List:")
        print("-" * 60)
        for course in created_courses:
            instructor = db.query(User).filter(User.id == course.teacher_id).first()
            print(f"📚 {course.title}")
            print(f"   Instructor: {instructor.first_name} {instructor.last_name}")
            print(f"   Video: {course.video_url}")
            print(f"   Published: {course.is_published}")
            print("-" * 60)
            
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating courses: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_courses()
