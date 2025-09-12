import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User, UserRole
from app.database import get_db
from app.auth import get_password_hash

def list_users():
    # Get database session
    db = next(get_db())
    
    # List all users
    users = db.query(User).all()
    print("\nCurrent users in the database:")
    print("-" * 50)
    for user in users:
        print(f"ID: {user.id}")
        print(f"Email: {user.email}")
        print(f"Name: {user.first_name} {user.last_name}")
        print(f"Role: {user.role}")
        print(f"Active: {user.is_active}")
        print("-" * 50)

def reset_password(email, new_password):
    # Get database session
    db = next(get_db())
    
    # Find user by email
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"User with email {email} not found")
        return
    
    # Update password
    user.hashed_password = get_password_hash(new_password)
    user.is_active = True
    db.commit()
    print(f"Password for {email} has been reset successfully")

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in ["list", "reset"]:
        print("Usage:")
        print("  python check_users.py list")
        print("  python check_users.py reset <email> <new_password>")
        sys.exit(1)
    
    if sys.argv[1] == "list":
        list_users()
    elif sys.argv[1] == "reset" and len(sys.argv) == 4:
        reset_password(sys.argv[2], sys.argv[3])
    else:
        print("Invalid arguments")
