@echo off
REM FacultyPoint Frontend Setup and Run Script for Windows

echo.
echo ========================================
echo FacultyPoint Frontend Setup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [✓] Node.js found: 
node --version

echo [✓] npm found: 
npm --version
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing npm dependencies...
    echo This may take a few minutes on first run...
    call npm install
    echo [✓] Dependencies installed
) else (
    echo [✓] Dependencies already installed
)

echo.
echo ========================================
echo Starting FacultyPoint Frontend Server
echo ========================================
echo.
echo Frontend will run on: http://localhost:5173
echo.

REM Start the development server
npm run dev
