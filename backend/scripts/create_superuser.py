import sys
import os
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

from app.database import SessionLocal
from app import models, schemas
from app.core.security import get_password_hash

def create_superuser(email: str, password: str):
    db = SessionLocal()
    try:
        # Check if superuser already exists
        user = db.query(models.User).filter(models.User.email == email).first()
        if user:
            print(f"User with email {email} already exists")
            return False
        
        # Create new superuser
        hashed_password = get_password_hash(password)
        db_user = models.User(
            email=email,
            hashed_password=hashed_password,
            first_name="Admin",
            last_name="User",
            role=models.UserRole.ADMIN,
            is_active=True
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        print(f"Superuser {email} created successfully")
        return True
    except Exception as e:
        print(f"Error creating superuser: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    email = os.getenv("FIRST_SUPERUSER_EMAIL", "admin@example.com")
    password = os.getenv("FIRST_SUPERUSER_PASSWORD", "admin123")
    
    print(f"Creating superuser with email: {email}")
    create_superuser(email, password)
