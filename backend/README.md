# HandyGH Backend API

**HandyGH** is a local services marketplace platform connecting customers with service providers (plumbers, electricians, cleaners, tutors, etc.) in Ghana. This is the Django REST Framework backend API.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Database Setup](#database-setup)
  - [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

HandyGH provides a comprehensive platform for:
- **Customers**: Find, book, and pay for local services
- **Providers**: Offer services, manage bookings, and receive payments
- **Admins**: Moderate users, handle disputes, and manage the platform

## ✨ Features

### Authentication & User Management
- OTP-based authentication (phone number)
- JWT token management (access + refresh tokens)
- Role-based access control (Customer, Provider, Admin)
- User profile management

### Provider Services
- Provider profile creation and verification
- Service catalog management
- Geolocation-based provider search
- Rating and review system

### Booking System
- Service booking with scheduling
- Availability checking and conflict detection
- Booking status management (Requested → Confirmed → In Progress → Completed)
- Booking cancellation and rescheduling

### Payment Processing
- MTN Mobile Money integration
- Commission calculation and management
- Transaction tracking and reconciliation
- Manual payment confirmation fallback

### Communication
- In-app messaging between customers and providers
- Booking-specific chat history

### Dispute Resolution
- Dispute creation with evidence upload
- Admin dispute management workflow
- Resolution tracking

### Admin Dashboard
- User moderation (suspend/activate)
- Platform analytics and reporting
- Data export (CSV)
- Transaction and booking reports

## 🛠 Technology Stack

- **Framework**: Django 5.2.7 + Django REST Framework 3.15.2
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **API Documentation**: drf-yasg (Swagger/OpenAPI)
- **Testing**: pytest + pytest-django
- **Code Quality**: black, flake8, isort
- **WSGI Server**: Gunicorn (production)

## 🚀 Getting Started

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- Virtual environment tool (venv, virtualenv, or conda)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/handygh.git
   cd handygh/backend
   ```

2. **Create and activate virtual environment**
   
   **Windows:**
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
   
   **macOS/Linux:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements/development.txt
   ```

### Environment Configuration

1. **Copy the example environment file**
   ```bash
   copy .env.example .env  # Windows
   cp .env.example .env    # macOS/Linux
   ```

2. **Edit `.env` file with your configuration**
   ```env
   # Django Settings
   DEBUG=True
   SECRET_KEY=your-secret-key-here
   DJANGO_SETTINGS_MODULE=handygh.settings.development
   ALLOWED_HOSTS=localhost,127.0.0.1
   
   # Database (SQLite for development)
   DATABASE_URL=sqlite:///db.sqlite3
   
   # JWT Settings
   JWT_ACCESS_TOKEN_LIFETIME=15  # minutes
   JWT_REFRESH_TOKEN_LIFETIME=10080  # 7 days in minutes
   
   # OTP Settings
   OTP_LENGTH=6
   OTP_EXPIRY_MINUTES=10
   OTP_MAX_ATTEMPTS=5
   
   # Commission
   DEFAULT_COMMISSION_RATE=0.10  # 10%
   
   # SMS Provider (Mock for development)
   SMS_PROVIDER=mock
   ```

### Database Setup

1. **Run migrations**
   ```bash
   python manage.py migrate
   ```

2. **Create an admin/superuser**
   
   **Quick method (development):**
   ```bash
   python create_admin.py
   ```
   
   This creates an admin with:
   - Phone: `+233241234567`
   - Password: `admin123`
   
   **Manual method:**
   ```bash
   python manage.py createsuperuser
   ```
   
   See [ADMIN_ACCESS.md](ADMIN_ACCESS.md) for detailed instructions.

3. **Load initial data (optional)**
   ```bash
   python manage.py loaddata fixtures/service_categories.json
   ```

### Running the Server

**Development server:**
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

**Access the admin panel:**
```
http://localhost:8000/admin/
```

## 📚 API Documentation

### Interactive API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/

### Quick Start Guide

See [QUICK_START_API.md](QUICK_START_API.md) for a step-by-step guide to using the API.

### Full API Documentation

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete endpoint documentation.

### Postman Collection

Import the Postman collection for easy API testing:
```
HandyGH_API.postman_collection.json
```

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/otp/request/` - Request OTP
- `POST /api/v1/auth/otp/verify/` - Verify OTP and get tokens
- `POST /api/v1/auth/token/refresh/` - Refresh access token
- `POST /api/v1/auth/logout/` - Logout

#### Providers
- `GET /api/v1/providers/` - Search providers
- `POST /api/v1/providers/` - Create provider profile
- `GET /api/v1/providers/{id}/` - Get provider details

#### Bookings
- `POST /api/v1/bookings/` - Create booking
- `GET /api/v1/bookings/` - List bookings
- `PATCH /api/v1/bookings/{id}/accept/` - Accept booking

#### Payments
- `POST /api/v1/payments/momo/charge/` - Initiate payment
- `GET /api/v1/payments/transactions/` - List transactions

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

# API tests only
pytest -m api
```

### Run Tests with Coverage
```bash
pytest --cov=apps --cov=core --cov-report=html
```

View coverage report: `htmlcov/index.html`

### Run Specific Test File
```bash
pytest tests/unit/test_otp_service.py -v
```

### Testing Guidelines

See [TESTING_AND_QUALITY.md](TESTING_AND_QUALITY.md) for comprehensive testing guidelines.

## 📁 Project Structure

```
backend/
├── handygh/                    # Main project directory
│   ├── settings/              # Settings for different environments
│   │   ├── base.py           # Base settings
│   │   ├── development.py    # Development settings
│   │   ├── production.py     # Production settings
│   │   └── test.py           # Test settings
│   ├── urls.py               # Root URL configuration
│   ├── wsgi.py               # WSGI configuration
│   └── asgi.py               # ASGI configuration
│
├── apps/                      # Django applications
│   ├── authentication/       # Auth & OTP management
│   ├── users/                # User profiles
│   ├── providers/            # Provider profiles & services
│   ├── bookings/             # Booking management
│   ├── payments/             # Payment processing
│   ├── reviews/              # Reviews & ratings
│   ├── messaging/            # In-app messaging
│   ├── disputes/             # Dispute management
│   └── admin_dashboard/      # Admin operations
│
├── core/                      # Shared utilities
│   ├── permissions.py        # Custom permissions
│   ├── exceptions.py         # Custom exceptions
│   ├── validators.py         # Custom validators
│   ├── utils.py              # Utility functions
│   └── middleware.py         # Custom middleware
│
├── tests/                     # Test suite
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   ├── api/                  # API endpoint tests
│   └── conftest.py           # Pytest fixtures
│
├── requirements/              # Dependencies
│   ├── base.txt              # Base dependencies
│   ├── development.txt       # Development dependencies
│   └── production.txt        # Production dependencies
│
├── deployment/                # Deployment configurations
│   ├── nginx.conf            # Nginx configuration
│   ├── gunicorn_config.py    # Gunicorn configuration
│   └── handygh.service       # Systemd service file
│
├── manage.py                  # Django management script
├── pytest.ini                 # Pytest configuration
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 💻 Development Workflow

### Code Quality Tools

The project uses several code quality tools:

```bash
# Format code with black
black .

# Sort imports with isort
isort .

# Lint with flake8
flake8 .

# Run all quality checks
make quality
```

### Pre-commit Hooks

Install pre-commit hooks to automatically check code quality:

```bash
pre-commit install
```

See [CODE_QUALITY.md](CODE_QUALITY.md) for detailed code quality guidelines.

### Making Changes

1. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and write tests

3. Run tests and quality checks
   ```bash
   pytest
   make quality
   ```

4. Commit your changes
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

5. Push and create a pull request
   ```bash
   git push origin feature/your-feature-name
   ```

## 🚢 Deployment

### Production Deployment

See [deployment/DEPLOYMENT_GUIDE.md](deployment/DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions.

### Quick Deployment Steps

1. **Set up production environment**
   ```bash
   export DJANGO_SETTINGS_MODULE=handygh.settings.production
   ```

2. **Install production dependencies**
   ```bash
   pip install -r requirements/production.txt
   ```

3. **Configure environment variables**
   - Set `DEBUG=False`
   - Configure PostgreSQL database
   - Set secure `SECRET_KEY`
   - Configure `ALLOWED_HOSTS`

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Collect static files**
   ```bash
   python manage.py collectstatic --noinput
   ```

6. **Start Gunicorn**
   ```bash
   gunicorn handygh.wsgi:application -c gunicorn_config.py
   ```

### Environment Variables

See [deployment/ENVIRONMENT_VARIABLES.md](deployment/ENVIRONMENT_VARIABLES.md) for all environment variables.

## 🔧 Troubleshooting

### Common Issues

#### Database Migrations
```bash
# Reset migrations (development only)
python manage.py migrate --fake-initial

# Create new migration
python manage.py makemigrations

# Show migration status
python manage.py showmigrations
```

#### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

#### Import Errors
```bash
# Reinstall dependencies
pip install -r requirements/development.txt --force-reinstall
```

#### Database Locked (SQLite)
```bash
# Close all connections and restart server
python manage.py migrate --run-syncdb
```

See [deployment/TROUBLESHOOTING.md](deployment/TROUBLESHOOTING.md) for more troubleshooting tips.

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Ensure all tests pass
5. Follow code quality standards
6. Submit a pull request

### Code Style

- Follow PEP 8 guidelines
- Use type hints where appropriate
- Write docstrings for all functions and classes
- Keep functions small and focused
- Write meaningful commit messages

### Testing Requirements

- All new features must have tests
- Maintain minimum 70% code coverage
- All tests must pass before merging

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Email: support@handygh.com
- Documentation: [Full Documentation](API_DOCUMENTATION.md)
- Issues: [GitHub Issues](https://github.com/yourusername/handygh/issues)

## 🙏 Acknowledgments

- Django and Django REST Framework communities
- All contributors to this project
- Open source libraries used in this project

---

**Built with ❤️ for the Ghanaian local services community**
