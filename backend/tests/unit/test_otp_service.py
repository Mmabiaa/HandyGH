"""
Unit tests for OTPService.

Tests OTP generation, verification, and rate limiting.
"""

from datetime import timedelta

from django.core.cache import cache
from django.utils import timezone

import pytest

from apps.authentication.models import OTPToken
from apps.authentication.services import OTPService
from core.exceptions import AuthenticationError, RateLimitError
from core.utils import hash_value


@pytest.mark.django_db
class TestOTPService:
    """Test OTPService functionality."""

    def setup_method(self):
        """Clear cache before each test."""
        cache.clear()

    def test_request_otp_success(self, user_data):
        """Test successful OTP request."""
        phone = user_data["phone"]

        result = OTPService.request_otp(phone)

        assert result["success"] is True
        assert "message" in result
        assert result["expires_in_minutes"] == 10

        # Verify OTP token was created
        otp_token = OTPToken.objects.filter(phone=phone).latest("created_at")
        assert otp_token is not None
        assert not otp_token.verified
        assert otp_token.expires_at > timezone.now()

    def test_request_otp_normalizes_phone(self):
        """Test that phone numbers are normalized."""
        # Test with local format
        result = OTPService.request_otp("0241234567")

        # Should be normalized to international format
        otp_token = OTPToken.objects.latest("created_at")
        assert otp_token.phone.startswith("+233")

    def test_request_otp_invalidates_previous(self, user_data):
        """Test that requesting new OTP invalidates previous ones."""
        phone = user_data["phone"]

        # Request first OTP
        OTPService.request_otp(phone)
        first_token = OTPToken.objects.filter(phone=phone).latest("created_at")

        # Request second OTP
        cache.clear()  # Clear rate limit for test
        OTPService.request_otp(phone)

        # First token should be marked as verified (invalidated)
        first_token.refresh_from_db()
        assert first_token.verified is True

    def test_request_otp_rate_limit(self, user_data):
        """Test rate limiting for OTP requests."""
        phone = user_data["phone"]

        # Make 5 requests (the limit)
        for i in range(5):
            OTPService.request_otp(phone)

        # 6th request should fail
        with pytest.raises(RateLimitError) as exc_info:
            OTPService.request_otp(phone)

        assert "Too many" in str(exc_info.value)

    def test_verify_otp_success(self, otp_token):
        """Test successful OTP verification."""
        phone = otp_token.phone
        otp_code = otp_token.otp_code

        user = OTPService.verify_otp(phone, otp_code)

        assert user is not None
        assert user.phone == phone

        # Token should be marked as verified
        otp_token.refresh_from_db()
        assert otp_token.verified is True

    def test_verify_otp_creates_new_user(self, user_data, valid_otp):
        """Test that OTP verification creates new user if not exists."""
        phone = "+233241111111"  # New phone number
        otp_hash = hash_value(valid_otp)
        expires_at = timezone.now() + timedelta(minutes=10)

        OTPToken.objects.create(phone=phone, code_hash=otp_hash, expires_at=expires_at)

        user = OTPService.verify_otp(phone, valid_otp)

        assert user is not None
        assert user.phone == phone
        assert user.role == "CUSTOMER"  # Default role

    def test_verify_otp_invalid_code(self, otp_token):
        """Test OTP verification with invalid code."""
        phone = otp_token.phone

        with pytest.raises(AuthenticationError) as exc_info:
            OTPService.verify_otp(phone, "999999")

        assert "Invalid OTP" in str(exc_info.value)

    def test_verify_otp_expired(self, expired_otp_token):
        """Test OTP verification with expired token."""
        phone = expired_otp_token.phone
        otp_code = expired_otp_token.otp_code

        with pytest.raises(AuthenticationError) as exc_info:
            OTPService.verify_otp(phone, otp_code)

        assert "expired" in str(exc_info.value).lower()

    def test_verify_otp_max_attempts(self, otp_token):
        """Test OTP verification attempt limit."""
        phone = otp_token.phone

        # Set attempts to max
        otp_token.attempts = 5  # OTP_MAX_ATTEMPTS
        otp_token.save()

        with pytest.raises(RateLimitError) as exc_info:
            OTPService.verify_otp(phone, otp_token.otp_code)

        assert "Too many" in str(exc_info.value)

    def test_verify_otp_increments_attempts(self, otp_token):
        """Test that verification increments attempt counter."""
        phone = otp_token.phone
        otp_code = otp_token.otp_code

        initial_attempts = otp_token.attempts

        OTPService.verify_otp(phone, otp_code)

        otp_token.refresh_from_db()
        assert otp_token.attempts == initial_attempts + 1

    def test_verify_otp_rate_limit(self, user_data):
        """Test rate limiting for OTP verification."""
        phone = user_data["phone"]

        # Create a valid OTP token for testing
        from datetime import timedelta

        from django.utils import timezone

        from core.utils import generate_otp, hash_value

        otp_code = generate_otp(length=6)
        otp_hash = hash_value(otp_code)
        expires_at = timezone.now() + timedelta(minutes=10)

        OTPToken.objects.create(phone=phone, code_hash=otp_hash, expires_at=expires_at)

        # Make 10 failed attempts (the limit)
        for i in range(10):
            try:
                OTPService.verify_otp(phone, "999999")
            except AuthenticationError:
                pass

        # 11th attempt should hit rate limit
        with pytest.raises(RateLimitError):
            OTPService.verify_otp(phone, "999999")
