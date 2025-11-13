# Django Admin Access Guide

## Creating a Superuser Account

Since the HandyGH backend uses **phone-based authentication** instead of traditional username/password, you need to create a superuser through Django's management command.

### Step 1: Create Superuser

Run this command in your terminal:

```bash
cd backend
python manage.py createsuperuser
```

You'll be prompted to enter:
- **Phone number** (e.g., `+233241234567`)
- **Email** (optional, e.g., `admin@handygh.com`)
- **Name** (e.g., `Admin User`)

The system will automatically:
- Set `is_staff = True`
- Set `is_superuser = True`
- Set `role = ADMIN`

### Step 2: Access Django Admin

1. Start your development server:
   ```bash
   python manage.py runserver
   ```

2. Navigate to the admin panel:
   ```
   http://localhost:8000/admin/
   ```

3. **Login with phone number** (not username):
   - Phone: The phone number you entered (e.g., `+233241234567`)
   - Password: Django will prompt you to set a password during superuser creation

## Alternative: Create Admin via Django Shell

If you prefer to create an admin user programmatically:

```bash
python manage.py shell
```

Then run:

```python
from django.contrib.auth import get_user_model

User = get_user_model()

# Create admin user
admin = User.objects.create_superuser(
    phone='+233241234567',
    email='admin@handygh.com',
    name='Admin User',
    password='your-secure-password'  # Set a strong password
)

print(f"Admin user created: {admin.phone}")
```

## Quick Setup Script

For development, you can create a quick setup script:

**File: `backend/create_admin.py`**

```python
#!/usr/bin/env python
"""
Quick script to create an admin user for development.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'handygh.settings.development')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Admin credentials
ADMIN_PHONE = '+233241234567'
ADMIN_EMAIL = 'admin@handygh.com'
ADMIN_NAME = 'Admin User'
ADMIN_PASSWORD = 'admin123'  # Change this!

# Check if admin already exists
if User.objects.filter(phone=ADMIN_PHONE).exists():
    print(f"Admin user with phone {ADMIN_PHONE} already exists!")
else:
    admin = User.objects.create_superuser(
        phone=ADMIN_PHONE,
        email=ADMIN_EMAIL,
        name=ADMIN_NAME,
        password=ADMIN_PASSWORD
    )
    print(f"✅ Admin user created successfully!")
    print(f"Phone: {ADMIN_PHONE}")
    print(f"Password: {ADMIN_PASSWORD}")
    print(f"Access admin at: http://localhost:8000/admin/")
```

Run it:
```bash
python create_admin.py
```

## Default Development Credentials

For **development only**, you can use:

- **Phone**: `+233241234567`
- **Password**: `admin123` (if you used the script above)

⚠️ **IMPORTANT**: Change these credentials in production!

## Accessing Admin Features

Once logged in to Django admin, you can:

1. **Manage Users** - View, edit, suspend users
2. **Manage Providers** - Verify providers, view profiles
3. **Manage Bookings** - View all bookings, update statuses
4. **Manage Payments** - View transactions, commissions
5. **Manage Reviews** - Moderate reviews
6. **Manage Disputes** - Handle dispute resolution
7. **Manage Messages** - View conversations
8. **Manage Service Categories** - Add/edit categories

## API Admin Access

For API-based admin operations (not Django admin panel), use the OTP authentication:

### 1. Request OTP
```bash
POST /api/v1/auth/otp/request/
{
    "phone": "+233241234567"
}
```

### 2. Verify OTP
```bash
POST /api/v1/auth/otp/verify/
{
    "phone": "+233241234567",
    "otp": "123456",
    "name": "Admin User",
    "role": "ADMIN"
}
```

You'll receive JWT tokens to use for API requests.

### 3. Use Admin Endpoints
```bash
GET /api/v1/admin/dashboard/stats/
Authorization: Bearer <your-access-token>
```

## Troubleshooting

### "Phone field is required"
- Make sure you're entering the phone number in international format: `+233241234567`

### "This field is required" for username
- The custom user model uses `phone` as the username field
- Enter your phone number in the username field

### Can't login to admin panel
1. Verify the user has `is_staff=True` and `is_superuser=True`
2. Check in Django shell:
   ```python
   from django.contrib.auth import get_user_model
   User = get_user_model()
   admin = User.objects.get(phone='+233241234567')
   print(f"is_staff: {admin.is_staff}")
   print(f"is_superuser: {admin.is_superuser}")
   ```

### Reset admin password
```bash
python manage.py changepassword +233241234567
```

## Production Setup

For production:

1. **Create admin via secure method**:
   ```bash
   python manage.py createsuperuser
   ```

2. **Use strong password** (minimum 12 characters, mixed case, numbers, symbols)

3. **Enable 2FA** (if implemented)

4. **Restrict admin access** by IP if possible

5. **Monitor admin actions** through Django admin logs

## Security Best Practices

1. ✅ Never commit admin credentials to version control
2. ✅ Use environment variables for sensitive data
3. ✅ Change default passwords immediately
4. ✅ Use strong, unique passwords
5. ✅ Enable HTTPS in production
6. ✅ Regularly audit admin access logs
7. ✅ Limit admin access to trusted IPs
8. ✅ Use 2FA for admin accounts

---

**Need Help?** Check the [TROUBLESHOOTING.md](deployment/TROUBLESHOOTING.md) guide.
