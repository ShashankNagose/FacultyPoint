@echo off
REM FacultyPoint Backend Setup and Run Script for Windows

echo.
echo ========================================
echo FacultyPoint Backend Setup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo [✓] Python found
echo.

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo [✓] Virtual environment created
) else (
    echo [✓] Virtual environment already exists
)

echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo [✓] Virtual environment activated
echo.

REM Install requirements
echo Installing dependencies...
pip install -q -r requirements.txt
echo [✓] Dependencies installed
echo.

echo ========================================
echo Starting FacultyPoint Backend Server
echo ========================================
echo.
echo Server will run on: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.

REM Start the server
uvicorn app.main:app --reload --port 8000
