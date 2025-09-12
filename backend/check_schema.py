from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from app.database import Base, engine
from app import models

def check_schema():
    # Create a session
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Create an inspector
    inspector = inspect(engine)
    
    # Check if users table exists
    if 'users' not in inspector.get_table_names():
        print("Users table does not exist!")
        return
    
    # Get columns in users table
    columns = inspector.get_columns('users')
    print("\nUsers table columns:")
    for column in columns:
        print(f"- {column['name']}: {column['type']} (nullable: {column['nullable']})")
    
    # Check for missing columns
    required_columns = {
        'id', 'email', 'hashed_password', 'first_name', 
        'last_name', 'institution', 'role', 'is_active',
        'created_at', 'updated_at'
    }
    
    existing_columns = {col['name'] for col in columns}
    missing_columns = required_columns - existing_columns
    
    if missing_columns:
        print("\nMissing columns:")
        for col in missing_columns:
            print(f"- {col}")
    else:
        print("\nAll required columns exist!")
    
    # Check if we can query the users table
    try:
        user_count = session.query(models.User).count()
        print(f"\nNumber of users in database: {user_count}")
    except Exception as e:
        print(f"\nError querying users table: {str(e)}")
    
    session.close()

if __name__ == "__main__":
    check_schema()
