"""
Pytest configuration and fixtures for tests.
"""

from django.core.management import call_command

import pytest


@pytest.fixture(scope="session")
def django_db_setup(django_db_setup, django_db_blocker):
    """Setup test database with migrations."""
    with django_db_blocker.unblock():
        call_command("migrate", "--run-syncdb", verbosity=0)


@pytest.fixture
def user_data():
    """Sample user data for testing."""
    return {
        "phone": "+233241234567",
        "email": "test@example.com",
        "name": "Test User",
        "role": "CUSTOMER",
    }


@pytest.fixture
def customer_user(db, user_data):
    """Create a customer user for testing."""
    from django.contrib.auth import get_user_model

    User = get_user_model()

    user = User.objects.create(
        phone=user_data["phone"], email=user_data["email"], name=user_data["name"], role="CUSTOMER"
    )
    return user


@pytest.fixture
def provider_user(db):
    """Create a provider user for testing."""
    from django.contrib.auth import get_user_model

    User = get_user_model()

    user = User.objects.create(
        phone="+233241234568", email="provider@example.com", name="Test Provider", role="PROVIDER"
    )
    return user


@pytest.fixture
def admin_user(db):
    """Create an admin user for testing."""
    from django.contrib.auth import get_user_model

    User = get_user_model()

    user = User.objects.create(
        phone="+233241234569",
        email="admin@example.com",
        name="Test Admin",
        role="ADMIN",
        is_staff=True,
        is_superuser=True,
    )
    return user


@pytest.fixture
def valid_otp():
    """Generate a valid OTP code."""
    from core.utils import generate_otp

    return generate_otp(length=6)


@pytest.fixture
def otp_token(db, user_data, valid_otp):
    """Create a valid OTP token for testing."""
    from datetime import timedelta

    from django.utils import timezone

    from apps.authentication.models import OTPToken
    from core.utils import hash_value

    otp_hash = hash_value(valid_otp)
    expires_at = timezone.now() + timedelta(minutes=10)

    token = OTPToken.objects.create(
        phone=user_data["phone"], code_hash=otp_hash, expires_at=expires_at
    )

    # Return both token and the actual OTP code
    token.otp_code = valid_otp
    return token


@pytest.fixture
def expired_otp_token(db, user_data):
    """Create an expired OTP token for testing."""
    from datetime import timedelta

    from django.utils import timezone

    from apps.authentication.models import OTPToken
    from core.utils import generate_otp, hash_value

    otp_code = generate_otp(length=6)
    otp_hash = hash_value(otp_code)
    expires_at = timezone.now() - timedelta(minutes=1)

    token = OTPToken.objects.create(
        phone=user_data["phone"], code_hash=otp_hash, expires_at=expires_at
    )

    token.otp_code = otp_code
    return token


@pytest.fixture
def refresh_token(db, customer_user):
    """Create a valid refresh token for testing."""
    from apps.authentication.services import JWTService

    tokens = JWTService.create_tokens(customer_user)
    return tokens["refresh_token"]


@pytest.fixture
def api_client():
    """Create an API client for testing."""
    from rest_framework.test import APIClient

    return APIClient()


