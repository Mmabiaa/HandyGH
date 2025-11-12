"""
Services for authentication app.

Design Decisions:
- Service layer pattern for business logic separation
- OTPService handles OTP generation, validation, and rate limiting
- JWTService handles token creation, refresh, and revocation
- SMSService provides abstraction for SMS providers

SOLID Principles:
- Single Responsibility: Each service handles one aspect
- Dependency Inversion: Services depend on abstractions (SMS interface)
- Open/Closed: Easy to add new SMS providers
"""

import logging
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from django.core.cache import cache
from rest_framework_simplejwt.tokens import RefreshToken as JWTRefreshToken
from apps.users.models import User
from .models import OTPToken, RefreshToken
from core.utils import generate_otp, hash_value, normalize_phone_number
from core.exceptions import (
    ValidationError,
    AuthenticationError,
    RateLimitError,
    NotFoundError
)

logger = logging.getLogger('apps.authentication')


class SMSService:
    """
    Abstract SMS service for sending OTP codes.
    
    Provides interface for different SMS providers.
    """
    
    @staticmethod
    def send_otp(phone, otp_code):
        """
        Send OTP code via SMS.
        
        Args:
            phone: Phone number to send to
            otp_code: OTP code to send
            
        Returns:
            Boolean indicating success
            
        Raises:
            ServiceUnavailableError: If SMS service fails
        """
        provider = settings.SMS_PROVIDER
        
        if provider == 'mock':
            return MockSMSService.send(phone, otp_code)
        elif provider == 'twilio':
            return TwilioSMSService.send(phone, otp_code)
        else:
            logger.error(f"Unknown SMS provider: {provider}")
            return MockSMSService.send(phone, otp_code)


class MockSMSService:
    """
    Mock SMS service for development.
    
    Logs OTP codes to console instead of sending SMS.
    """
    
    @staticmethod
    def send(phone, otp_code):
        """
        Mock send - logs OTP to console.
        
        Args:
            phone: Phone number
            otp_code: OTP code
            
        Returns:
            True (always succeeds)
        """
        logger.info(f"[MOCK SMS] OTP for {phone}: {otp_code}")
        print(f"\n{'='*50}")
        print(f"OTP CODE FOR {phone}: {otp_code}")
        print(f"{'='*50}\n")
        return True


class TwilioSMSService:
    """
    Twilio SMS service implementation.
    
    Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER
    in environment variables.
    """
    
    @staticmethod
    def send(phone, otp_code):
        """
        Send OTP via Twilio.
        
        Args:
            phone: Phone number
            otp_code: OTP code
            
        Returns:
            Boolean indicating success
        """
        try:
            from twilio.rest import Client
            
            account_sid = settings.TWILIO_ACCOUNT_SID
            auth_token = settings.TWILIO_AUTH_TOKEN
            from_phone = settings.TWILIO_PHONE_NUMBER
            
            client = Client(account_sid, auth_token)
            
            message = client.messages.create(
                body=f"Your HandyGH verification code is: {otp_code}. Valid for 10 minutes.",
                from_=from_phone,
                to=phone
            )
            
            logger.info(f"SMS sent to {phone}, SID: {message.sid}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send SMS to {phone}: {str(e)}")
            return False


