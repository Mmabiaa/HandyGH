tend - Future)               │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/REST API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Django REST Framework                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Layer (ViewSets/Views)              │  │
│  └──────────────────────┬───────────────────────────────┘  │
│  ┌──────────────────────▼───────────────────────────────┐  │
│  │         Business Logic Layer (Services)              │  │
│  └──────────────────────┬───────────────────────────────┘  │
│  ┌──────────────────────▼───────────────────────────────┐  │
│  │            Data Access Layer (Models/ORM)            │  │
│  └──────────────────────┬───────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   SQLite Database    │
              │  (Dev: db.sqlite3)   │
              │ (Prod: PostgreSQL)   │
              └──────────────────────┘
```

### Django Project Structure

```
backend/
├── handygh/                    # Main project directory
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py            # Base settings
│   │   ├── development.py     # Dev settings (SQLite)
│   │   ├── production.py      # Prod settings (PostgreSQL)
│   │   └── test.py            # Test settings
│   ├── urls.py                # Root URL configuration
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── authentication/        # Auth & OTP management
│   ├── users/                 # User profiles
│   ├── providers/             # Provider profiles & services
│   ├── bookings/              # Booking management
│   ├── payments/              # Payment processing
│   ├── reviews/               # Reviews & ratings
│   ├── messaging/             # In-app messaging
│   ├── disputes/              # Dispute management
│   └── admin_dashboard/       # Admin operations
├── core/
│   ├── __init__.py
│   ├── permissions.py         # Custom permissions
│   ├── pagination.py          # Custom pagination
│   ├── exceptions.py          # Custom exceptions
│   ├── validators.py          # Custom validators
│   └── utils.py               # Utility functions
├── manage.py
├── requirements/
│   ├── base.txt
│   ├── development.txt
│   └── production.txt
├── pytest.ini
└── README.md
```

## Components and Interfaces

### 1. Authentication App

**Purpose**: Handle OTP-based authentication, JWT token management, and user sessions.

**Models**:
- `OTPToken`: Store OTP codes with expiration
- `RefreshToken`: Store refresh tokens for JWT

**Key Services**:
- `OTPService`: Generate, validate, and manage OTP lifecycle
- `JWTService`: Issue, refresh, and revoke JWT tokens
- `RateLimitService`: Track and enforce rate limits

**API Endpoints**:
- `POST /api/v1/auth/otp/request/` - Request OTP
- `POST /api/v1/auth/otp/verify/` - Verify OTP and issue tokens
- `POST /api/v1/auth/token/refresh/` - Refresh access token
- `POST /api/v1/auth/logout/` - Revoke refresh token

**Key Classes**:
```python
class OTPService:
    def generate_otp(phone: str) -> str
    def verify_otp(phone: str, otp: str) -> bool
    def check_rate_limit(phone: str) -> bool
    
class JWTService:
    def create_tokens(user: User) -> dict
    def refresh_tokens(refresh_token: str) -> dict
    def revoke_token(refresh_token: str) -> bool
```

### 2. Users App

**Purpose**: Manage user profiles for customers, providers, and admins.

**Models**:
- `User` (extends AbstractBaseUser): Core user model with role field
- `UserProfile`: Extended profile information

**Key Services**:
- `UserService`: CRUD operations for users
- `ProfileService`: Profile management

**API Endpoints**:
- `GET /api/v1/users/me/` - Get current user profile
- `PATCH /api/v1/users/me/` - Update current user profile
- `GET /api/v1/users/{id}/` - Get user by ID (admin only)
- `POST /api/v1/users/` - Create user (admin only)

### 3. Providers App

**Purpose**: Manage provider profiles, services, and search functionality.

**Models**:
- `Provider`: Provider business information
- `ProviderService`: Services offered by providers
- `ServiceCategory`: Service categories

**Key Services**:
- `ProviderService`: Provider CRUD and verification
- `ServiceManagementService`: Service CRUD operations
- `ProviderSearchService`: Search and filter providers

**API Endpoints**:
- `POST /api/v1/providers/` - Create provider profile
- `GET /api/v1/providers/` - Search providers (with filters)
- `GET /api/v1/providers/{id}/` - Get provider details
- `PATCH /api/v1/providers/{id}/` - Update provider
- `POST /api/v1/providers/{id}/services/` - Add service
- `GET /api/v1/providers/{id}/services/` - List provider services

**Search Algorithm**:
```python
class ProviderSearchService:
    def search(
        category: str = None,
        latitude: float = None,
        longitude: float = None,
        radius_km: float = 5,
        min_rating: float = None,
        verified_only: bool = False
    ) -> QuerySet[Provider]
