#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models

def update_course_images():
    """Update courses with proper thumbnail URLs"""
    
    # Create tables
    models.Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    try:
        # Course image mappings with beautiful, relevant images
        course_images = {
            "Digital Literacy Fundamentals": {
                "thumbnail_url": "/images/courses/digital-literacy-fundamentals.jpg",
                "description": "Master essential digital skills for the modern world. Learn computer basics, internet navigation, and digital communication fundamentals."
            },
            "Internet Safety and Security": {
                "thumbnail_url": "/images/courses/internet-safety-security.jpg", 
                "description": "Protect yourself online with comprehensive security practices. Learn about phishing, passwords, privacy settings, and safe browsing."
            },
            "Basic Computer Skills": {
                "thumbnail_url": "/images/courses/basic-computer-skills.jpg",
                "description": "Build foundational computer skills from scratch. Master file management, software basics, and essential computer operations."
            },
            "Email and Communication": {
                "thumbnail_url": "/images/courses/email-communication.jpg",
                "description": "Communicate effectively in the digital age. Learn professional email etiquette, messaging apps, and online collaboration tools."
            },
            "Social Media Literacy": {
                "thumbnail_url": "/images/courses/social-media-literacy.jpg",
                "description": "Navigate social media safely and effectively. Understand privacy, digital footprints, and responsible social media use."
            }
        }
        
        # Update each course
        for course_title, course_data in course_images.items():
            course = db.query(models.Course).filter(models.Course.title == course_title).first()
            if course:
                course.thumbnail_url = course_data["thumbnail_url"]
                course.description = course_data["description"]
                print(f"✅ Updated {course_title}")
            else:
                print(f"❌ Course '{course_title}' not found")
        
        db.commit()
        print(f"\n🎉 Successfully updated course images and descriptions!")
        
    except Exception as e:
        print(f"❌ Error updating courses: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_course_images()
