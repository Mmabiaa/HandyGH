#!/bin/bash
# Script to collect static files for production deployment

set -e  # Exit on error

echo "=========================================="
echo "HandyGH Static Files Collection"
echo "=========================================="

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Warning: Virtual environment not activated"
    echo "Attempting to activate..."
    if [ -f "../venv/bin/activate" ]; then
        source ../venv/bin/activate
    elif [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    else
        echo "Error: Could not find virtual environment"
        exit 1
    fi
fi

# Set Django settings module
export DJANGO_SETTINGS_MODULE=handygh.settings.production

# Create directories if they don't exist
echo "Creating directories..."
mkdir -p staticfiles
mkdir -p media
mkdir -p logs

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Set proper permissions
echo "Setting permissions..."
chmod -R 755 staticfiles
chmod -R 755 media
chmod -R 755 logs

echo "=========================================="
echo "Static files collected successfully!"
echo "=========================================="
echo "Static files location: $(pwd)/staticfiles"
echo "Media files location: $(pwd)/media"
echo "Logs location: $(pwd)/logs"
