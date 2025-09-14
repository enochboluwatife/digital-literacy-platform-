#!/bin/bash
set -e  # Exit on error

# Create and activate a clean virtual environment
echo "=== Creating virtual environment ==="
python -m venv venv
source venv/bin/activate

# Upgrade pip and setuptools
echo "=== Upgrading pip and setuptools ==="
python -m pip install --upgrade pip setuptools wheel

# Install system dependencies if needed
echo "=== Installing system dependencies ==="
if command -v apt-get &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y build-essential libssl-dev libffi-dev python3-dev
fi

# Install requirements
echo "=== Installing requirements ==="
pip install --no-cache-dir -r requirements.txt

# Install python-jose with cryptography explicitly
echo "=== Installing python-jose with cryptography ==="
pip install --no-cache-dir "python-jose[cryptography]"

# Verify installations
echo "=== Verifying installations ==="
pip freeze | grep -E 'fastapi|uvicorn|sqlalchemy|python-jose|pydantic|psycopg2|httpx|PyJWT|dnspython|cryptography'

# Check if python_jose is importable
echo "=== Checking python_jose import ==="
python -c "
import sys
try:
    from jose import jwt
    from jose.exceptions import JWTError
    print('SUCCESS: python_jose module imported successfully')
    print(f'JWT version: {jwt.__version__ if hasattr(jwt, "__version__") else "Not available"}')
except ImportError as e:
    print(f'ERROR: Failed to import python_jose: {e}')
    print('Trying alternative import...')
    try:
        import python_jose.jwt as pyjwt
        from python_jose.exceptions import JWTError
        print('SUCCESS: python_jose.jwt imported successfully')
    except ImportError as e2:
        print(f'ERROR: Alternative import also failed: {e2}')
        print('\nInstalled packages:')
        !pip list
        sys.exit(1)
"

echo "=== Build completed successfully ==="

# Print Python path for debugging
echo "\n=== Python Path ==="
python -c "import sys; print('\n'.join(sys.path))"

echo "\n=== Installed packages ==="
pip list