```

### 4. Bookings App

**Purpose**: Handle booking creation, status management, and scheduling.

**Models**:
- `Booking`: Core booking information
- `BookingStatusHistory`: Track status changes

**Key Services**:
- `BookingService`: Booking CRUD and validation
- `AvailabilityService`: Check provider availability
- `BookingStateMachine`: Manage status transitions

**API Endpoints**:
- `POST /api/v1/bookings/` - Create booking
- `GET /api/v1/bookings/` - List bookings (filtered by user role)
- `GET /api/v1/bookings/{id}/` - Get booking details
- `PATCH /api/v1/bookings/{id}/accept/` - Provider accepts
- `PATCH /api/v1/bookings/{id}/decline/` - Provider declines
- `PATCH /api/v1/bookings/{id}/status/` - Update status

**Conflict Detection Algorithm**:
```python
class AvailabilityService:
    def check_availability(
        provider_id: UUID,
        start_time: datetime,
        end_time: datetime
    ) -> bool:
        # Check for overlapping bookings
        # Return True if available, False otherwise
```

### 5. Payments App

**Purpose**: Process payments, manage transactions, and calculate commissions.

**Models**:
- `Transaction`: Payment transaction records
- `Commission`: Commission configuration

**Key Services**:
- `PaymentService`: Initiate and process payments
- `MoMoService`: MTN Mobile Money integration
- `CommissionService`: Calculate platform commission

**API Endpoints**:
- `POST /api/v1/payments/momo/charge/` - Initiate MoMo payment
- `POST /api/v1/payments/webhook/momo/` - MoMo webhook handler
- `POST /api/v1/payments/manual/confirm/` - Manual payment confirmation
- `GET /api/v1/payments/transactions/` - List transactions

**Commission Calculation**:
```python
class CommissionService:
    def calculate_commission(
        booking_amount: Decimal,
        commission_rate: Decimal = 0.10
    ) -> Decimal:
        return booking_amount * commission_rate
```

### 6. Reviews App

**Purpose**: Manage customer reviews and provider ratings.

**Models**:
- `Review`: Customer reviews with ratings

**Key Services**:
- `ReviewService`: Create and manage reviews
- `RatingAggregationService`: Calculate provider ratings

**API Endpoints**:
- `POST /api/v1/bookings/{id}/reviews/` - Submit review
- `GET /api/v1/providers/{id}/reviews/` - Get provider reviews
- `GET /api/v1/reviews/{id}/` - Get review details

**Rating Aggregation**:
```python
class RatingAggregationService:
    def update_provider_rating(provider_id: UUID) -> None:
        # Calculate average rating
        # Update provider.rating_avg and provider.rating_count
