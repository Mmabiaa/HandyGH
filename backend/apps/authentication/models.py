"""
Models for authentication app.

Design Decisions:
- OTPToken model stores hashed OTP codes for security
- Expiration tracking for automatic cleanup
- Attempt tracking for rate limiting and security
- RefreshToken model for JWT token management with revocation support

SOLID Principles:
- Single Responsibility: Each model handles one aspect of authentication
- Open/Closed: Easy to extend with additional authentication methods
"""

import uuid
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone


class OTPToken(models.Model):
    """
    Model to store OTP tokens for phone verification.

    OTP codes are hashed before storage for security.
    Includes expiration and attempt tracking for rate limiting.

    Attributes:
        id: UUID primary key
        phone: Phone number the OTP was sent to
        code_hash: Hashed OTP code
        created_at: When the OTP was created
        expires_at: When the OTP expires
        attempts: Number of verification attempts
        verified: Whether the OTP has been successfully verified
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    phone = models.CharField(
        max_length=20, db_index=True, help_text="Phone number the OTP was sent to"
    )

    code_hash = models.CharField(max_length=64, help_text="Hashed OTP code (SHA-256)")

    created_at = models.DateTimeField(default=timezone.now, help_text="When the OTP was created")

    expires_at = models.DateTimeField(help_text="When the OTP expires")

    attempts = models.IntegerField(default=0, help_text="Number of verification attempts")

    verified = models.BooleanField(default=False, help_text="Whether the OTP has been verified")

    class Meta:
        db_table = "otp_tokens"
        verbose_name = "OTP Token"
        verbose_name_plural = "OTP Tokens"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["phone", "verified"]),
            models.Index(fields=["expires_at"]),
        ]

    def __str__(self):
        """String representation of OTP token."""
        return f"OTP for {self.phone} (expires: {self.expires_at})"

    def is_expired(self):
        """
        Check if OTP has expired.

        Returns:
            Boolean indicating if OTP is expired
        """
        return timezone.now() > self.expires_at

    def is_valid(self):
        """
        Check if OTP is valid (not expired and not verified).

        Returns:
            Boolean indicating if OTP is valid
        """
        return not self.is_expired() and not self.verified

    def increment_attempts(self):
        """Increment the number of verification attempts."""
        self.attempts += 1
        self.save(update_fields=["attempts"])

    def mark_verified(self):
        """Mark the OTP as verified."""
        self.verified = True
        self.save(update_fields=["verified"])

    @classmethod
    def cleanup_expired(cls):
        """
        Delete expired OTP tokens.

        Should be run periodically (e.g., via cron job or celery task).

        Returns:
            Number of deleted tokens
        """
        expired = cls.objects.filter(expires_at__lt=timezone.now())
        count = expired.count()
        expired.delete()
        return count


class RefreshToken(models.Model):
    """
    Model to store JWT refresh tokens.

    Allows token revocation and tracking of user sessions.

    Attributes:
        id: UUID primary key
        user: User the token belongs to
        token_hash: Hashed refresh token
        user_agent: User agent string from request
        ip_address: IP address from request
        created_at: When the token was created
        expires_at: When the token expires
        revoked: Whether the token has been revoked
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="refresh_tokens",
        help_text="User the token belongs to",
    )

    token_hash = models.CharField(
        max_length=64, unique=True, help_text="Hashed refresh token (SHA-256)"
    )

    user_agent = models.TextField(blank=True, help_text="User agent string from request")

    ip_address = models.GenericIPAddressField(
        null=True, blank=True, help_text="IP address from request"
    )

    created_at = models.DateTimeField(default=timezone.now, help_text="When the token was created")

    expires_at = models.DateTimeField(help_text="When the token expires")

    revoked = models.BooleanField(default=False, help_text="Whether the token has been revoked")

    class Meta:
        db_table = "refresh_tokens"
        verbose_name = "Refresh Token"
        verbose_name_plural = "Refresh Tokens"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "revoked"]),
            models.Index(fields=["token_hash"]),
            models.Index(fields=["expires_at"]),
        ]

    def __str__(self):
        """String representation of refresh token."""
        return f"Refresh token for {self.user.phone}"

    def is_expired(self):
        """
        Check if token has expired.

        Returns:
            Boolean indicating if token is expired
        """
        return timezone.now() > self.expires_at

    def is_valid(self):
        """
        Check if token is valid (not expired and not revoked).

        Returns:
            Boolean indicating if token is valid
        """
        return not self.is_expired() and not self.revoked

    def revoke(self):
        """Revoke the token."""
        self.revoked = True
        self.save(update_fields=["revoked"])

    @classmethod
    def cleanup_expired(cls):
        """
        Delete expired refresh tokens.

        Should be run periodically (e.g., via cron job or celery task).

        Returns:
            Number of deleted tokens
        """
        expired = cls.objects.filter(expires_at__lt=timezone.now())
        count = expired.count()
        expired.delete()
        return count

    @classmethod
    def revoke_all_for_user(cls, user):
        """
        Revoke all refresh tokens for a user.

        Useful for logout from all devices or security incidents.

        Args:
            user: User instance

        Returns:
            Number of revoked tokens
        """
        tokens = cls.objects.filter(user=user, revoked=False)
        count = tokens.count()
        tokens.update(revoked=True)
        return count