class OTPService:
    """
    Service for OTP generation, validation, and management.
    
    Handles:
    - OTP generation and storage
    - Rate limiting
    - Verification with attempt tracking
    - Expiration management
    """
    
    @staticmethod
    def _get_rate_limit_key(phone, action='request'):
        """Get cache key for rate limiting."""
        return f"otp_rate_limit:{action}:{phone}"
    
    @staticmethod
    def _check_rate_limit(phone, action='request', limit=5, window=3600):
        """
        Check if rate limit is exceeded.
        
        Args:
            phone: Phone number
            action: Action type ('request' or 'verify')
            limit: Maximum attempts
            window: Time window in seconds
            
        Returns:
            Tuple of (is_allowed, attempts_remaining)
            
        Raises:
            RateLimitError: If rate limit exceeded
        """
        cache_key = OTPService._get_rate_limit_key(phone, action)
        attempts = cache.get(cache_key, 0)
        
        if attempts >= limit:
            raise RateLimitError(
                f"Too many {action} attempts. Please try again later."
            )
        
        return True, limit - attempts
    
    @staticmethod
    def _increment_rate_limit(phone, action='request', window=3600):
        """Increment rate limit counter."""
        cache_key = OTPService._get_rate_limit_key(phone, action)
        attempts = cache.get(cache_key, 0)
        cache.set(cache_key, attempts + 1, window)
    
    @staticmethod
    def request_otp(phone):
        """
        Generate and send OTP to phone number.
        
        Args:
            phone: Phone number
            
        Returns:
            Dict with success status and message
            
        Raises:
            ValidationError: If phone number is invalid
            RateLimitError: If rate limit exceeded
        """
        # Normalize phone number
        phone = normalize_phone_number(phone)
        
        # Check rate limit (5 requests per hour)
        OTPService._check_rate_limit(
            phone,
            action='request',
            limit=5,  # 5 requests per hour
            window=3600
        )
        
        # Generate OTP
        otp_code = generate_otp(length=settings.OTP_LENGTH)
        otp_hash = hash_value(otp_code)
        
        # Calculate expiration
        expires_at = timezone.now() + timedelta(
            minutes=settings.OTP_EXPIRY_MINUTES
        )
        
        # Invalidate any existing OTPs for this phone
        OTPToken.objects.filter(
            phone=phone,
            verified=False
        ).update(verified=True)  # Mark as used
        
        # Create new OTP token
        otp_token = OTPToken.objects.create(
            phone=phone,
            code_hash=otp_hash,
            expires_at=expires_at
        )
        
        # Send OTP via SMS
        sms_sent = SMSService.send_otp(phone, otp_code)
        
        if not sms_sent:
            logger.warning(f"Failed to send OTP to {phone}")
        
        # Increment rate limit
        OTPService._increment_rate_limit(phone, action='request')
        
        logger.info(f"OTP requested for {phone}, expires at {expires_at}")
        
        return {
            'success': True,
            'message': 'OTP sent successfully',
            'expires_in_minutes': settings.OTP_EXPIRY_MINUTES
        }
    
    @staticmethod
    def verify_otp(phone, otp_code):
        """
        Verify OTP code for phone number.
        
        Args:
            phone: Phone number
            otp_code: OTP code to verify
            
        Returns:
            User instance if verification successful
            
        Raises:
            ValidationError: If OTP is invalid
            RateLimitError: If too many attempts
            AuthenticationError: If verification fails
        """
        # Normalize phone number
        phone = normalize_phone_number(phone)
        
        # Check rate limit (10 attempts per hour)
        OTPService._check_rate_limit(
            phone,
            action='verify',
            limit=10,  # 10 attempts per hour
            window=3600
        )
        
        # Hash the provided OTP
        otp_hash = hash_value(otp_code)
        
        # Find valid OTP token
        try:
            otp_token = OTPToken.objects.filter(
                phone=phone,
                code_hash=otp_hash,
                verified=False
            ).latest('created_at')
        except OTPToken.DoesNotExist:
            # Increment rate limit even for invalid OTP
            OTPService._increment_rate_limit(phone, action='verify')
            raise AuthenticationError('Invalid OTP code')
        
        # Check if OTP is expired
        if otp_token.is_expired():
            raise AuthenticationError('OTP code has expired')
        
        # Check attempt limit for this specific token
        if otp_token.attempts >= settings.OTP_MAX_ATTEMPTS:
            raise RateLimitError('Too many verification attempts for this OTP')
        
        # Increment attempts
        otp_token.increment_attempts()
        
        # Mark OTP as verified
        otp_token.mark_verified()
        
        # Get or create user
        user, created = User.objects.get_or_create(
            phone=phone,
            defaults={'role': 'CUSTOMER'}
        )
        
        if created:
            logger.info(f"New user created: {phone}")
        else:
            logger.info(f"Existing user authenticated: {phone}")
        
        return user


class JWTService:
    """
    Service for JWT token management.
    
    Handles:
    - Token creation (access + refresh)
    - Token refresh
    - Token revocation
    - Session tracking
    """
    
    @staticmethod
    def create_tokens(user, request=None):
        """
        Create access and refresh tokens for user.
        
        Args:
            user: User instance
            request: HTTP request (optional, for tracking)
            
        Returns:
            Dict with access_token, refresh_token, and metadata
        """
        # Generate JWT tokens
        refresh = JWTRefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Hash refresh token for storage
        refresh_token_hash = hash_value(refresh_token)
        
        # Calculate expiration
        expires_at = timezone.now() + timedelta(
            minutes=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds() / 60
        )
        
        # Extract request metadata
        user_agent = ''
        ip_address = None
        
        if request:
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            ip_address = request.META.get('REMOTE_ADDR')
        
        # Store refresh token
        RefreshToken.objects.create(
            user=user,
            token_hash=refresh_token_hash,
            user_agent=user_agent,
            ip_address=ip_address,
            expires_at=expires_at
        )
        
        logger.info(f"Tokens created for user {user.phone}")
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'Bearer',
            'expires_in': int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
            'user': {
                'id': str(user.id),
                'phone': user.phone,
                'name': user.name,
                'role': user.role,
            }
        }
    
    @staticmethod
    def refresh_tokens(refresh_token_str, request=None):
        """
        Refresh access token using refresh token.
        
        Args:
            refresh_token_str: Refresh token string
            request: HTTP request (optional)
            
        Returns:
            Dict with new access_token and refresh_token
            
        Raises:
            AuthenticationError: If refresh token is invalid
        """
        # Hash the provided refresh token
        token_hash = hash_value(refresh_token_str)
        
        # Find refresh token in database
        try:
            refresh_token = RefreshToken.objects.get(
                token_hash=token_hash,
                revoked=False
            )
        except RefreshToken.DoesNotExist:
            raise AuthenticationError('Invalid refresh token')
        
        # Check if token is expired
        if refresh_token.is_expired():
            raise AuthenticationError('Refresh token has expired')
        
        # Revoke old refresh token
        refresh_token.revoke()
        
        # Create new tokens
        return JWTService.create_tokens(refresh_token.user, request)
    
    @staticmethod
    def revoke_token(refresh_token_str):
        """
        Revoke a refresh token (logout).
        
        Args:
            refresh_token_str: Refresh token string
            
        Returns:
            Boolean indicating success
        """
        token_hash = hash_value(refresh_token_str)
        
        try:
            refresh_token = RefreshToken.objects.get(token_hash=token_hash)
            refresh_token.revoke()
            logger.info(f"Token revoked for user {refresh_token.user.phone}")
            return True
        except RefreshToken.DoesNotExist:
            return False
    
    @staticmethod
    def revoke_all_tokens(user):
        """
        Revoke all refresh tokens for a user (logout from all devices).
        
        Args:
            user: User instance
            
        Returns:
            Number of tokens revoked
        """
        count = RefreshToken.revoke_all_for_user(user)
        logger.info(f"Revoked {count} tokens for user {user.phone}")
        return count
