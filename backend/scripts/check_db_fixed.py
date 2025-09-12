import sys
import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import SQLALCHEMY_DATABASE_URL

def check_database():
    print(f"Connecting to database at: {SQLALCHEMY_DATABASE_URL}")
    
    # Create an engine that connects to the SQLite database
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # Create a configured "Session" class
    Session = sessionmaker(bind=engine)
    
    # Create a Session
    session = Session()
    
    # Get table information
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    print("\nTables in the database:")
    for table in tables:
        print(f"\nTable: {table}")
        print("-" * (len(table) + 7))
        
        # Get column information
        columns = inspector.get_columns(table)
        print("Columns:")
        for column in columns:
            print(f"  - {column['name']} ({column['type']})")
        
        # Get row count
        result = session.execute(text(f"SELECT COUNT(*) FROM {table}"))
        count = result.scalar()
        print(f"Row count: {count}")
        
        # Get sample data (first 3 rows)
        if count > 0:
            print("Sample data:")
            result = session.execute(text(f"SELECT * FROM {table} LIMIT 3"))
            for row in result:
                print(f"  - {row}")
        
        print()
    
    session.close()

if __name__ == "__main__":
    check_database()
