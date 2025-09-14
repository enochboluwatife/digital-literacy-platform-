#!/bin/bash
# Ensure we're using Python 3.11
echo "Setting up Python 3.11 environment..."

# Install Python 3.11 if not present
if ! command -v python3.11 &> /dev/null; then
    echo "Python 3.11 not found. Installing..."
    apt-get update && apt-get install -y python3.11 python3.11-venv
fi

# Create and activate a virtual environment with Python 3.11
python3.11 -m venv /opt/render/venv
source /opt/render/venv/bin/activate

# Ensure we're using the correct Python version
echo "Using Python version:"
python --version

# Install dependencies
echo "Installing dependencies..."
cd backend
pip install --upgrade pip
pip install -r requirements.txt

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

echo "Build completed successfully!"
