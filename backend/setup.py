"""
Setup script for HandyGH backend.

Run this script to set up the development environment.
"""

import os
import sys
import subprocess


def run_command(command, description):
    """Run a shell command and handle errors."""
    print(f"\n{'='*60}")
    print(f"  {description}")
    print(f"{'='*60}")
    try:
        subprocess.run(command, shell=True, check=True)
        print(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed: {e}")
        return False


def main():
    """Main setup function."""
    print("\n" + "="*60)
    print("  HandyGH Backend Setup")
    print("="*60)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("✗ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Install dependencies
    if not run_command(
        "pip install -r requirements/development.txt",
        "Installing dependencies"
    ):
        sys.exit(1)
    
    # Create .env file if it doesn't exist
    if not os.path.exists('.env'):
        print("\n" + "="*60)
        print("  Creating .env file")
        print("="*60)
        subprocess.run("copy .env.example .env" if os.name == 'nt' else "cp .env.example .env", shell=True)
        print("✓ .env file created. Please update with your settings.")
    
    # Create logs directory
    if not os.path.exists('logs'):
        os.makedirs('logs')
        print("✓ Logs directory created")
    
    # Run migrations
    if not run_command(
        "python manage.py makemigrations",
        "Creating migrations"
    ):
        sys.exit(1)
    
    if not run_command(
        "python manage.py migrate",
        "Running migrations"
    ):
        sys.exit(1)
    
    # Create superuser prompt
    print("\n" + "="*60)
    print("  Create Superuser")
    print("="*60)
    print("Would you like to create a superuser? (y/n)")
    response = input().lower()
    if response == 'y':
        run_command(
            "python manage.py createsuperuser",
            "Creating superuser"
        )
    
    # Success message
    print("\n" + "="*60)
    print("  Setup Complete!")
    print("="*60)
    print("\nNext steps:")
    print("1. Update .env file with your settings")
    print("2. Run: python manage.py runserver")
    print("3. Visit: http://localhost:8000/api/docs/")
    print("4. Admin panel: http://localhost:8000/admin/")
    print("\n" + "="*60 + "\n")


if __name__ == '__main__':
    main()
