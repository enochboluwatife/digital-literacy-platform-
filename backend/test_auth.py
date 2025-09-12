import requests
import json
import random
import string

# Generate a random email for testing
def generate_random_email():
    random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test_{random_string}@example.com"

# Test registration
register_url = "http://localhost:8000/auth/register"
login_url = "http://localhost:8000/auth/login"

# Generate a unique email for this test
email = generate_random_email()

# Register a test user
register_data = {
    "email": email,
    "password": "testpassword123",
    "first_name": "Test",
    "last_name": "User",
    "role": "student"
}

try:
    # Try to register the user
    response = requests.post(register_url, json=register_data)
    print("Registration Response:", response.status_code, response.json())
    
    # If registration is successful, try to log in
    if response.status_code == 200:
        login_data = {
            "username": "test@example.com",
            "password": "testpassword123"
        }
        
        # Note: The login endpoint expects form data, not JSON
        response = requests.post(
            login_url,
            data={"username": "test@example.com", "password": "testpassword123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        print("\nLogin Response:", response.status_code, response.json())
        
        # If login is successful, test the /auth/me endpoint
        if response.status_code == 200:
            token = response.json().get("access_token")
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            me_response = requests.get("http://localhost:8000/auth/me", headers=headers)
            print("\nAuth/me Response:", me_response.status_code, me_response.json())
    
except Exception as e:
    print(f"An error occurred: {e}")
