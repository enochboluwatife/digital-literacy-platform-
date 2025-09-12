#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models
from app.models import UserRole
from passlib.context import CryptContext

# Create tables
models.Base.metadata.create_all(bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_test_users():
    db = SessionLocal()
    
    try:
        # Test users data
        test_users = [
            {
                "email": "admin@test.com",
                "password": "admin123",
                "first_name": "Admin",
                "last_name": "User",
                "role": UserRole.ADMIN,
                "institution": "Digital Literacy Platform"
            },
            {
                "email": "teacher@test.com", 
                "password": "teacher123",
                "first_name": "Teacher",
                "last_name": "User",
                "role": UserRole.TEACHER,
                "institution": "Digital Literacy Platform"
            },
            {
                "email": "student@test.com",
                "password": "student123", 
                "first_name": "Student",
                "last_name": "User",
                "role": UserRole.STUDENT,
                "institution": "Digital Literacy Platform"
            },
            {
                "email": "Omogbohunboluwatife@gmail.com",
                "password": "password123", 
                "first_name": "Boluwatife",
                "last_name": "Omog",
                "role": UserRole.STUDENT,
                "institution": "Digital Literacy Platform"
            }
        ]
        
        for user_data in test_users:
            # Check if user already exists
            existing_user = db.query(models.User).filter(models.User.email == user_data["email"]).first()
            
            if existing_user:
                print(f"User {user_data['email']} already exists, updating password...")
                existing_user.hashed_password = pwd_context.hash(user_data["password"])
                existing_user.role = user_data["role"]
                existing_user.first_name = user_data["first_name"]
                existing_user.last_name = user_data["last_name"]
                existing_user.institution = user_data["institution"]
            else:
                print(f"Creating user {user_data['email']}...")
                hashed_password = pwd_context.hash(user_data["password"])
                
                db_user = models.User(
                    email=user_data["email"],
                    hashed_password=hashed_password,
                    first_name=user_data["first_name"],
                    last_name=user_data["last_name"],
                    role=user_data["role"],
                    institution=user_data["institution"],
                    is_active=True
                )
                db.add(db_user)
        
        db.commit()
        print("Test users created/updated successfully!")
        
        # Verify users exist
        print("\nVerifying users:")
        for user_data in test_users:
            user = db.query(models.User).filter(models.User.email == user_data["email"]).first()
            if user:
                print(f"✓ {user.email} - {user.role.value} - ID: {user.id}")
            else:
                print(f"✗ {user_data['email']} - NOT FOUND")
                
    except Exception as e:
        print(f"Error creating test users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_users()
