@echo off
echo Starting e-Gram Panchayat Backend Server...
echo Current directory: %CD%
node --version
npm --version

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found. Please run this script from the backend directory.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

echo 🚀 Starting server...
npm start
pause
