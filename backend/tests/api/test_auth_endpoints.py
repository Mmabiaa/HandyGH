"""
API tests for authentication endpoints.

Tests all authentication API endpoints with various scenarios.
"""

import pytest
from django.urls import reverse
from django.core.cache import cache
from rest_framework import status
from apps.authentication.models import OTPToken, RefreshToken
from apps.users.models import User
from core.utils import generate_otp, hash_value


@pytest.mark.django_db
class TestOTPRequestEndpoint:
    """Test POST /api/v1/auth/otp/request/ endpoint."""
    
    def setup_method(self):
        """Clear cache before each test."""
        cache.clear()
    
    def test_request_otp_success(self, api_client):
        """Test successful OTP request."""
        url = reverse('authentication:otp-request')
        data = {'phone': '+233241234567'}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert 'message' in response.data['data']
        assert response.data['data']['expires_in_minutes'] == 10
        
        # Verify OTP was created
        assert OTPToken.objects.filter(phone=data['phone']).exists()
    
    def test_request_otp_local_format(self, api_client):
        """Test OTP request with local phone format."""
        url = reverse('authentication:otp-request')
        data = {'phone': '0241234567'}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        
        # Should be normalized to international format
        otp_token = OTPToken.objects.latest('created_at')
        assert otp_token.phone.startswith('+233')
    
    def test_request_otp_missing_phone(self, api_client):
        """Test OTP request without phone number."""
        url = reverse('authentication:otp-request')
        data = {}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_request_otp_invalid_phone(self, api_client):
        """Test OTP request with invalid phone number."""
        url = reverse('authentication:otp-request')
        data = {'phone': 'invalid'}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_request_otp_rate_limit(self, api_client):
        """Test OTP request rate limiting."""
        url = reverse('authentication:otp-request')
        phone = '+233241234567'
        
        # Make 5 requests (the limit)
        for i in range(5):
            response = api_client.post(url, {'phone': phone}, format='json')
            assert response.status_code == status.HTTP_200_OK
        
        # 6th request should be rate limited
        response = api_client.post(url, {'phone': phone}, format='json')
        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS


@pytest.mark.django_db
class TestOTPVerifyEndpoint:
    """Test POST /api/v1/auth/otp/verify/ endpoint."""
    
    def setup_method(self):
        """Clear cache before each test."""
        cache.clear()
    
    def test_verify_otp_success(self, api_client, otp_token):
        """Test successful OTP verification."""
        url = reverse('authentication:otp-verify')
        data = {
            'phone': otp_token.phone,
            'otp': otp_token.otp_code
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert 'access_token' in response.data['data']
        assert 'refresh_token' in response.data['data']
        assert 'user' in response.data['data']
        
        # Verify user was created
        assert User.objects.filter(phone=otp_token.phone).exists()
    
    def test_verify_otp_creates_user(self, api_client):
        """Test that OTP verification creates new user."""
        phone = '+233241111111'
        otp_code = generate_otp(length=6)
        
        # Create OTP token
        from django.utils import timezone
        from datetime import timedelta
        OTPToken.objects.create(
            phone=phone,
            code_hash=hash_value(otp_code),
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        url = reverse('authentication:otp-verify')
        data = {'phone': phone, 'otp': otp_code}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        
        # Verify user was created with correct role
        user = User.objects.get(phone=phone)
        assert user.role == 'CUSTOMER'
    
    def test_verify_otp_invalid_code(self, api_client, otp_token):
        """Test OTP verification with invalid code."""
        url = reverse('authentication:otp-verify')
        data = {
            'phone': otp_token.phone,
            'otp': '999999'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data['success'] is False
    
    def test_verify_otp_expired(self, api_client, expired_otp_token):
        """Test OTP verification with expired token."""
        url = reverse('authentication:otp-verify')
        data = {
            'phone': expired_otp_token.phone,
            'otp': expired_otp_token.otp_code
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_verify_otp_missing_fields(self, api_client):
        """Test OTP verification with missing fields."""
        url = reverse('authentication:otp-verify')
        
        # Missing OTP
        response = api_client.post(url, {'phone': '+233241234567'}, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        # Missing phone
        response = api_client.post(url, {'otp': '123456'}, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_verify_otp_non_numeric(self, api_client, otp_token):
        """Test OTP verification with non-numeric code."""
        url = reverse('authentication:otp-verify')
        data = {
            'phone': otp_token.phone,
            'otp': 'abcdef'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestTokenRefreshEndpoint:
    """Test POST /api/v1/auth/token/refresh/ endpoint."""
    
    def test_refresh_token_success(self, api_client, customer_user):
        """Test successful token refresh."""
        from apps.authentication.services import JWTService
        
        # Create initial tokens
        tokens = JWTService.create_tokens(customer_user)
        
        url = reverse('authentication:token-refresh')
        data = {'refresh_token': tokens['refresh_token']}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert 'access_token' in response.data['data']
        assert 'refresh_token' in response.data['data']
        
        # New tokens should be different
        assert response.data['data']['access_token'] != tokens['access_token']
        assert response.data['data']['refresh_token'] != tokens['refresh_token']
    
    def test_refresh_token_invalid(self, api_client):
        """Test token refresh with invalid token."""
        url = reverse('authentication:token-refresh')
        data = {'refresh_token': 'invalid_token'}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_refresh_token_revoked(self, api_client, customer_user):
        """Test token refresh with revoked token."""
        from apps.authentication.services import JWTService
        
        # Create and revoke token
        tokens = JWTService.create_tokens(customer_user)
        JWTService.revoke_token(tokens['refresh_token'])
        
        url = reverse('authentication:token-refresh')
        data = {'refresh_token': tokens['refresh_token']}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_refresh_token_missing(self, api_client):
        """Test token refresh without token."""
        url = reverse('authentication:token-refresh')
        data = {}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLogoutEndpoint:
    """Test POST /api/v1/auth/logout/ endpoint."""
    
    def test_logout_success(self, authenticated_client):
        """Test successful logout."""
        url = reverse('authentication:logout')
        data = {'refresh_token': authenticated_client.refresh_token}
        
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        
        # Token should be revoked
        token_hash = hash_value(authenticated_client.refresh_token)
        refresh_token = RefreshToken.objects.get(token_hash=token_hash)
        assert refresh_token.revoked is True
    
    def test_logout_unauthenticated(self, api_client):
        """Test logout without authentication."""
        url = reverse('authentication:logout')
        data = {'refresh_token': 'some_token'}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_logout_missing_token(self, authenticated_client):
        """Test logout without refresh token."""
        url = reverse('authentication:logout')
        data = {}
        
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLogoutAllEndpoint:
    """Test POST /api/v1/auth/logout/all/ endpoint."""
    
    def test_logout_all_success(self, authenticated_client, customer_user):
        """Test logout from all devices."""
        from apps.authentication.services import JWTService
        
        # Create additional tokens
        JWTService.create_tokens(customer_user)
        JWTService.create_tokens(customer_user)
        
        url = reverse('authentication:logout-all')
        
        response = authenticated_client.post(url, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert response.data['data']['tokens_revoked'] >= 3
        
        # All tokens should be revoked
        active_tokens = RefreshToken.objects.filter(
            user=customer_user,
            revoked=False
        ).count()
        assert active_tokens == 0
    
    def test_logout_all_unauthenticated(self, api_client):
        """Test logout all without authentication."""
        url = reverse('authentication:logout-all')
        
        response = api_client.post(url, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestAuthenticationSecurity:
    """Test security aspects of authentication."""
    
    def setup_method(self):
        """Clear cache before each test."""
        cache.clear()
    
    def test_otp_not_exposed_in_response(self, api_client):
        """Test that OTP code is never exposed in API responses."""
        url = reverse('authentication:otp-request')
        data = {'phone': '+233241234567'}
        
        response = api_client.post(url, data, format='json')
        
        # Response should not contain OTP code
        response_str = str(response.data)
        assert 'otp' not in response_str.lower() or 'otp_code' not in response_str.lower()
    
    def test_refresh_token_stored_hashed(self, customer_user):
        """Test that refresh tokens are stored hashed."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(customer_user)
        
        # Token in database should be hashed (different from original)
        token_hash = hash_value(tokens['refresh_token'])
        refresh_token = RefreshToken.objects.get(token_hash=token_hash)
        
        # The stored hash should not match the original token
        assert refresh_token.token_hash != tokens['refresh_token']
        assert len(refresh_token.token_hash) == 64  # SHA-256 hash length
    
    def test_otp_stored_hashed(self, api_client):
        """Test that OTP codes are stored hashed."""
        url = reverse('authentication:otp-request')
        data = {'phone': '+233241234567'}
        
        api_client.post(url, data, format='json')
        
        otp_token = OTPToken.objects.latest('created_at')
        
        # OTP should be hashed (64 char SHA-256)
        assert len(otp_token.code_hash) == 64
        assert otp_token.code_hash.isalnum()