```

### 7. Messaging App

**Purpose**: Enable in-app communication between customers and providers.

**Models**:
- `Message`: Chat messages tied to bookings

**Key Services**:
- `MessagingService`: Send and retrieve messages

**API Endpoints**:
- `POST /api/v1/bookings/{id}/messages/` - Send message
- `GET /api/v1/bookings/{id}/messages/` - Get messages

### 8. Disputes App

**Purpose**: Handle dispute creation and resolution.

**Models**:
- `Dispute`: Dispute records with evidence

**Key Services**:
- `DisputeService`: Create and manage disputes
- `DisputeResolutionService`: Admin dispute resolution

**API Endpoints**:
- `POST /api/v1/disputes/` - Create dispute
- `GET /api/v1/disputes/` - List disputes
- `PATCH /api/v1/disputes/{id}/` - Update dispute (admin)
- `POST /api/v1/disputes/{id}/resolve/` - Resolve dispute (admin)

### 9. Admin Dashboard App

**Purpose**: Provide admin operations and reporting.

**Key Services**:
- `AdminReportService`: Generate reports and analytics
- `UserModerationService`: Suspend/activate users
- `DataExportService`: Export data to CSV

**API Endpoints**:
- `GET /api/v1/admin/dashboard/stats/` - Dashboard statistics
- `GET /api/v1/admin/users/` - List all users
- `PATCH /api/v1/admin/users/{id}/suspend/` - Suspend user
- `GET /api/v1/admin/reports/transactions/` - Transaction report
- `GET /api/v1/admin/reports/bookings/` - Booking report
- `GET /api/v1/admin/export/csv/` - Export data

## Data Models

### Core Models Schema

#### User Model
```python
class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    phone = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    name = models.CharField(max_length=255, blank=True)
    role = models.CharField(
        max_length=20,
        choices=[
            ('CUSTOMER', 'Customer'),
            ('PROVIDER', 'Provider'),
            ('ADMIN', 'Admin')
        ],
        default='CUSTOMER'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### Provider Model
```python
class Provider(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    business_name = models.CharField(max_length=255, blank=True)
    categories = models.JSONField(default=list)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True)
    address = models.TextField(blank=True)
    verified = models.BooleanField(default=False)
    verification_doc_url = models.URLField(blank=True)
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    rating_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### Booking Model
```python
class Booking(models.Model):
    STATUS_CHOICES = [
        ('REQUESTED', 'Requested'),
        ('CONFIRMED', 'Confirmed'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('DISPUTED', 'Disputed')
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    booking_ref = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='customer_bookings')
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE)
    provider_service = models.ForeignKey('providers.ProviderService', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REQUESTED')
    scheduled_start = models.DateTimeField()
    scheduled_end = models.DateTimeField(null=True)
    address = models.TextField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    payment_status = models.CharField(max_length=20, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Database Indexes

```python
class Meta:
    indexes = [
        models.Index(fields=['phone']),
        models.Index(fields=['email']),
        models.Index(fields=['role']),
        models.Index(fields=['is_active']),
        models.Index(fields=['status']),
        models.Index(fields=['scheduled_start']),
        models.Index(fields=['created_at']),
        models.Index(fields=['booking_ref']),
    ]
```

## Error Handling

### Custom Exception Classes

```python
class HandyGHException(Exception):
    """Base exception for HandyGH"""
    default_message = "An error occurred"
    status_code = 500
    
class ValidationError(HandyGHException):
    status_code = 400
    
class AuthenticationError(HandyGHException):
    status_code = 401
    
class PermissionDeniedError(HandyGHException):
    status_code = 403
    
class NotFoundError(HandyGHException):
    status_code = 404
    
class RateLimitError(HandyGHException):
    status_code = 429
```

### Error Response Format

```json
{
    "success": false,
    "errors": {
        "field_name": ["Error message 1", "Error message 2"],
        "non_field_errors": ["General error message"]
    },
    "meta": {
        "timestamp": "2025-01-15T10:30:00Z",
        "request_id": "uuid"
    }
}
```

## Testing Strategy

### Test Structure

```
tests/
├── unit/
│   ├── test_auth_service.py
│   ├── test_booking_service.py
│   ├── test_payment_service.py
│   └── test_rating_service.py
├── integration/
│   ├── test_booking_flow.py
│   ├── test_payment_flow.py
│   └── test_review_flow.py
├── api/
│   ├── test_auth_endpoints.py
│   ├── test_booking_endpoints.py
│   └── test_provider_endpoints.py
└── fixtures/
    ├── users.json
    ├── providers.json
    └── bookings.json
```

### Test Coverage Goals

- Unit tests: ≥80% coverage for services and business logic
- Integration tests: All critical user flows
- API tests: All endpoints with success and error cases
- Performance tests: Key endpoints under load

### Testing Tools

- **pytest**: Test framework
- **pytest-django**: Django integration
- **factory_boy**: Test data factories
- **faker**: Generate realistic test data
- **coverage.py**: Code coverage reporting

## Security Design

### Authentication Flow

1. User requests OTP via phone number
2. System generates 6-digit OTP, stores hashed version with 10-min expiration
3. User submits OTP for verification
4. System validates OTP and issues JWT access token (15min) + refresh token (7 days)
5. Refresh token stored hashed in database
6. Access token used for API authentication
7. Refresh token used to obtain new access token

### Authorization

**Permission Classes**:
- `IsAuthenticated`: Require valid JWT
- `IsCustomer`: User role must be CUSTOMER
- `IsProvider`: User role must be PROVIDER
- `IsAdmin`: User role must be ADMIN
- `IsOwnerOrAdmin`: User owns resource or is admin

### Rate Limiting

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'otp_request': '5/hour',
        'otp_verify': '10/hour'
    }
}
```

### Data Protection

- Passwords hashed with bcrypt (12 rounds minimum)
- OTP codes hashed before storage
- Refresh tokens hashed before storage
- Sensitive fields encrypted at rest (future: django-encrypted-model-fields)
- All API communication over HTTPS in production

## API Documentation

### OpenAPI/Swagger Integration

```python
# settings.py
INSTALLED_APPS = [
    ...
    'drf_yasg',  # Swagger/OpenAPI
]

# urls.py
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="HandyGH API",
        default_version='v1',
        description="Local Services Marketplace API",
    ),
    public=True,
)

