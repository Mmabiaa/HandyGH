"""
Password Reset Service for HandyGH.

Design Decisions:
- OTP-based password reset (consistent with phone-based auth)
- Separate OTP tokens for password reset (different purpose)
- Rate limiting to prevent abuse
- Secure password validation

Flow:
1. Request password reset OTP
2. Verify OTP
3. Set new password
"""

import logging
from datetime import timedelta

from django.conf import settings
from django.core.cache import cache
from django.utils import timezone

from apps.users.models import User
from core.exceptions import AuthenticationError, NotFoundError, RateLimitError, ValidationError
from core.utils import generate_otp, hash_value, normalize_phone_number

from .models import OTPToken

logger = logging.getLogger("apps.authentication")


class PasswordResetService:
    """
    Service for password reset functionality.

    Handles:
    - Password reset OTP generation
    - OTP verification for password reset
    - Password update with validation
    """

    @staticmethod
    def _get_rate_limit_key(phone, action="reset_request"):
        """Get cache key for rate limiting."""
        return f"password_reset:{action}:{phone}"

    @staticmethod
    def _check_rate_limit(phone, action="reset_request", limit=3, window=3600):
        """
        Check if rate limit is exceeded.

        Args:
            phone: Phone number
            action: Action type
            limit: Maximum attempts
            window: Time window in seconds

        Raises:
            RateLimitError: If rate limit exceeded
        """
        cache_key = PasswordResetService._get_rate_limit_key(phone, action)
        attempts = cache.get(cache_key, 0)

        if attempts >= limit:
            raise RateLimitError(f"Too many password reset attempts. Please try again later.")

        return True

    @staticmethod
    def _increment_rate_limit(phone, action="reset_request", window=3600):
        """Increment rate limit counter."""
        cache_key = PasswordResetService._get_rate_limit_key(phone, action)
        attempts = cache.get(cache_key, 0)
        cache.set(cache_key, attempts + 1, window)

    @staticmethod
    def request_password_reset(phone):
        """
        Request password reset OTP.

        Args:
            phone: Phone number

        Returns:
            Dict with success status

        Raises:
            NotFoundError: If user not found
            RateLimitError: If rate limit exceeded
        """
        # Normalize phone number
        phone = normalize_phone_number(phone)

        # Check if user exists
        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            # Don't reveal if user exists or not (security)
            logger.warning(f"Password reset requested for non-existent user: {phone}")
            # Still return success to prevent user enumeration
            return {
                "success": True,
                "message": "If this phone number is registered, you will receive an OTP",
                "expires_in_minutes": settings.OTP_EXPIRY_MINUTES,
            }

        # Check rate limit (3 requests per hour)
        PasswordResetService._check_rate_limit(phone, action="reset_request", limit=3, window=3600)

        # Generate OTP
        otp_code = generate_otp(length=settings.OTP_LENGTH)
        otp_hash = hash_value(otp_code)

        # Calculate expiration
        expires_at = timezone.now() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)

        # Invalidate any existing password reset OTPs for this phone
        OTPToken.objects.filter(phone=phone, verified=False).update(verified=True)

        # Create new OTP token
        otp_token = OTPToken.objects.create(phone=phone, code_hash=otp_hash, expires_at=expires_at)

        # Send OTP via SMS (mock in development)
        from .services import SMSService

        sms_sent = SMSService.send_otp(phone, otp_code)

        if not sms_sent:
            logger.warning(f"Failed to send password reset OTP to {phone}")

        # Increment rate limit
        PasswordResetService._increment_rate_limit(phone, action="reset_request")

        logger.info(f"Password reset OTP requested for {phone}")

        return {
            "success": True,
            "message": "If this phone number is registered, you will receive an OTP",
            "expires_in_minutes": settings.OTP_EXPIRY_MINUTES,
        }

    @staticmethod
    def verify_reset_otp(phone, otp_code):
        """
        Verify OTP for password reset.

        Args:
            phone: Phone number
            otp_code: OTP code to verify

        Returns:
            Reset token for password update

        Raises:
            AuthenticationError: If verification fails
            RateLimitError: If too many attempts
        """
        # Normalize phone number
        phone = normalize_phone_number(phone)

        # Check rate limit (5 attempts per hour)
        PasswordResetService._check_rate_limit(phone, action="reset_verify", limit=5, window=3600)

        # Hash the provided OTP
        otp_hash = hash_value(otp_code)

        # Find valid OTP token
        try:
            otp_token = OTPToken.objects.filter(
                phone=phone, code_hash=otp_hash, verified=False
            ).latest("created_at")
        except OTPToken.DoesNotExist:
            # Increment rate limit even for invalid OTP
            PasswordResetService._increment_rate_limit(phone, action="reset_verify")
            raise AuthenticationError("Invalid OTP code")

        # Check if OTP is expired
        if otp_token.is_expired():
            raise AuthenticationError("OTP code has expired")

        # Check attempt limit
        if otp_token.attempts >= 5:
            raise RateLimitError("Too many verification attempts for this OTP")

        # Increment attempts
        otp_token.increment_attempts()

        # Mark OTP as verified
        otp_token.mark_verified()

        # Generate reset token (temporary token for password update)
        reset_token = generate_otp(length=32)  # Longer token for security
        reset_token_hash = hash_value(reset_token)

        # Store reset token in cache (valid for 15 minutes)
        cache_key = f"password_reset_token:{phone}"
        cache.set(cache_key, reset_token_hash, 900)  # 15 minutes

        logger.info(f"Password reset OTP verified for {phone}")

        return {
            "success": True,
            "reset_token": reset_token,
            "expires_in_minutes": 15,
            "message": "OTP verified. You can now reset your password.",
        }

    @staticmethod
    def reset_password(phone, reset_token, new_password):
        """
        Reset password using verified reset token.

        Args:
            phone: Phone number
            reset_token: Reset token from OTP verification
            new_password: New password

        Returns:
            Success status

        Raises:
            AuthenticationError: If reset token invalid
            ValidationError: If password invalid
            NotFoundError: If user not found
        """
        # Normalize phone number
        phone = normalize_phone_number(phone)

        # Verify reset token
        cache_key = f"password_reset_token:{phone}"
        stored_token_hash = cache.get(cache_key)

        if not stored_token_hash:
            raise AuthenticationError("Reset token expired or invalid")

        reset_token_hash = hash_value(reset_token)

        if stored_token_hash != reset_token_hash:
            raise AuthenticationError("Invalid reset token")

        # Get user
        try:
            user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            raise NotFoundError("User not found")

        # Validate password
        if len(new_password) < 8:
            raise ValidationError("Password must be at least 8 characters long")

        # Update password
        user.set_password(new_password)
        user.save()

        # Invalidate reset token
        cache.delete(cache_key)

        # Revoke all existing refresh tokens (logout from all devices)
        from .models import RefreshToken

        RefreshToken.revoke_all_for_user(user)

        logger.info(f"Password reset successful for {phone}")

        return {
            "success": True,
            "message": "Password reset successful. Please login with your new password.",
        }
