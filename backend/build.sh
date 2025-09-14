#!/bin/bash
set -e  # Exit on error

# Create and activate a clean virtual environment
echo "=== Creating virtual environment ==="
python -m venv venv
source venv/bin/activate

# Upgrade pip
echo "=== Upgrading pip ==="
python -m pip install --upgrade pip

# Install requirements
echo "=== Installing requirements ==="
pip install -r requirements.txt

# Verify installations
echo "=== Verifying installations ==="
pip list | grep -E 'fastapi|uvicorn|sqlalchemy|python-jose|pydantic|psycopg2|httpx'

echo "=== Build completed successfully ==="
