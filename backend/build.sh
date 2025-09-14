#!/bin/bash
# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install python-jose with cryptography explicitly
pip install "python-jose[cryptography]"

# Verify installation
pip list | grep jose
