#!/bin/bash

# FacultyPoint Frontend Setup and Run Script for macOS/Linux

echo ""
echo "========================================"
echo "FacultyPoint Frontend Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

echo "[✓] Node.js found: $(node --version)"
echo "[✓] npm found: $(npm --version)"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    echo "This may take a few minutes on first run..."
    npm install
    echo "[✓] Dependencies installed"
else
    echo "[✓] Dependencies already installed"
fi

echo ""
echo "========================================"
echo "Starting FacultyPoint Frontend Server"
echo "========================================"
echo ""
echo "Frontend will run on: http://localhost:5173"
echo ""

# Start the development server
npm run dev
