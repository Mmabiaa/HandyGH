@echo off
echo ========================================
echo HandyGH Mobile App - Quick Start
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install --legacy-peer-deps
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo.
    echo IMPORTANT: Edit .env and update API_BASE_URL with your computer's IP address
    echo Example: API_BASE_URL=http://192.168.1.100:8000/api/v1
    echo.
    pause
)

echo Starting Expo development server...
echo.
echo Once started:
echo - Press 'i' for iOS simulator
echo - Press 'a' for Android emulator
echo - Scan QR code with Expo Go app on your phone
echo.

call npm start
