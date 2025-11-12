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
    cleaned = re.sub(r'[\s\-]', '', value)
    
    # Check E.164 format (+233XXXXXXXXX)
    if cleaned.startswith('+233'):
        if len(cleaned) != 13 or not cleaned[1:].isdigit():
            raise ValidationError(
                _('Phone number must be in format +233XXXXXXXXX'),
                code='invalid_phone'
            )
        return
    
    # Check local format (0XXXXXXXXX)
    if cleaned.startswith('0'):
        if len(cleaned) != 10 or not cleaned.isdigit():
            raise ValidationError(
                _('Phone number must be in format 0XXXXXXXXX'),
                code='invalid_phone'
            )
        return
    
    raise ValidationError(
        _('Phone number must start with +233 or 0'),
        code='invalid_phone'
    )


def validate_rating(value):
    """
    Validate rating value is between 1 and 5.
    
    Args:
        value: Rating integer
        
    Raises:
        ValidationError: If rating is out of range
    """
    if not isinstance(value, int) or value < 1 or value > 5:
        raise ValidationError(
            _('Rating must be an integer between 1 and 5'),
            code='invalid_rating'
        )


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
            _('Commission rate must be between 0 and 1'),
            code='invalid_commission_rate'
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
        raise ValidationError(
            _('Latitude must be between -90 and 90'),
            code='invalid_latitude'
        )


def validate_longitude(value):
    """
    Validate longitude coordinate.
    
    Args:
        value: Longitude as decimal
        
    Raises:
        ValidationError: If longitude is out of range
    """
    if not isinstance(value, (int, float)) or value < -180 or value > 180:
        raise ValidationError(
            _('Longitude must be between -180 and 180'),
            code='invalid_longitude'
        )


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
            _(f'File size must not exceed {max_size_mb}MB'),
            code='file_too_large'
        )


def validate_image_file(value):
    """
    Validate uploaded file is an image.
    
    Args:
        value: File object
        
    Raises:
        ValidationError: If file is not an image
    """
    valid_mime_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    
    if hasattr(value, 'content_type'):
        if value.content_type not in valid_mime_types:
            raise ValidationError(
                _('File must be an image (JPEG, PNG, GIF, or WebP)'),
                code='invalid_image'
            )
