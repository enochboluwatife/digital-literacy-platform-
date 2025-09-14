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

# Explicitly install python-jose with cryptography
echo "=== Installing python-jose with cryptography ==="
pip install "python-jose[cryptography]>=3.3.0"
pip install "jose>=1.0.0"

# Verify installations
echo "=== Verifying installations ==="
pip freeze | grep -E 'fastapi|uvicorn|sqlalchemy|python-jose|jose|pydantic|psycopg2|httpx'

# Check if jose is importable
echo "=== Checking jose import ==="
python -c "from jose import jwt; from jose.exceptions import JWTError; print('JWT module imported successfully')"

echo "=== Build completed successfully ==="
