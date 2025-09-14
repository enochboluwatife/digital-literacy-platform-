#!/bin/bash
# Ensure we're using Python 3.11
echo "Checking Python version..."
python3 --version

# Install dependencies
echo "Installing dependencies..."
cd backend
pip install --upgrade pip
pip install -r requirements.txt

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

echo "Build completed successfully!"
