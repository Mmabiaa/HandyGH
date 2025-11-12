"""
Integration tests for complete authentication flow.

Tests the full OTP request → verify → token flow.
"""

import pytest
from django.core.cache import cache
from apps.authentication.services import OTPService, JWTService
from apps.authentication.models import OTPToken, RefreshToken
from apps.users.models import User


@pytest.mark.django_db
class TestAuthenticationFlow:
    """Test complete authentication flows."""
    
    def setup_method(self):
        """Clear cache before each test."""
        cache.clear()
    
    def test_complete_signup_flow(self):
        """Test complete signup flow: request OTP → verify → get tokens."""
        phone = '+233241234567'
        
        # Step 1: Request OTP
        result = OTPService.request_otp(phone)
        assert result['success'] is True
        
        # Get the OTP token from database
        otp_token = OTPToken.objects.filter(phone=phone).latest('created_at')
        assert otp_token is not None
        
        # For testing, we need to get the actual OTP code
        # In real scenario, this would be sent via SMS
        from core.utils import generate_otp, hash_value
        otp_code = generate_otp(length=6)
        otp_token.code_hash = hash_value(otp_code)
        otp_token.save()
        
        # Step 2: Verify OTP
        user = OTPService.verify_otp(phone, otp_code)
        assert user is not None
        assert user.phone == phone
        assert user.role == 'CUSTOMER'
        
        # Step 3: Create tokens
        tokens = JWTService.create_tokens(user)
        assert 'access_token' in tokens
        assert 'refresh_token' in tokens
        
        # Verify user was created
        assert User.objects.filter(phone=phone).exists()
    
    def test_complete_login_flow(self, customer_user):
        """Test complete login flow for existing user."""
        phone = customer_user.phone
        
        # Request OTP
        result = OTPService.request_otp(phone)
        assert result['success'] is True
        
        # Get OTP and verify
        otp_token = OTPToken.objects.filter(phone=phone).latest('created_at')
        from core.utils import generate_otp, hash_value
        otp_code = generate_otp(length=6)
        otp_token.code_hash = hash_value(otp_code)
        otp_token.save()
        
        user = OTPService.verify_otp(phone, otp_code)
        
        # Should return existing user, not create new one
        assert user.id == customer_user.id
        assert User.objects.filter(phone=phone).count() == 1
    
    def test_token_refresh_flow(self, customer_user):
        """Test token refresh flow."""
        # Create initial tokens
        initial_tokens = JWTService.create_tokens(customer_user)
        
        # Refresh tokens
        new_tokens = JWTService.refresh_tokens(initial_tokens['refresh_token'])
        
        # Should have new tokens
        assert new_tokens['access_token'] != initial_tokens['access_token']
        assert new_tokens['refresh_token'] != initial_tokens['refresh_token']
        
        # Old refresh token should be revoked
        from core.utils import hash_value
        old_token_hash = hash_value(initial_tokens['refresh_token'])
        old_token = RefreshToken.objects.get(token_hash=old_token_hash)
        assert old_token.revoked is True
    
    def test_logout_flow(self, customer_user):
        """Test logout flow."""
        # Create tokens
        tokens = JWTService.create_tokens(customer_user)
        
        # Logout (revoke token)
        result = JWTService.revoke_token(tokens['refresh_token'])
        assert result is True
        
        # Try to refresh with revoked token should fail
        from core.exceptions import AuthenticationError
        with pytest.raises(AuthenticationError):
            JWTService.refresh_tokens(tokens['refresh_token'])
    
    def test_logout_all_devices_flow(self, customer_user):
        """Test logout from all devices."""
        # Create tokens on multiple devices
        device1_tokens = JWTService.create_tokens(customer_user)
        device2_tokens = JWTService.create_tokens(customer_user)
        device3_tokens = JWTService.create_tokens(customer_user)
        
        # Logout from all devices
        count = JWTService.revoke_all_tokens(customer_user)
        assert count == 3
        
        # All tokens should be invalid
        from core.exceptions import AuthenticationError
        with pytest.raises(AuthenticationError):
            JWTService.refresh_tokens(device1_tokens['refresh_token'])
        with pytest.raises(AuthenticationError):
            JWTService.refresh_tokens(device2_tokens['refresh_token'])
        with pytest.raises(AuthenticationError):
            JWTService.refresh_tokens(device3_tokens['refresh_token'])
    
    def test_concurrent_otp_requests(self):
        """Test that new OTP request invalidates previous one."""
        phone = '+233241234567'
        
        # Request first OTP
        OTPService.request_otp(phone)
        first_token = OTPToken.objects.filter(phone=phone).latest('created_at')
        first_token_id = first_token.id
        
        # Request second OTP
        cache.clear()  # Clear rate limit for test
        OTPService.request_otp(phone)
        
        # First token should be invalidated
        first_token.refresh_from_db()
        assert first_token.verified is True
        
        # Second token should be active
        second_token = OTPToken.objects.filter(
            phone=phone,
            verified=False
        ).latest('created_at')
        assert second_token.id != first_token_id
    
    def test_otp_expiration_flow(self):
        """Test that expired OTP cannot be used."""
        phone = '+233241234567'
        
        # Request OTP
        OTPService.request_otp(phone)
        otp_token = OTPToken.objects.filter(phone=phone).latest('created_at')
        
        # Manually expire the token
        from django.utils import timezone
        from datetime import timedelta
        otp_token.expires_at = timezone.now() - timedelta(minutes=1)
        otp_token.save()
        
        # Get OTP code
        from core.utils import generate_otp, hash_value
        otp_code = generate_otp(length=6)
        otp_token.code_hash = hash_value(otp_code)
        otp_token.save()
        
        # Try to verify expired OTP
        from core.exceptions import AuthenticationError
        with pytest.raises(AuthenticationError) as exc_info:
            OTPService.verify_otp(phone, otp_code)
        
        assert 'expired' in str(exc_info.value).lower()