@pytest.fixture
def authenticated_client(api_client, customer_user):
    """Create an authenticated API client."""
    from apps.authentication.services import JWTService

    tokens = JWTService.create_tokens(customer_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
    api_client.refresh_token = tokens["refresh_token"]
    api_client.user = customer_user

    return api_client


# Booking-related fixtures


@pytest.fixture
def customer(db):
    """Create a customer user for booking tests."""
    from django.contrib.auth import get_user_model

    User = get_user_model()

    return User.objects.create(
        phone="+233241111111", email="customer@test.com", name="Test Customer", role="CUSTOMER"
    )


@pytest.fixture
def provider(db, provider_user):
    """Create a provider profile for testing."""
    from apps.providers.models import Provider

    return Provider.objects.create(
        user=provider_user,
        business_name="Test Provider Business",
        categories=["plumbing"],
        latitude=5.6037,
        longitude=-0.1870,
        address="Accra, Ghana",
        verified=True,
        is_active=True,
    )


@pytest.fixture
def service_category(db):
    """Create a service category for testing."""
    from apps.providers.models import ServiceCategory

    return ServiceCategory.objects.create(
        name="Plumbing", slug="plumbing", description="Plumbing services", is_active=True
    )


@pytest.fixture
def provider_service(db, provider, service_category):
    """Create a provider service for testing."""
    from decimal import Decimal

    from apps.providers.models import ProviderService

    return ProviderService.objects.create(
        provider=provider,
        category=service_category,
        title="Emergency Plumbing",
        description="24/7 emergency plumbing services",
        price_type="HOURLY",
        price_amount=Decimal("50.00"),
        duration_estimate_min=120,
        is_active=True,
    )


@pytest.fixture
def booking(db, customer, provider, provider_service):
    """Create a booking for testing."""
    from datetime import timedelta
    from decimal import Decimal

    from django.utils import timezone

    from apps.bookings.models import Booking

    scheduled_start = timezone.now() + timedelta(days=1)
    scheduled_end = scheduled_start + timedelta(hours=2)

    return Booking.objects.create(
        booking_ref="BK-TEST123",
        customer=customer,
        provider=provider,
        provider_service=provider_service,
        status="REQUESTED",
        scheduled_start=scheduled_start,
        scheduled_end=scheduled_end,
        address="123 Test Street, Accra",
        notes="Test booking",
        total_amount=Decimal("100.00"),
        payment_status="PENDING",
    )


@pytest.fixture
def customer_token(db, customer):
    """Create JWT token for customer."""
    from apps.authentication.services import JWTService

    tokens = JWTService.create_tokens(customer)
    return tokens["access_token"]


@pytest.fixture
def provider_token(db, provider_user):
    """Create JWT token for provider."""
    from apps.authentication.services import JWTService

    tokens = JWTService.create_tokens(provider_user)
    return tokens["access_token"]


@pytest.fixture
def customer_user_token(db, customer_user):
    """Create JWT token for customer_user."""
    from apps.authentication.services import JWTService

    tokens = JWTService.create_tokens(customer_user)
    return tokens["access_token"]


# Payment-related fixtures


@pytest.fixture
def sample_provider(db, provider_user):
    """Create a sample provider for payment tests."""
    from apps.providers.models import Provider

    return Provider.objects.create(
        user=provider_user,
        business_name="Sample Provider",
        categories=["plumbing"],
        latitude=5.6037,
        longitude=-0.1870,
        address="Accra, Ghana",
        verified=True,
        is_active=True,
    )


@pytest.fixture
def sample_booking(db, customer_user, sample_provider):
    """Create a sample booking for payment tests."""
    from datetime import timedelta
    from decimal import Decimal

    from django.utils import timezone

    from apps.bookings.models import Booking
    from apps.providers.models import ProviderService, ServiceCategory

    # Create category and service
    category = ServiceCategory.objects.create(
        name="Plumbing", slug="plumbing", description="Plumbing services", is_active=True
    )

    service = ProviderService.objects.create(
        provider=sample_provider,
        category=category,
        title="Test Service",
        description="Test service description",
        price_type="FIXED",
        price_amount=Decimal("100.00"),
        is_active=True,
    )

    scheduled_start = timezone.now() + timedelta(days=1)
    scheduled_end = scheduled_start + timedelta(hours=2)

    return Booking.objects.create(
        booking_ref="BK-PAY-TEST",
        customer=customer_user,
        provider=sample_provider,
        provider_service=service,
        status="CONFIRMED",
        scheduled_start=scheduled_start,
        scheduled_end=scheduled_end,
        address="Test Address",
        total_amount=Decimal("100.00"),
        payment_status="PENDING",
    )
