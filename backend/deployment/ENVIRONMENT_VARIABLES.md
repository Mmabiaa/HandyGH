# Environment Variables Reference

Complete reference for all environment variables used in HandyGH backend.

## Required Variables

These variables **must** be set in production:

### Django Core

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SECRET_KEY` | Django secret key for cryptographic signing | `django-insecure-xyz...` | Yes |
| `DEBUG` | Enable/disable debug mode | `False` | Yes |
| `DJANGO_SETTINGS_MODULE` | Django settings module to use | `handygh.settings.production` | Yes |
| `ALLOWED_HOSTS` | Comma-separated list of allowed hosts | `yourdomain.com,www.yourdomain.com` | Yes |

### Database

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` | Yes |

### JWT Authentication

| Variable | Description | Example | Default | Required |
|----------|-------------|---------|---------|----------|
| `JWT_ACCESS_TOKEN_LIFETIME` | Access token lifetime in minutes | `15` | `15` | No |
| `JWT_REFRESH_TOKEN_LIFETIME` | Refresh token lifetime in minutes | `10080` | `10080` | No |

### OTP Configuration

| Variable | Description | Example | Default | Required |
|----------|-------------|---------|---------|----------|
| `OTP_LENGTH` | Length of OTP code | `6` | `6` | No |
| `OTP_EXPIRY_MINUTES` | OTP expiration time in minutes | `10` | `10` | No |
| `OTP_MAX_ATTEMPTS` | Maximum OTP verification attempts | `5` | `5` | No |

### Rate Limiting

| Variable | Description | Example | Default | Required |
|----------|-------------|---------|---------|----------|
| `RATE_LIMIT_OTP_REQUEST` | OTP request rate limit | `5/hour` | `5/hour` | No |
| `RATE_LIMIT_OTP_VERIFY` | OTP verification rate limit | `10/hour` | `10/hour` | No |

### Business Logic

| Variable | Description | Example | Default | Required |
|----------|-------------|---------|---------|----------|
| `DEFAULT_COMMISSION_RATE` | Platform commission rate (0-1) | `0.10` | `0.10` | No |

### SMS Provider

| Variable | Description | Example | Default | Required |
|----------|-------------|---------|---------|----------|
| `SMS_PROVIDER` | SMS provider name | `twilio` | `mock` | No |
| `SMS_API_KEY` | SMS provider API key | `your-api-key` | `""` | No |

## Production-Only Variables

These variables are only needed in production:

### Email Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `EMAIL_HOST` | SMTP server hostname | `smtp.gmail.com` | Yes |
| `EMAIL_PORT` | SMTP server port | `587` | Yes |
| `EMAIL_USE_TLS` | Use TLS for email | `True` | Yes |
| `EMAIL_HOST_USER` | SMTP username | `your-email@example.com` | Yes |
| `EMAIL_HOST_PASSWORD` | SMTP password | `your-app-password` | Yes |
| `DEFAULT_FROM_EMAIL` | Default sender email | `noreply@handygh.com` | Yes |

### Redis Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `REDIS_URL` | Redis connection string | `redis://:password@localhost:6379/1` | Yes |

### CORS Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | `https://yourdomain.com` | Yes |

### CSRF Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `CSRF_TRUSTED_ORIGINS` | Comma-separated trusted origins | `https://yourdomain.com` | Yes |

### Security

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `ADMIN_URL` | Custom admin URL path | `secure-admin/` | No |

### Monitoring

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SENTRY_DSN` | Sentry error tracking DSN | `https://...@sentry.io/...` | No |

### File Uploads

| Variable | Description | Example | Default | Required |
|----------|-------------|---------|---------|----------|
| `FILE_UPLOAD_MAX_MEMORY_SIZE` | Max file upload size in bytes | `5242880` | `5242880` | No |
| `DATA_UPLOAD_MAX_MEMORY_SIZE` | Max data upload size in bytes | `5242880` | `5242880` | No |

## Gunicorn-Specific Variables

These variables configure Gunicorn (optional, have defaults):

| Variable | Description | Example | Default |
|----------|-------------|---------|---------|
| `GUNICORN_BIND` | Address and port to bind | `0.0.0.0:8000` | `0.0.0.0:8000` |
| `GUNICORN_WORKERS` | Number of worker processes | `4` | `(cpu_count * 2) + 1` |
| `GUNICORN_ACCESS_LOG` | Access log file path | `/var/log/gunicorn/access.log` | `-` (stdout) |
| `GUNICORN_ERROR_LOG` | Error log file path | `/var/log/gunicorn/error.log` | `-` (stderr) |
| `GUNICORN_LOG_LEVEL` | Logging level | `info` | `info` |
| `GUNICORN_RELOAD` | Auto-reload on code changes | `False` | `False` |

## Environment-Specific Examples

### Development (.env)

