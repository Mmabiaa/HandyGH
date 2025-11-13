# Developer Onboarding Guide

Welcome to the HandyGH backend development team! This guide will help you get up to speed with the project architecture, development practices, and contribution workflow.

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Design Decisions](#architecture--design-decisions)
3. [Development Environment Setup](#development-environment-setup)
4. [Project Structure Deep Dive](#project-structure-deep-dive)
5. [Code Style Guidelines](#code-style-guidelines)
6. [Testing Guidelines](#testing-guidelines)
7. [Common Development Tasks](#common-development-tasks)
8. [Contribution Workflow](#contribution-workflow)
9. [Best Practices](#best-practices)
10. [Resources & Learning](#resources--learning)

## 🎯 Project Overview

### What is HandyGH?

HandyGH is a local services marketplace platform that connects customers with service providers in Ghana. Think of it as a platform where:
- Customers can find and book local services (plumbers, electricians, cleaners, etc.)
- Service providers can offer their services and manage bookings
- Admins can moderate the platform and handle disputes

### Key Business Flows

1. **Customer Flow**: Signup → Search Providers → Book Service → Make Payment → Leave Review
2. **Provider Flow**: Signup → Create Profile → Add Services → Accept Bookings → Complete Service
3. **Admin Flow**: Monitor Platform → Moderate Users → Resolve Disputes → Generate Reports

### Technology Choices

**Why Django REST Framework?**
- Rapid development with batteries-included approach
- Excellent ORM for complex data relationships
- Built-in admin interface for quick data management
- Strong security features out of the box
- Large ecosystem and community support

**Why JWT Authentication?**
- Stateless authentication suitable for mobile apps
- Easy to scale horizontally
- Industry standard for API authentication

**Why SQLite for Development?**
- Zero configuration required
- Fast for development and testing
- Easy to reset and recreate
- Production uses PostgreSQL for better performance and features

## 🏗 Architecture & Design Decisions

### Layered Architecture

The project follows a clean layered architecture:

```
┌─────────────────────────────────────┐
│         API Layer (Views)           │  ← HTTP Request/Response
├─────────────────────────────────────┤
│    Business Logic (Services)        │  ← Core business rules
├─────────────────────────────────────┤
│    Data Access (Models/ORM)         │  ← Database operations
├─────────────────────────────────────┤
│           Database                  │  ← Data persistence
└─────────────────────────────────────┘
```

**Why this architecture?**
- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Business logic can be tested independently
- **Maintainability**: Changes in one layer don't affect others
- **Reusability**: Services can be used by multiple views

### Key Design Patterns

#### 1. Service Layer Pattern

Business logic is encapsulated in service classes:

```python
# apps/bookings/services.py
class BookingService:
    @staticmethod
    def create_booking(customer, provider_service, scheduled_start, ...):
        # Validate availability
        # Check conflicts
        # Create booking
        # Send notifications
        return booking
```

**Benefits:**
- Keeps views thin and focused on HTTP concerns
- Makes business logic reusable
- Easier to test without HTTP layer
- Clear separation between API and business logic

#### 2. Repository Pattern (via Django ORM)

Django's ORM acts as a repository pattern:

```python
# Instead of raw SQL
Booking.objects.filter(customer=customer, status='CONFIRMED')

# Complex queries with relationships
Provider.objects.select_related('user').prefetch_related('services')
```

#### 3. State Machine Pattern

Booking status transitions are managed with clear rules:

```python
# apps/bookings/services.py
class BookingStateMachine:
    ALLOWED_TRANSITIONS = {
        'REQUESTED': ['CONFIRMED', 'CANCELLED'],
        'CONFIRMED': ['IN_PROGRESS', 'CANCELLED'],
        'IN_PROGRESS': ['COMPLETED', 'DISPUTED'],
        # ...
    }
```

**Why?**
- Prevents invalid state transitions
- Makes business rules explicit
- Easy to audit and debug
- Reduces bugs from invalid states

### App Organization

Each Django app represents a bounded context:

- **authentication**: User authentication and session management
- **users**: User profile management
- **providers**: Provider-specific functionality
- **bookings**: Booking lifecycle management
- **payments**: Payment processing and transactions
- **reviews**: Rating and review system
- **messaging**: In-app communication
- **disputes**: Dispute resolution workflow
- **admin_dashboard**: Admin operations and reporting

**Why separate apps?**
- Clear boundaries between features
- Easier to understand and navigate
- Can be developed independently
- Potential to extract as microservices later

### Database Design Decisions

#### UUID Primary Keys

```python
id = models.UUIDField(primary_key=True, default=uuid.uuid4)
```

**Why UUIDs instead of auto-incrementing integers?**
- No sequential ID enumeration attacks
- Can generate IDs client-side if needed
- Easier to merge databases
- Better for distributed systems

#### Soft Deletes (where appropriate)

```python
is_active = models.BooleanField(default=True)
```

**Why soft deletes?**
- Preserve data for auditing
- Can restore accidentally deleted records
- Maintain referential integrity
- Required for compliance in some cases

#### Denormalization for Performance

```python
# Provider model stores aggregated rating
rating_avg = models.DecimalField(max_digits=3, decimal_places=2)
rating_count = models.IntegerField(default=0)
```

**Why denormalize?**
- Avoid expensive aggregation queries on every request
- Faster provider search and listing
- Trade-off: Need to keep in sync (handled by RatingAggregationService)

## 💻 Development Environment Setup

### Step-by-Step Setup

#### 1. Install Python

Ensure you have Python 3.10 or higher:
```bash
python --version
```

#### 2. Clone and Navigate

```bash
git clone https://github.com/yourusername/handygh.git
cd handygh/backend
```

#### 3. Create Virtual Environment

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

**Why virtual environments?**
- Isolate project dependencies
- Avoid conflicts with system Python
- Easy to recreate and share

#### 4. Install Dependencies

```bash
pip install -r requirements/development.txt
```

**Development dependencies include:**
- Django and DRF (core framework)
- pytest and coverage (testing)
- black, flake8, isort (code quality)
- faker, factory_boy (test data generation)

#### 5. Configure Environment

```bash
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux
```

Edit `.env` with your settings (defaults work for development).

#### 6. Set Up Database

```bash
python manage.py migrate
python manage.py createsuperuser  # Optional
```

#### 7. Run Development Server

```bash
python manage.py runserver
```

Visit http://localhost:8000/api/docs/ to see the API documentation.

### IDE Setup

#### VS Code (Recommended)

Install these extensions:
- Python (Microsoft)
- Pylance (Microsoft)
- Django (Baptiste Darthenay)
- Python Test Explorer
- GitLens

**Workspace settings** (`.vscode/settings.json`):
```json
{
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "python.testing.pytestEnabled": true,
  "python.testing.unittestEnabled": false,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

#### PyCharm

1. Open project in PyCharm
2. Configure Python interpreter (point to venv)
3. Enable Django support: Settings → Languages & Frameworks → Django
4. Set Django project root and settings module

## 📂 Project Structure Deep Dive

### App Structure

Each app follows this structure:

```
apps/bookings/
├── __init__.py
├── admin.py           # Django admin configuration
├── apps.py            # App configuration
├── models.py          # Database models
├── serializers.py     # DRF serializers (API input/output)
├── services.py        # Business logic
├── views.py           # API views (ViewSets/APIViews)
├── urls.py            # URL routing
└── migrations/        # Database migrations
```

### Core Module

Shared utilities used across apps:

```
core/
├── exceptions.py      # Custom exception classes
├── permissions.py     # Custom DRF permissions
├── validators.py      # Custom field validators
├── utils.py           # Utility functions
├── middleware.py      # Custom middleware
└── pagination.py      # Custom pagination classes
```

### Tests Structure

```
tests/
├── unit/              # Unit tests (test individual functions/classes)
├── integration/       # Integration tests (test multiple components)
├── api/               # API endpoint tests (test HTTP layer)
└── conftest.py        # Shared pytest fixtures
```

**Test organization principles:**
- One test file per module being tested
- Test file names match source file names with `test_` prefix
- Group related tests in classes
- Use descriptive test names

## 🎨 Code Style Guidelines

### Python Style (PEP 8)

We follow PEP 8 with some modifications:

```python
# Good: Clear, descriptive names
def calculate_booking_commission(booking_amount: Decimal) -> Decimal:
    """Calculate platform commission for a booking."""
    commission_rate = Decimal('0.10')
    return booking_amount * commission_rate

# Bad: Unclear names, no types
def calc(amt):
    return amt * 0.1
```

### Naming Conventions

**Variables and Functions:**
```python
# Use snake_case
user_profile = get_user_profile(user_id)
total_amount = calculate_total_amount(items)
```

**Classes:**
```python
# Use PascalCase
class BookingService:
    pass

class PaymentProcessor:
    pass
```

**Constants:**
```python
# Use UPPER_SNAKE_CASE
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB
DEFAULT_COMMISSION_RATE = Decimal('0.10')
```

### Type Hints

Always use type hints for function parameters and return values:

```python
from typing import Optional, List
from decimal import Decimal
from django.contrib.auth import get_user_model

User = get_user_model()

def create_booking(
    customer: User,
    provider_service_id: str,
    scheduled_start: datetime,
    address: str,
    notes: Optional[str] = None
) -> Booking:
    """Create a new booking."""
    # Implementation
    pass
```

### Docstrings

Use Google-style docstrings:

```python
def search_providers(
    category: str,
    latitude: float,
    longitude: float,
    radius_km: float = 5.0
) -> QuerySet:
    """
    Search for providers by category and location.
    
    Args:
        category: Service category slug (e.g., 'plumbing')
        latitude: Customer's latitude
        longitude: Customer's longitude
        radius_km: Search radius in kilometers (default: 5.0)
    
    Returns:
        QuerySet of Provider objects matching criteria
    
    Raises:
        ValidationError: If coordinates are invalid
    """
    # Implementation
    pass
```

### Import Organization

Use isort to organize imports:

```python
# Standard library imports
import json
from datetime import datetime, timedelta
from typing import Optional

# Third-party imports
from django.db import models
from rest_framework import serializers

# Local imports
from apps.users.models import User
from core.exceptions import ValidationError
```

### Code Formatting

Use black for automatic formatting:

```bash
black .
```

**Black's rules:**
- Line length: 88 characters (default)
- Double quotes for strings
- Trailing commas in multi-line structures

## 🧪 Testing Guidelines

### Test Structure

Follow the Arrange-Act-Assert pattern:

```python
def test_create_booking_success(customer, provider_service):
    # Arrange
    scheduled_start = timezone.now() + timedelta(days=1)
    scheduled_end = scheduled_start + timedelta(hours=2)
    
    # Act
    booking = BookingService.create_booking(
        customer=customer,
        provider_service=provider_service,
        scheduled_start=scheduled_start,
        scheduled_end=scheduled_end,
        address="123 Test St"
    )
    
    # Assert
    assert booking.status == "REQUESTED"
    assert booking.customer == customer
    assert booking.total_amount > 0
```

### Test Types

#### Unit Tests

Test individual functions/methods in isolation:

```python
# tests/unit/test_commission_service.py
def test_calculate_commission():
    amount = Decimal('100.00')
    rate = Decimal('0.10')
    
    commission = CommissionService.calculate_commission(amount, rate)
    
    assert commission == Decimal('10.00')
```

#### Integration Tests

Test multiple components working together:

```python
# tests/integration/test_booking_flow.py
def test_complete_booking_flow(customer, provider):
    # Create booking
    booking = BookingService.create_booking(...)
    
    # Provider accepts
    BookingStateMachine.accept_booking(booking)
    
    # Process payment
    PaymentService.process_payment(booking)
    
    # Complete booking
    BookingStateMachine.complete_booking(booking)
    
    # Verify final state
    assert booking.status == "COMPLETED"
    assert booking.payment_status == "PAID"
```

#### API Tests

Test HTTP endpoints:

```python
# tests/api/test_booking_endpoints.py
def test_create_booking_endpoint(authenticated_client, provider_service):
    response = authenticated_client.post(
        '/api/v1/bookings/',
        {
            'provider_service_id': str(provider_service.id),
            'scheduled_start': '2025-01-20T10:00:00Z',
            'scheduled_end': '2025-01-20T12:00:00Z',
            'address': '123 Test St'
        }
    )
    
    assert response.status_code == 201
    assert response.data['data']['status'] == 'REQUESTED'
```

### Test Fixtures

Use pytest fixtures for reusable test data:

```python
# tests/conftest.py
@pytest.fixture
def customer(db):
    """Create a customer user."""
    User = get_user_model()
    return User.objects.create(
        phone="+233241234567",
        name="Test Customer",
        role="CUSTOMER"
    )

@pytest.fixture
def provider(db, provider_user):
    """Create a provider profile."""
    return Provider.objects.create(
        user=provider_user,
        business_name="Test Provider",
        categories=["plumbing"],
        verified=True
    )
```

### Running Tests

```bash
# All tests
pytest

# Specific test file
pytest tests/unit/test_booking_service.py

# Specific test
pytest tests/unit/test_booking_service.py::test_create_booking_success

# With coverage
pytest --cov=apps --cov=core

# Verbose output
pytest -v

# Stop on first failure
pytest -x
```

### Test Coverage Goals

- **Overall**: Minimum 70% coverage
- **Business Logic (Services)**: Minimum 80% coverage
- **Critical Paths**: 100% coverage (authentication, payments, bookings)

## 🔧 Common Development Tasks

### Creating a New App

```bash
python manage.py startapp app_name apps/app_name
```

Then:
1. Add to `INSTALLED_APPS` in `settings/base.py`
2. Create `urls.py` in the app
3. Include app URLs in `handygh/urls.py`
4. Create models, serializers, services, views

### Creating a New Model

```python
# apps/your_app/models.py
import uuid
from django.db import models

class YourModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'your_table_name'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return self.name
```

Then create and run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Creating a New API Endpoint

1. **Create Serializer:**
```python
# apps/your_app/serializers.py
class YourModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = YourModel
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']
```

2. **Create Service (if needed):**
```python
# apps/your_app/services.py
class YourService:
    @staticmethod
    def create_item(name: str) -> YourModel:
        return YourModel.objects.create(name=name)
```

3. **Create View:**
```python
# apps/your_app/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

class YourModelViewSet(viewsets.ModelViewSet):
    queryset = YourModel.objects.all()
    serializer_class = YourModelSerializer
    permission_classes = [IsAuthenticated]
```

4. **Add URL:**
```python
# apps/your_app/urls.py
from rest_framework.routers import DefaultRouter
from .views import YourModelViewSet

router = DefaultRouter()
router.register(r'items', YourModelViewSet, basename='item')

urlpatterns = router.urls
```

5. **Include in main URLs:**
```python
# handygh/urls.py
urlpatterns = [
    path('api/v1/your-app/', include('apps.your_app.urls')),
]
```

### Adding a New Permission

```python
# core/permissions.py
from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners or admins to access.
    """
    
    def has_object_permission(self, request, view, obj):
        # Admins can do anything
        if request.user.role == 'ADMIN':
            return True
        
        # Check if user owns the object
        return obj.user == request.user
```

Use in views:
```python
class YourViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
```

### Database Migrations

```bash
# Create migrations
python manage.py makemigrations

# View SQL for migration
python manage.py sqlmigrate app_name migration_number

# Apply migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations

# Rollback migration
python manage.py migrate app_name previous_migration_number
```

### Working with Django Shell

```bash
python manage.py shell
```

```python
# Import models
from apps.users.models import User
from apps.bookings.models import Booking

# Query data
users = User.objects.filter(role='CUSTOMER')
bookings = Booking.objects.select_related('customer', 'provider')

# Create data
user = User.objects.create(phone='+233241234567', name='Test')

# Update data
user.name = 'Updated Name'
user.save()
```

## 🔄 Contribution Workflow

### 1. Pick a Task

- Check the project board or issue tracker
- Assign yourself to the task
- Understand requirements and acceptance criteria

### 2. Create a Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Urgent production fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

### 3. Develop

- Write code following style guidelines
- Write tests for your changes
- Run tests locally
- Commit frequently with clear messages

### 4. Commit Messages

Follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(bookings): add booking cancellation endpoint

Implement endpoint for customers to cancel bookings.
Includes validation for cancellation window and refund logic.

Closes #123
```

```
fix(payments): handle momo webhook timeout

Add retry logic for failed webhook processing.
Implements exponential backoff with max 3 retries.
```

### 5. Run Quality Checks

```bash
# Format code
black .
isort .

# Lint
flake8 .

# Run tests
pytest

# Check coverage
pytest --cov=apps --cov=core
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Create pull request on GitHub/GitLab with:
- Clear title and description
- Link to related issues
- Screenshots (if UI changes)
- Test results

### 7. Code Review

- Address reviewer feedback
- Make requested changes
- Push updates to the same branch
- Re-request review

### 8. Merge

Once approved:
- Squash commits if needed
- Merge to develop
- Delete feature branch

## ✅ Best Practices

### Security

1. **Never commit secrets**
   - Use environment variables
   - Add sensitive files to `.gitignore`
   - Use `.env.example` for templates

2. **Validate all inputs**
   ```python
   # Use serializers for validation
   serializer = BookingSerializer(data=request.data)
   serializer.is_valid(raise_exception=True)
   ```

3. **Use permissions properly**
   ```python
   # Always check permissions
   permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
   ```

4. **Sanitize user input**
   ```python
   # Django ORM prevents SQL injection
   User.objects.filter(phone=phone)  # Safe
   
   # Never use raw SQL with user input
   # cursor.execute(f"SELECT * FROM users WHERE phone='{phone}'")  # Dangerous!
   ```

### Performance

1. **Use select_related and prefetch_related**
   ```python
   # Bad: N+1 queries
   bookings = Booking.objects.all()
   for booking in bookings:
       print(booking.customer.name)  # Query per booking!
   
   # Good: Single query with join
   bookings = Booking.objects.select_related('customer')
   for booking in bookings:
       print(booking.customer.name)  # No extra queries
   ```

2. **Add database indexes**
   ```python
   class Meta:
       indexes = [
           models.Index(fields=['status', 'created_at']),
       ]
   ```

3. **Use pagination**
   ```python
   # In settings
   REST_FRAMEWORK = {
       'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
       'PAGE_SIZE': 20
   }
   ```

4. **Cache expensive operations**
   ```python
   from django.core.cache import cache
   
   def get_provider_stats(provider_id):
       cache_key = f'provider_stats_{provider_id}'
       stats = cache.get(cache_key)
       
       if stats is None:
           stats = calculate_stats(provider_id)
           cache.set(cache_key, stats, timeout=3600)
       
       return stats
   ```

### Error Handling

1. **Use custom exceptions**
   ```python
   from core.exceptions import ValidationError
   
   if not is_valid:
       raise ValidationError("Invalid booking time")
   ```

2. **Handle exceptions gracefully**
   ```python
   try:
       booking = BookingService.create_booking(...)
   except ValidationError as e:
       return Response(
           {'error': str(e)},
           status=status.HTTP_400_BAD_REQUEST
       )
   ```

3. **Log errors**
   ```python
   import logging
   
   logger = logging.getLogger(__name__)
   
   try:
       process_payment(booking)
   except Exception as e:
       logger.error(f"Payment failed for booking {booking.id}: {e}")
       raise
   ```

### Code Organization

1. **Keep views thin**
   ```python
   # Good: View delegates to service
   def create(self, request):
       serializer = self.get_serializer(data=request.data)
       serializer.is_valid(raise_exception=True)
       
       booking = BookingService.create_booking(
           customer=request.user,
           **serializer.validated_data
       )
       
       return Response(BookingSerializer(booking).data)
   ```

2. **Use services for business logic**
   ```python
   # Good: Business logic in service
   class BookingService:
       @staticmethod
       def create_booking(...):
           # Validate
           # Check availability
           # Create booking
           # Send notifications
           return booking
   ```

3. **Single Responsibility Principle**
   - Each function should do one thing
   - Each class should have one reason to change
   - Keep functions small (< 50 lines)

## 📖 Resources & Learning

### Django Documentation
- [Django Official Docs](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Django Best Practices](https://django-best-practices.readthedocs.io/)

### Python Resources
- [PEP 8 Style Guide](https://pep8.org/)
- [Python Type Hints](https://docs.python.org/3/library/typing.html)
- [Real Python Tutorials](https://realpython.com/)

### Testing
- [Pytest Documentation](https://docs.pytest.org/)
- [pytest-django](https://pytest-django.readthedocs.io/)
- [Test-Driven Development with Python](https://www.obeythetestinggoat.com/)

### Books
- "Two Scoops of Django" by Daniel and Audrey Roy Greenfeld
- "Django for APIs" by William S. Vincent
- "Clean Code" by Robert C. Martin
- "The Pragmatic Programmer" by Hunt and Thomas

### Internal Documentation
- [API Documentation](API_DOCUMENTATION.md)
- [Testing Guidelines](TESTING_AND_QUALITY.md)
- [Code Quality Standards](CODE_QUALITY.md)
- [Deployment Guide](deployment/DEPLOYMENT_GUIDE.md)

## 🎓 Learning Path

### Week 1: Setup & Basics
- Set up development environment
- Understand project structure
- Read through existing code
- Run and explore the API
- Write your first test

### Week 2: Core Concepts
- Study the authentication flow
- Understand the booking lifecycle
- Learn the service layer pattern
- Practice writing services and tests

### Week 3: Advanced Topics
- Study payment processing
- Understand dispute resolution
- Learn about performance optimization
- Practice with complex queries

### Week 4: Contribution
- Pick a small task
- Implement with tests
- Submit your first PR
- Participate in code review

## 🤝 Getting Help

- **Code Questions**: Ask in team chat or create a discussion
- **Bug Reports**: Create an issue with reproduction steps
- **Feature Requests**: Discuss with team lead first
- **Documentation**: Update docs when you learn something new

## 🎉 Welcome Aboard!

You're now ready to start contributing to HandyGH! Remember:
- Ask questions when stuck
- Write tests for your code
- Follow the style guide
- Be patient with yourself
- Have fun coding!

Happy coding! 🚀
