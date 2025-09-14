#!/bin/bash
set -e  # Exit on error

# Install Python dependencies
echo "=== Upgrading pip ==="
python -m pip install --upgrade pip

echo "=== Installing requirements ==="
pip install -r requirements.txt

# Install python-jose with cryptography explicitly
echo "=== Installing python-jose with cryptography ==="
pip install "python-jose[cryptography]"

# Verify installations
echo "=== Verifying installations ==="
pip list | grep -E 'jose|cryptography|pydantic|fastapi'

echo "=== Build completed successfully ==="
