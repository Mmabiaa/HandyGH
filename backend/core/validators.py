"""
Custom validators for HandyGH.

Design Decisions:
- Reusable validation functions for common patterns
- Clear error messages for better UX
- Phone number validation for Ghana (+233)
- Business logic validation separate from serializers

SOLID Principles:
- Single Responsibility: Each validator checks one specific rule
- Open/Closed: Easy to add new validators
"""

import re

from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_ghana_phone(value):
    """
    Validate Ghana phone number format.

    Accepts formats:
    - +233XXXXXXXXX (E.164 format)
    - 0XXXXXXXXX (local format)

    Args:
        value: Phone number string

    Raises:
        ValidationError: If phone number format is invalid
    """
    # Remove spaces and dashes
    cleaned = re.sub(r"[\s\-]", "", value)

    # Check E.164 format (+233XXXXXXXXX)
    if cleaned.startswith("+233"):
        if len(cleaned) != 13 or not cleaned[1:].isdigit():
            raise ValidationError(
                _("Phone number must be in format +233XXXXXXXXX"), code="invalid_phone"
            )
        return

    # Check local format (0XXXXXXXXX)
    if cleaned.startswith("0"):
        if len(cleaned) != 10 or not cleaned.isdigit():
            raise ValidationError(
                _("Phone number must be in format 0XXXXXXXXX"), code="invalid_phone"
            )
        return

    raise ValidationError(_("Phone number must start with +233 or 0"), code="invalid_phone")


def validate_rating(value):
    """
    Validate rating value is between 1 and 5.

    Args:
        value: Rating integer

    Raises:
        ValidationError: If rating is out of range
    """
    if not isinstance(value, int) or value < 1 or value > 5:
        raise ValidationError(_("Rating must be an integer between 1 and 5"), code="invalid_rating")


def validate_commission_rate(value):
    """
    Validate commission rate is between 0 and 1.

    Args:
        value: Commission rate as decimal (0.1 = 10%)

    Raises:
        ValidationError: If rate is out of range
    """
    if not isinstance(value, (int, float)) or value < 0 or value > 1:
        raise ValidationError(
            _("Commission rate must be between 0 and 1"), code="invalid_commission_rate"
        )


def validate_latitude(value):
    """
    Validate latitude coordinate.

    Args:
        value: Latitude as decimal

    Raises:
        ValidationError: If latitude is out of range
    """
    if not isinstance(value, (int, float)) or value < -90 or value > 90:
        raise ValidationError(_("Latitude must be between -90 and 90"), code="invalid_latitude")


def validate_longitude(value):
    """
    Validate longitude coordinate.

    Args:
        value: Longitude as decimal

    Raises:
        ValidationError: If longitude is out of range
    """
    if not isinstance(value, (int, float)) or value < -180 or value > 180:
        raise ValidationError(_("Longitude must be between -180 and 180"), code="invalid_longitude")


def validate_file_size(value, max_size_mb=5):
    """
    Validate uploaded file size.

    Args:
        value: File object
        max_size_mb: Maximum file size in megabytes

    Raises:
        ValidationError: If file is too large
    """
    if value.size > max_size_mb * 1024 * 1024:
        raise ValidationError(
            _(f"File size must not exceed {max_size_mb}MB"), code="file_too_large"
        )


def validate_image_file(value):
    """
    Validate uploaded file is an image.

    Args:
        value: File object

    Raises:
        ValidationError: If file is not an image
    """
    valid_mime_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]

    if hasattr(value, "content_type"):
        if value.content_type not in valid_mime_types:
            raise ValidationError(
                _("File must be an image (JPEG, PNG, GIF, or WebP)"), code="invalid_image"
            )


def validate_email(value):
    """
    Validate email format with comprehensive checks.

    Args:
        value: Email string

    Raises:
        ValidationError: If email format is invalid
    """
    if not value:
        return

    # Basic email regex pattern
    email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

    if not re.match(email_pattern, value):
        raise ValidationError(_("Enter a valid email address"), code="invalid_email")

    # Check for common typos
    if ".." in value or value.startswith(".") or value.endswith("."):
        raise ValidationError(_("Email address contains invalid characters"), code="invalid_email")


def validate_positive_decimal(value):
    """
    Validate that a decimal value is positive.

    Args:
        value: Decimal or float value

    Raises:
        ValidationError: If value is not positive
    """
    if value is not None and value <= 0:
        raise ValidationError(_("Value must be greater than zero"), code="invalid_positive_value")


def validate_future_datetime(value):
    """
    Validate that a datetime is in the future.

    Args:
        value: Datetime object

    Raises:
        ValidationError: If datetime is in the past
    """
    from django.utils import timezone

    if value and value <= timezone.now():
        raise ValidationError(
            _("Date and time must be in the future"), code="invalid_future_datetime"
        )


def validate_booking_duration(value):
    """
    Validate booking duration is reasonable (between 0.5 and 24 hours).

    Args:
        value: Duration in hours

    Raises:
        ValidationError: If duration is out of range
    """
    if value is not None:
        if value < 0.5:
            raise ValidationError(
                _("Booking duration must be at least 30 minutes"), code="duration_too_short"
            )
        if value > 24:
            raise ValidationError(
                _("Booking duration cannot exceed 24 hours"), code="duration_too_long"
            )


def validate_url(value):
    """
    Validate URL format.

    Args:
        value: URL string

    Raises:
        ValidationError: If URL format is invalid
    """
    if not value:
        return

    url_pattern = r"^https?://[^\s/$.?#].[^\s]*$"

    if not re.match(url_pattern, value, re.IGNORECASE):
        raise ValidationError(
            _("Enter a valid URL starting with http:// or https://"), code="invalid_url"
        )


def validate_otp_code(value):
    """
    Validate OTP code format (6 digits).

    Args:
        value: OTP code string

    Raises:
        ValidationError: If OTP format is invalid
    """
    if not value or not value.isdigit() or len(value) != 6:
        raise ValidationError(_("OTP must be a 6-digit code"), code="invalid_otp")


def validate_password_strength(value):
    """
    Validate password meets security requirements.

    Requirements:
    - At least 8 characters
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one digit

    Args:
        value: Password string

    Raises:
        ValidationError: If password doesn't meet requirements
    """
    if len(value) < 8:
        raise ValidationError(
            _("Password must be at least 8 characters long"), code="password_too_short"
        )

    if not re.search(r"[A-Z]", value):
        raise ValidationError(
            _("Password must contain at least one uppercase letter"), code="password_no_uppercase"
        )

    if not re.search(r"[a-z]", value):
        raise ValidationError(
            _("Password must contain at least one lowercase letter"), code="password_no_lowercase"
        )

    if not re.search(r"\d", value):
        raise ValidationError(
            _("Password must contain at least one digit"), code="password_no_digit"
        )


def validate_business_name(value):
    """
    Validate business name format.

    Args:
        value: Business name string

    Raises:
        ValidationError: If business name is invalid
    """
    if not value:
        return

    if len(value) < 2:
        raise ValidationError(
            _("Business name must be at least 2 characters long"), code="business_name_too_short"
        )

    if len(value) > 100:
        raise ValidationError(
            _("Business name cannot exceed 100 characters"), code="business_name_too_long"
        )

    # Check for valid characters (letters, numbers, spaces, and common punctuation)
    if not re.match(r"^[a-zA-Z0-9\s\-\'&.,]+$", value):
        raise ValidationError(
            _("Business name contains invalid characters"), code="invalid_business_name"
        )
