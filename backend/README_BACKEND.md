# HandyGH Backend - Django REST API

A production-ready Django REST Framework backend for HandyGH, a local services marketplace platform connecting customers with service providers in Ghana.

## 🚀 Features

- **OTP-based Authentication**: Phone number authentication with JWT tokens
- **User Management**: Customer, Provider, and Admin roles
- **Provider Services**: Service listing and management
- **Booking System**: Complete booking workflow with status tracking
- **Payment Processing**: MTN MoMo integration (mock for development)
- **Reviews & Ratings**: Customer feedback system
- **In-app Messaging**: Communication between customers and providers
- **Dispute Management**: Resolution workflow for issues
- **Admin Dashboard**: Comprehensive admin operations
- **API Documentation**: Auto-generated Swagger/OpenAPI docs

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

## 🛠️ Quick Start

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Run Setup Script

```bash
python setup.py
```

This will:
- Install all dependencies
- Create `.env` file from template
- Run database migrations
- Prompt to create superuser

### 4. Start Development Server

```bash
python manage.py runserver
```

The API will be available at:
- **API Base**: http://localhost:8000/api/v1/
- **API Docs**: http://localhost:8000/api/docs/
- **Admin Panel**: http://localhost:8000/admin/
- **Health Check**: http://localhost:8000/health/

## 📚 API Documentation

### Authentication Endpoints

#### Request OTP
```http
POST /api/v1/auth/otp/request/
Content-Type: application/json

{
  "phone": "+233241234567"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "message": "OTP sent successfully",
    "expires_in_minutes": 10
  }
}
```

#### Verify OTP
```http
POST /api/v1/auth/otp/verify/
Content-Type: application/json

{
  "phone": "+233241234567",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": "uuid",
      "phone": "+233241234567",
      "name": "John Doe",
      "role": "CUSTOMER"
    }
  }
}
```

#### Refresh Token
```http
POST /api/v1/auth/token/refresh/
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Logout
```http
POST /api/v1/auth/logout/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Using the API

All authenticated endpoints require the `Authorization` header:

```http
Authorization: Bearer {access_token}
```

## 🧪 Testing

### Run All Tests

```bash
pytest
```

### Run Specific Test Types

```bash
# Unit tests only
pytest -m unit

# Integration tests only
pytest -m integration

# With coverage report
pytest --cov=apps --cov=core --cov-report=html
```

### Test Coverage

View coverage report:
```bash
# Open htmlcov/index.html in browser
```

## 🗄️ Database

### SQLite (Development)

The default development setup uses SQLite. The database file is created at `db.sqlite3`.

### PostgreSQL (Production)

Update `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/handygh_db
```

### Migrations

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migrations
python manage.py showmigrations
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and update:

```env
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
DJANGO_SETTINGS_MODULE=handygh.settings.development

# Database (Production)
DATABASE_URL=postgresql://user:password@localhost:5432/handygh_db

# JWT Configuration
JWT_ACCESS_TOKEN_LIFETIME=15  # minutes
JWT_REFRESH_TOKEN_LIFETIME=10080  # 7 days

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5

# Rate Limiting
RATE_LIMIT_OTP_REQUEST=5/hour
RATE_LIMIT_OTP_VERIFY=10/hour

# SMS Provider
SMS_PROVIDER=mock  # Options: mock, twilio
```

## 📁 Project Structure

```
backend/
├── handygh/                    # Main project
│   ├── settings/              # Environment-specific settings
│   │   ├── base.py           # Common settings
│   │   ├── development.py    # Dev settings
│   │   ├── production.py     # Prod settings
│   │   └── test.py           # Test settings
│   ├── urls.py               # URL routing
│   ├── wsgi.py               # WSGI config
│   └── asgi.py               # ASGI config
├── apps/                      # Django applications
│   ├── authentication/       # OTP & JWT auth
│   ├── users/                # User management
│   ├── providers/            # Provider services
│   ├── bookings/             # Booking system
│   ├── payments/             # Payment processing
│   ├── reviews/              # Reviews & ratings
│   ├── messaging/            # In-app messaging
│   ├── disputes/             # Dispute management
│   └── admin_dashboard/      # Admin operations
├── core/                      # Shared utilities
│   ├── exceptions.py         # Custom exceptions
│   ├── permissions.py        # Permission classes
│   ├── middleware.py         # Custom middleware
│   ├── validators.py         # Validators
│   ├── utils.py              # Utility functions
│   └── pagination.py         # Pagination classes
├── tests/                     # Test files
├── requirements/              # Dependencies
│   ├── base.txt
│   ├── development.txt
│   └── production.txt
├── manage.py
├── setup.py
└── pytest.ini
```

## 🔐 Security

### Best Practices Implemented

- ✅ OTP codes hashed before storage (SHA-256)
- ✅ JWT tokens with short expiration (15 minutes)
- ✅ Refresh token rotation on use
- ✅ Rate limiting on authentication endpoints
- ✅ HTTPS enforcement in production
- ✅ CORS configuration
- ✅ SQL injection prevention (ORM)
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Secure password hashing (bcrypt)

### Rate Limits

- OTP Request: 5 per hour per phone
- OTP Verify: 10 per hour per phone
- API Requests: 1000 per hour per user

## 🚀 Deployment

### Production Checklist

- [ ] Update `SECRET_KEY` in production
- [ ] Set `DEBUG=False`
- [ ] Configure PostgreSQL database
- [ ] Set up Redis for caching
- [ ] Configure real SMS provider (Twilio)
- [ ] Set up HTTPS/SSL
- [ ] Configure ALLOWED_HOSTS
- [ ] Set up static file serving
- [ ] Configure email backend
- [ ] Set up monitoring (Sentry)
- [ ] Configure backups
- [ ] Set up CI/CD pipeline

### Using Gunicorn

```bash
gunicorn handygh.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:8000/health/
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "database": "connected",
  "version": "1.0.0"
}
```

### Logs

Logs are stored in `logs/handygh.log` with rotation (10MB max, 5 backups).

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Run tests and linting
5. Submit pull request

### Code Quality

```bash
# Format code
black .

# Sort imports
isort .

# Lint code
flake8

# Type checking
mypy apps core
```

## 📝 License

Proprietary - HandyGH Team

## 🆘 Support

For issues and questions:
- Email: support@handygh.com
- Documentation: http://localhost:8000/api/docs/

## 🎯 Next Steps

1. ✅ Authentication system (Complete)
2. ✅ User management (Complete)
3. 🔄 Provider system (In Progress)
4. ⏳ Booking system
5. ⏳ Payment integration
6. ⏳ Reviews & ratings
7. ⏳ Messaging system
8. ⏳ Dispute management
9. ⏳ Admin dashboard

---

**Built with ❤️ for Ghana's service marketplace**