urlpatterns = [
    path('api/docs/', schema_view.with_ui('swagger')),
    path('api/redoc/', schema_view.with_ui('redoc')),
]
```

## Configuration Management

### Environment Variables

```python
# .env.example
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=15  # minutes
JWT_REFRESH_TOKEN_LIFETIME=10080  # 7 days in minutes

# OTP Settings
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5

# Rate Limiting
RATE_LIMIT_OTP_REQUEST=5  # per hour
RATE_LIMIT_OTP_VERIFY=10  # per hour

# Commission
DEFAULT_COMMISSION_RATE=0.10  # 10%

# SMS Provider (Mock for development)
SMS_PROVIDER=mock
SMS_API_KEY=
```

### Settings Structure

- `base.py`: Common settings
- `development.py`: SQLite, DEBUG=True, mock services
- `production.py`: PostgreSQL, DEBUG=False, real services
- `test.py`: In-memory SQLite, fast test execution

## Deployment Considerations

### Database Migration Strategy

1. Use Django migrations for all schema changes
2. Test migrations on staging before production
3. Backup database before running migrations
4. Keep migrations backward compatible when possible

### Static Files & Media

```python
# settings/production.py
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Future: Use S3 for media files
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
```

### WSGI/ASGI Configuration

- Development: Django development server
- Production: Gunicorn (WSGI) or Uvicorn (ASGI)
- Web server: Nginx as reverse proxy

## Performance Optimization

### Database Query Optimization

- Use `select_related()` for foreign keys
- Use `prefetch_related()` for many-to-many and reverse foreign keys
- Add database indexes on frequently queried fields
- Use `only()` and `defer()` to limit fields fetched

### Caching Strategy (Future Enhancement)

```python
# Cache provider search results
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
```

### Pagination

```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}
```

## Monitoring and Logging

### Logging Configuration

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'logs/handygh.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
        },
        'apps': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
        },
    },
}
```

## Development Workflow

### Git Workflow

1. Create feature branch from `develop`
2. Implement feature with tests
3. Run tests and linting locally
4. Create pull request to `develop`
5. Code review and CI checks
6. Merge to `develop`
7. Deploy to staging
8. Merge to `main` for production

### Code Quality Tools

- **black**: Code formatting
- **flake8**: Linting
- **isort**: Import sorting
- **mypy**: Type checking
- **pylint**: Additional linting

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.1.0
    hooks:
      - id: black
  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort
```

## Migration from Node.js Considerations

### API Compatibility

- Maintain same endpoint URLs and request/response formats
- Use same JWT token format for seamless transition
- Keep same database schema (with Django ORM equivalents)

### Data Migration

If migrating from existing Node.js backend:
1. Export data from PostgreSQL
2. Transform data if needed
3. Import into Django using management commands
4. Verify data integrity

## Future Enhancements

1. **Real-time Features**: Django Channels for WebSocket support
2. **Celery Integration**: Background task processing
3. **Redis Caching**: Performance optimization
4. **Elasticsearch**: Advanced search capabilities
5. **GraphQL API**: Alternative to REST
6. **Multi-tenancy**: Support for multiple regions
7. **API Versioning**: v2 endpoints with new features
