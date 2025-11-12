@echo off
echo ============================================================
echo   HandyGH Backend - Quick Setup
echo ============================================================
echo.

echo Creating logs directory...
if not exist logs mkdir logs
echo [OK] Logs directory created
echo.

echo Running migrations...
python manage.py makemigrations
python manage.py migrate
echo [OK] Migrations complete
echo.

echo ============================================================
echo   Setup Complete!
echo ============================================================
echo.
echo Next steps:
echo 1. Run: python manage.py runserver
echo 2. Visit: http://localhost:8000/api/docs/
echo.
pause
