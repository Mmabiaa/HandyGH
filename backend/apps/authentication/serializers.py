"""
Serializers for authentication app.
"""

from rest_framework import serializers
from core.validators import validate_ghana_phone


class OTPRequestSerializer(serializers.Serializer):
    """
    Serializer for OTP request.
    
    Validates phone number and initiates OTP sending.
    """
    
    phone = serializers.CharField(
        required=True,
        validators=[validate_ghana_phone],
        help_text='Phone number in format +233XXXXXXXXX or 0XXXXXXXXX'
    )


class OTPVerifySerializer(serializers.Serializer):
    """
    Serializer for OTP verification.
    
    Validates phone number and OTP code.
    """
    
    phone = serializers.CharField(
        required=True,
        validators=[validate_ghana_phone],
        help_text='Phone number in format +233XXXXXXXXX or 0XXXXXXXXX'
    )
    
    otp = serializers.CharField(
        required=True,
        min_length=6,
        max_length=6,
        help_text='6-digit OTP code'
    )
    
    def validate_otp(self, value):
        """
        Validate OTP is numeric.
        
        Args:
            value: OTP code
            
        Returns:
            Validated OTP
            
        Raises:
            ValidationError: If OTP is not numeric
        """
        if not value.isdigit():
            raise serializers.ValidationError('OTP must be numeric')
        return value


class TokenRefreshSerializer(serializers.Serializer):
    """
    Serializer for token refresh.
    
    Validates refresh token.
    """
    
    refresh_token = serializers.CharField(
        required=True,
        help_text='Refresh token to exchange for new access token'
    )


class LogoutSerializer(serializers.Serializer):
    """
    Serializer for logout.
    
    Validates refresh token for revocation.
    """
    
    refresh_token = serializers.CharField(
        required=True,
        help_text='Refresh token to revoke'
    )
