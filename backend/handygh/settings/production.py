"""
Production settings for HandyGH.

This configuration is optimized for production deployment:
- PostgreSQL database
- DEBUG mode disabled
- Strict security settings
- Email backend configured
- Static files served via whitenoise
- Redis caching
- Enhanced logging
- Sentry error tracking

Environment Variables Required:
- SECRET_KEY: Django secret key (must be strong and unique)
- DATABASE_URL: PostgreSQL connection string
- ALLOWED_HOSTS: Comma-separated list of allowed hosts
- REDIS_URL: Redis connection string
- EMAIL_HOST_USER: SMTP email username
- EMAIL_HOST_PASSWORD: SMTP email password
- CORS_ALLOWED_ORIGINS: Comma-separated list of allowed CORS origins
- SENTRY_DSN: Sentry error tracking DSN (optional)
"""

import dj_database_url

from .base import *

# Optional Sentry integration
try:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration

    SENTRY_AVAILABLE = True
except ImportError:
    SENTRY_AVAILABLE = False

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Allowed hosts - must be configured for production
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="", cast=Csv())

# Ensure ALLOWED_HOSTS is configured
if not ALLOWED_HOSTS:
    raise ValueError("ALLOWED_HOSTS must be configured in production")

# Database - PostgreSQL for production
DATABASES = {
    "default": dj_database_url.config(
        default=config("DATABASE_URL"),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Email backend - Configure for production
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = config("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default="noreply@handygh.com")

# Cache - Redis for production
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": config("REDIS_URL", default="redis://127.0.0.1:6379/1"),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        },
        "KEY_PREFIX": "handygh",
        "TIMEOUT": 300,  # 5 minutes default
    }
}

# Security Settings
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = "DENY"

# Static files - Use whitenoise for production
MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# CORS - Specific origins only in production
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = config("CORS_ALLOWED_ORIGINS", cast=Csv())

# Logging - More restrictive in production
LOGGING["handlers"]["file"]["level"] = "WARNING"
LOGGING["loggers"]["django"]["level"] = "WARNING"
LOGGING["loggers"]["apps"]["level"] = "INFO"

# Admin URL - Change from default for security
ADMIN_URL = config("ADMIN_URL", default="admin/")

# Sentry Error Tracking (Optional)
SENTRY_DSN = config("SENTRY_DSN", default="")
if SENTRY_DSN and SENTRY_AVAILABLE:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.1,  # 10% of transactions for performance monitoring
        send_default_pii=False,  # Don't send personally identifiable information
        environment="production",
    )

# Additional Security Headers
SECURE_REFERRER_POLICY = "same-origin"
SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin"

# Session Security
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_AGE = 86400  # 24 hours

# CSRF Security
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = "Lax"
CSRF_USE_SESSIONS = False
CSRF_TRUSTED_ORIGINS = config("CSRF_TRUSTED_ORIGINS", default="", cast=Csv())

# File Upload Security
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
FILE_UPLOAD_PERMISSIONS = 0o644
FILE_UPLOAD_DIRECTORY_PERMISSIONS = 0o755

# Database Connection Pooling
DATABASES["default"]["OPTIONS"] = {
    "connect_timeout": 10,
    "options": "-c statement_timeout=30000",  # 30 seconds
}

# Performance Optimization
CONN_MAX_AGE = 600  # 10 minutes

# Disable browsable API in production
REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [
    "rest_framework.renderers.JSONRenderer",
]

# Enhanced logging for production
LOGGING["handlers"]["file"]["level"] = "WARNING"
LOGGING["handlers"]["file"]["filename"] = "/var/log/handygh/handygh.log"
LOGGING["loggers"]["django"]["level"] = "WARNING"
LOGGING["loggers"]["apps"]["level"] = "INFO"

# Add error logging handler
LOGGING["handlers"]["error_file"] = {
    "level": "ERROR",
    "class": "logging.handlers.RotatingFileHandler",
    "filename": "/var/log/handygh/error.log",
    "maxBytes": 1024 * 1024 * 10,  # 10 MB
    "backupCount": 10,
    "formatter": "verbose",
}
LOGGING["loggers"]["django"]["handlers"].append("error_file")
LOGGING["loggers"]["apps"]["handlers"].append("error_file")
