#!/bin/bash

# FacultyPoint Backend Setup and Run Script for macOS/Linux

echo ""
echo "========================================"
echo "FacultyPoint Backend Setup"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

echo "[✓] Python found: $(python3 --version)"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "[✓] Virtual environment created"
else
    echo "[✓] Virtual environment already exists"
fi

echo ""
echo "Activating virtual environment..."
source venv/bin/activate
echo "[✓] Virtual environment activated"
echo ""

# Install requirements
echo "Installing dependencies..."
pip install -q -r requirements.txt
echo "[✓] Dependencies installed"
echo ""

echo "========================================"
echo "Starting FacultyPoint Backend Server"
echo "========================================"
echo ""
echo "Server will run on: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""

# Start the server
uvicorn app.main:app --reload --port 8000
