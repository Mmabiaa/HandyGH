"""
Test settings for HandyGH.

This configuration is optimized for running tests:
- In-memory SQLite database for speed
- Simplified password hashing
- Disabled migrations for faster test database creation
- Console email backend
"""

from .base import *

# Use in-memory SQLite for tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
        'ATOMIC_REQUESTS': True,
    }
}

# Faster password hashing for tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Enable migrations for tests (needed for proper database setup)
# MIGRATION_MODULES can be disabled for faster tests if needed

# Email backend - Console for tests
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Cache - Use LocMemCache for tests (needed for rate limiting tests)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'test-cache',
    }
}

# Logging - Minimal logging in tests
LOGGING['handlers']['console']['level'] = 'ERROR'
LOGGING['loggers']['django']['level'] = 'ERROR'
LOGGING['loggers']['apps']['level'] = 'ERROR'

# Disable throttling in tests
REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = []

# Shorter JWT tokens for tests
SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(minutes=5)
SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'] = timedelta(minutes=30)