```bash
# Django Settings
DEBUG=True
SECRET_KEY=django-insecure-dev-key-change-in-production
DJANGO_SETTINGS_MODULE=handygh.settings.development
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite - no configuration needed)
# DATABASE_URL is not required for development

# JWT Configuration
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=10080

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5

# Rate Limiting
RATE_LIMIT_OTP_REQUEST=5/hour
RATE_LIMIT_OTP_VERIFY=10/hour

# Commission
DEFAULT_COMMISSION_RATE=0.10

# SMS Provider (Mock for development)
SMS_PROVIDER=mock
SMS_API_KEY=

# CORS (Allow local frontend)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Production (.env)

```bash
# Django Settings
DEBUG=False
SECRET_KEY=your-very-long-random-secret-key-here-change-this
DJANGO_SETTINGS_MODULE=handygh.settings.production
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://handygh_user:secure_password@localhost:5432/handygh_db

# JWT Configuration
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=10080

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5

# Rate Limiting
RATE_LIMIT_OTP_REQUEST=5/hour
RATE_LIMIT_OTP_VERIFY=10/hour

# Commission
DEFAULT_COMMISSION_RATE=0.10

# SMS Provider
SMS_PROVIDER=twilio
SMS_API_KEY=your-twilio-api-key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@handygh.com

# Redis
REDIS_URL=redis://:your_redis_password@127.0.0.1:6379/1

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# CSRF
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Admin
ADMIN_URL=secure-admin-path/

# Sentry (Optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# File Uploads
FILE_UPLOAD_MAX_MEMORY_SIZE=5242880
DATA_UPLOAD_MAX_MEMORY_SIZE=5242880
```

### Testing (.env.test)

```bash
# Django Settings
DEBUG=True
SECRET_KEY=test-secret-key
DJANGO_SETTINGS_MODULE=handygh.settings.test
ALLOWED_HOSTS=localhost,127.0.0.1,testserver

# Database (In-memory SQLite)
# No DATABASE_URL needed

# JWT Configuration (Shorter for faster tests)
JWT_ACCESS_TOKEN_LIFETIME=5
JWT_REFRESH_TOKEN_LIFETIME=60

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5

# Rate Limiting (Disabled for tests)
RATE_LIMIT_OTP_REQUEST=1000/hour
RATE_LIMIT_OTP_VERIFY=1000/hour

# Commission
DEFAULT_COMMISSION_RATE=0.10

# SMS Provider (Mock for tests)
SMS_PROVIDER=mock
SMS_API_KEY=

# CORS (Allow all for tests)
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## Generating Secure Values

### SECRET_KEY

```bash
# Generate a new SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Database Password

```bash
# Generate a secure random password
openssl rand -base64 32
```

### Redis Password

```bash
# Generate a secure random password
openssl rand -base64 32
```

## Validation

### Check Required Variables

```bash
# Create validation script
nano /opt/handygh/scripts/validate_env.sh
```

```bash
#!/bin/bash

echo "Validating environment variables..."

REQUIRED_VARS=(
    "SECRET_KEY"
    "DEBUG"
    "DJANGO_SETTINGS_MODULE"
    "ALLOWED_HOSTS"
    "DATABASE_URL"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo "✓ All required variables are set"
    exit 0
else
    echo "✗ Missing required variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi
```

```bash
chmod +x /opt/handygh/scripts/validate_env.sh

# Run validation
source /opt/handygh/.env
/opt/handygh/scripts/validate_env.sh
```

## Security Best Practices

1. **Never commit .env files to version control**
   ```bash
   # Ensure .env is in .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use strong, unique values**
   - SECRET_KEY: At least 50 characters, random
   - Passwords: At least 20 characters, random
   - API keys: Use provider-generated keys

3. **Restrict file permissions**
   ```bash
   chmod 600 /opt/handygh/.env
   chown handygh:handygh /opt/handygh/.env
   ```

4. **Use environment-specific files**
   - `.env` for production
   - `.env.development` for development
   - `.env.test` for testing

5. **Rotate secrets regularly**
   - Change SECRET_KEY annually
   - Rotate database passwords quarterly
   - Update API keys when compromised

6. **Use secret management tools**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault

## Troubleshooting

### Variable Not Loading

```bash
# Check if .env file exists
ls -la /opt/handygh/.env

# Check file permissions
ls -l /opt/handygh/.env

# Check if variable is set
source /opt/handygh/.env
echo $SECRET_KEY

# Check in Django
python manage.py shell
from decouple import config
print(config('SECRET_KEY'))
```

### Wrong Value Being Used

```bash
# Check for multiple .env files
find /opt/handygh -name ".env*"

# Check systemd service EnvironmentFile
cat /etc/systemd/system/handygh.service | grep EnvironmentFile

# Check if variable is overridden in settings
grep -r "SECRET_KEY" /opt/handygh/backend/handygh/settings/
```

### Variable Not Updating

```bash
# Restart application after changing .env
sudo systemctl restart handygh

# Clear any cached values
# (Django doesn't cache env vars, but check your code)
```

## References

- [Django Settings Documentation](https://docs.djangoproject.com/en/4.2/topics/settings/)
- [python-decouple Documentation](https://github.com/henriquebastos/python-decouple)
- [12-Factor App Configuration](https://12factor.net/config)

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
