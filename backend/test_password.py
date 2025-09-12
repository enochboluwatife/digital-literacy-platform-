from app.auth import get_password_hash, verify_password

# Test password hashing and verification
test_password = "testpassword123"
hashed = get_password_hash(test_password)
print(f"Hashed password: {hashed}")

# Verify the password
is_valid = verify_password(test_password, hashed)
print(f"Password verification result: {is_valid}")

# Test with wrong password
is_valid_wrong = verify_password("wrongpassword", hashed)
print(f"Wrong password verification result: {is_valid_wrong}")
