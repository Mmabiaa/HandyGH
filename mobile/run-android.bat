@echo off
echo ========================================
echo   HandyGH Mobile - Android Setup
echo ========================================
echo.

REM Check if Android Studio is installed
if not exist "%LOCALAPPDATA%\Android\Sdk" (
    echo [ERROR] Android SDK not found!
    echo.
    echo Please install Android Studio first:
    echo https://developer.android.com/studio
    echo.
    echo Then set ANDROID_HOME environment variable:
    echo ANDROID_HOME = %LOCALAPPDATA%\Android\Sdk
    echo.
    pause
    exit /b 1
)

echo [OK] Android SDK found
echo.

REM Check if ANDROID_HOME is set
if "%ANDROID_HOME%"=="" (
    echo [WARNING] ANDROID_HOME not set
    echo Setting temporarily...
    set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
    echo.
)

echo ANDROID_HOME: %ANDROID_HOME%
echo.

REM Check for running emulator
echo Checking for running emulator...
adb devices | findstr "emulator" >nul
if %errorlevel%==0 (
    echo [OK] Emulator is running
) else (
    echo [INFO] No emulator detected
    echo Please start an emulator from Android Studio
    echo Or connect a physical device via USB
    echo.
    echo Press any key to continue anyway...
    pause >nul
)

echo.
echo ========================================
echo   Building and Running App
echo ========================================
echo.
echo This will take 5-10 minutes the first time...
echo.

npx expo run:android

if %errorlevel%==0 (
    echo.
    echo ========================================
    echo   Success! App is running
    echo ========================================
    echo.
    echo The app should now be running on your emulator/device
    echo Code changes will hot reload automatically
    echo.
) else (
    echo.
    echo ========================================
    echo   Build Failed
    echo ========================================
    echo.
    echo Check the error messages above
    echo See ANDROID_SETUP.md for troubleshooting
    echo.
)

pause
