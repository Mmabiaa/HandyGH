"""
Pytest configuration and fixtures for tests.
"""

import pytest


@pytest.fixture(scope='session')
def django_db_setup():
    """Setup test database."""
    from django.conf import settings
    settings.DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }


@pytest.fixture
def user_data():
    """Sample user data for testing."""
    return {
        'phone': '+233241234567',
        'email': 'test@example.com',
        'name': 'Test User',
        'role': 'CUSTOMER'
    }


@pytest.fixture
def customer_user(db, user_data):
    """Create a customer user for testing."""
    user = User.objects.create(
        phone=user_data['phone'],
        email=user_data['email'],
        name=user_data['name'],
        role='CUSTOMER'
    )
    return user


@pytest.fixture
def provider_user(db):
    """Create a provider user for testing."""
    user = User.objects.create(
        phone='+233241234568',
        email='provider@example.com',
        name='Test Provider',
        role='PROVIDER'
    )
    return user


@pytest.fixture
def admin_user(db):
    """Create an admin user for testing."""
    user = User.objects.create(
        phone='+233241234569',
        email='admin@example.com',
        name='Test Admin',
        role='ADMIN',
        is_staff=True,
        is_superuser=True
    )
    return user


@pytest.fixture
def valid_otp():
    """Generate a valid OTP code."""
    return generate_otp(length=6)


@pytest.fixture
def otp_token(db, user_data, valid_otp):
    """Create a valid OTP token for testing."""
    otp_hash = hash_value(valid_otp)
    expires_at = timezone.now() + timedelta(minutes=10)
    
    token = OTPToken.objects.create(
        phone=user_data['phone'],
        code_hash=otp_hash,
        expires_at=expires_at
    )
    
    # Return both token and the actual OTP code
    token.otp_code = valid_otp
    return token


@pytest.fixture
def expired_otp_token(db, user_data):
    """Create an expired OTP token for testing."""
    otp_code = generate_otp(length=6)
    otp_hash = hash_value(otp_code)
    expires_at = timezone.now() - timedelta(minutes=1)
    
    token = OTPToken.objects.create(
        phone=user_data['phone'],
        code_hash=otp_hash,
        expires_at=expires_at
    )
    
    token.otp_code = otp_code
    return token


@pytest.fixture
def refresh_token(db, customer_user):
    """Create a valid refresh token for testing."""
    from apps.authentication.services import JWTService
    
    tokens = JWTService.create_tokens(customer_user)
    return tokens['refresh_token']


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
    api_client.refresh_token = tokens['refresh_token']
    api_client.user = customer_user
    
    return api_client
