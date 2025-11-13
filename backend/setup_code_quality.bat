@echo off
REM Setup script for code quality tools

echo ========================================
echo HandyGH Code Quality Tools Setup
echo ========================================
echo.

echo Installing code quality tools...
pip install black==24.1.1 flake8==7.0.0 isort==5.13.2 pylint==3.0.3 mypy==1.8.0 pre-commit==3.6.0 bandit==1.7.6

echo.
echo Installing additional flake8 plugins...
pip install flake8-bugbear flake8-comprehensions flake8-simplify

echo.
echo Installing mypy plugins...
pip install django-stubs

echo.
echo Setting up pre-commit hooks...
pre-commit install

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo You can now use the following commands:
echo   - make format       : Format code with black and isort
echo   - make lint         : Run linting checks
echo   - make check        : Run all quality checks
echo   - make pre-commit   : Install pre-commit hooks
echo.
echo Or run tools directly:
echo   - black apps core handygh
echo   - flake8 apps core handygh
echo   - isort apps core handygh
echo   - pylint apps core handygh
echo.
