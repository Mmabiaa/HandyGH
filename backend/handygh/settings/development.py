"""
Development settings for HandyGH.

This configuration is optimized for local development:
- SQLite database for easy setup
- DEBUG mode enabled
- Detailed error pages
- Console email backend
- Relaxed security settings
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "[::1]"]

# Database - SQLite for development
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
        "ATOMIC_REQUESTS": True,  # Wrap each request in a transaction
    }
}

# Email backend - Console for development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Cache - Local memory cache for development
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "handygh-dev-cache",
    }
}

# Development-specific logging
LOGGING["handlers"]["console"]["level"] = "DEBUG"
LOGGING["loggers"]["apps"]["level"] = "DEBUG"

# Django Debug Toolbar (optional, uncomment if installed)
# INSTALLED_APPS += ['debug_toolbar']
# MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
# INTERNAL_IPS = ['127.0.0.1']

# Disable HTTPS redirect in development
SECURE_SSL_REDIRECT = False

# CORS - Allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Static files - No whitenoise in development
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}
