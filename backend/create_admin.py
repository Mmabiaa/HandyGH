#!/usr/bin/env python
"""
Quick script to create an admin user for development.
Usage: python create_admin.py
"""
import os
import sys

import django

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "handygh.settings.development")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Admin credentials (CHANGE THESE FOR PRODUCTION!)
ADMIN_PHONE = "+233241234567"
ADMIN_EMAIL = "admin@handygh.com"
ADMIN_NAME = "Admin User"
ADMIN_PASSWORD = "admin123"  # ⚠️ CHANGE THIS IN PRODUCTION!


def create_admin():
    """Create admin user if it doesn't exist."""

    print("=" * 50)
    print("HandyGH Admin User Creation")
    print("=" * 50)

    # Check if admin already exists
    if User.objects.filter(phone=ADMIN_PHONE).exists():
        print(f"\n⚠️  Admin user with phone {ADMIN_PHONE} already exists!")

        user = User.objects.get(phone=ADMIN_PHONE)
        print(f"\nExisting user details:")
        print(f"  Phone: {user.phone}")
        print(f"  Email: {user.email}")
        print(f"  Name: {user.name}")
        print(f"  Role: {user.role}")
        print(f"  Is Staff: {user.is_staff}")
        print(f"  Is Superuser: {user.is_superuser}")
        print(f"  Is Active: {user.is_active}")

        # Ask if user wants to update
        response = input("\nDo you want to reset this user's password? (yes/no): ")
        if response.lower() in ["yes", "y"]:
            user.set_password(ADMIN_PASSWORD)
            user.is_staff = True
            user.is_superuser = True
            user.role = "ADMIN"
            user.save()
            print(f"\n✅ Admin user updated successfully!")
            print(f"  New password: {ADMIN_PASSWORD}")
        else:
            print("\nNo changes made.")

        return user

    # Create new admin user
    try:
        admin = User.objects.create_superuser(
            phone=ADMIN_PHONE, email=ADMIN_EMAIL, name=ADMIN_NAME, password=ADMIN_PASSWORD
        )

        print(f"\n✅ Admin user created successfully!")
        print(f"\nCredentials:")
        print(f"  Phone: {ADMIN_PHONE}")
        print(f"  Email: {ADMIN_EMAIL}")
        print(f"  Name: {ADMIN_NAME}")
        print(f"  Password: {ADMIN_PASSWORD}")
        print(f"  Role: {admin.role}")
        print(f"  Is Staff: {admin.is_staff}")
        print(f"  Is Superuser: {admin.is_superuser}")

        print(f"\n📍 Access Points:")
        print(f"  Django Admin: http://localhost:8000/admin/")
        print(f"  API Docs: http://localhost:8000/api/docs/")

        print(f"\n⚠️  IMPORTANT:")
        print(f"  - These are DEVELOPMENT credentials only")
        print(f"  - Change the password in production!")
        print(f"  - Never commit credentials to version control")

        return admin

    except Exception as e:
        print(f"\n❌ Error creating admin user: {e}")
        sys.exit(1)


def main():
    """Main function."""
    try:
        admin = create_admin()
        print("\n" + "=" * 50)
        print("Setup complete!")
        print("=" * 50)

    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
