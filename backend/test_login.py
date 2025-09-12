#!/usr/bin/env python3

import requests
import sys

def test_login():
    url = "http://localhost:8000/auth/login"
    
    # Test with form data
    data = {
        'username': 'student@test.com',
        'password': 'student123'
    }
    
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    print("Testing login with form data...")
    print(f"URL: {url}")
    print(f"Data: {data}")
    print(f"Headers: {headers}")
    
    try:
        response = requests.post(url, data=data, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
        else:
            print("❌ Login failed!")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
