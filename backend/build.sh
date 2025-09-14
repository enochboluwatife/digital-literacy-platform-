#!/bin/bash
set -e  # Exit on error

# Create and activate a clean virtual environment
echo "=== Creating virtual environment ==="
python -m venv venv
source venv/bin/activate

# Upgrade pip
echo "=== Upgrading pip ==="
python -m pip install --upgrade pip

# Install wheel first to avoid building issues
echo "=== Installing wheel ==="
pip install wheel

# Install requirements
echo "=== Installing requirements ==="
pip install -r requirements.txt

# Verify installations
echo "=== Verifying installations ==="
pip freeze | grep -E 'fastapi|uvicorn|sqlalchemy|python-jose|pydantic|psycopg2|httpx'

# Check if python_jose is importable
echo "=== Checking python_jose import ==="
python -c "from python_jose import jwt; from python_jose.exceptions import JWTError; print('python_jose module imported successfully')"

echo "=== Build completed successfully ==="
