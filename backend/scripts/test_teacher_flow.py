import sys
import os
import requests
from dotenv import load_dotenv

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv()

# API configuration
BASE_URL = "http://localhost:8000"
AUTH_URL = f"{BASE_URL}/auth"
COURSES_URL = f"{BASE_URL}/courses"

def test_teacher_flow():
    # Test data
    teacher_creds = {
        "email": "teacher_test@example.com",
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "Teacher",
        "role": "teacher"
    }
    
    course_data = {
        "title": "Test Course",
        "description": "This is a test course",
        "is_published": True
    }
    
    print("=== Testing Teacher Registration and Course Management ===")
    
    # 1. Register a new teacher
    print("\n1. Registering a new teacher...")
    response = requests.post(f"{AUTH_URL}/register", json=teacher_creds)
    if response.status_code != 200:
        print(f"❌ Failed to register teacher: {response.text}")
        return False
    
    teacher_data = response.json()
    print(f"✅ Teacher registered successfully! ID: {teacher_data['id']}")
    
    # 2. Login as the teacher
    print("\n2. Logging in as the teacher...")
    login_data = {
        "username": teacher_creds["email"],
        "password": teacher_creds["password"]
    }
    response = requests.post(
        f"{AUTH_URL}/login",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return False
    
    token_data = response.json()
    access_token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}
    print("✅ Teacher logged in successfully!")
    
    # 3. Create a new course
    print("\n3. Creating a new course...")
    response = requests.post(
        f"{COURSES_URL}",
        json=course_data,
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"❌ Failed to create course: {response.text}")
        return False
    
    course = response.json()
    print(f"✅ Course created successfully! ID: {course['id']}")
    
    # 4. Get the teacher's courses
    print("\n4. Getting teacher's courses...")
    response = requests.get(f"{COURSES_URL}", headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Failed to get courses: {response.text}")
        return False
    
    courses = response.json()
    print(f"✅ Found {len(courses)} courses for the teacher")
    
    # 5. Update the course
    print("\n5. Updating the course...")
    update_data = {"description": "Updated description"}
    response = requests.put(
        f"{COURSES_URL}/{course['id']}",
        json=update_data,
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"❌ Failed to update course: {response.text}")
        return False
    
    updated_course = response.json()
    print(f"✅ Course updated successfully! New description: {updated_course['description']}")
    
    # 6. Delete the course
    print("\n6. Deleting the course...")
    response = requests.delete(
        f"{COURSES_URL}/{course['id']}",
        headers=headers
    )
    
    if response.status_code != 204:
        print(f"❌ Failed to delete course: {response.text}")
        return False
    
    print("✅ Course deleted successfully!")
    
    # 7. Verify course was deleted
    print("\n7. Verifying course was deleted...")
    response = requests.get(f"{COURSES_URL}", headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Failed to get courses: {response.text}")
        return False
    
    courses = response.json()
    course_ids = [c["id"] for c in courses]
    
    if course['id'] not in course_ids:
        print("✅ Course successfully deleted!")
    else:
        print("❌ Course still exists after deletion!")
        return False
    
    print("\n=== All tests passed successfully! ===")
    return True

if __name__ == "__main__":
    test_teacher_flow()
