"""
Serializers for authentication app.
"""

from rest_framework import serializers
from core.validators import validate_ghana_phone, validate_otp_code


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
        validators=[validate_otp_code],
        help_text='6-digit OTP code'
    )


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



class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for password reset request.
    
    Initiates password reset by sending OTP to phone.
    """
    
    phone = serializers.CharField(
        required=True,
        validators=[validate_ghana_phone],
        help_text='Phone number in format +233XXXXXXXXX or 0XXXXXXXXX'
    )


class PasswordResetVerifySerializer(serializers.Serializer):
    """
    Serializer for password reset OTP verification.
    
    Verifies OTP and returns reset token.
    """
    
    phone = serializers.CharField(
        required=True,
        validators=[validate_ghana_phone],
        help_text='Phone number'
    )
    
    otp = serializers.CharField(
        required=True,
        min_length=6,
        max_length=6,
        help_text='6-digit OTP code'
    )
    
    def validate_otp(self, value):
        """Validate OTP is numeric."""
        if not value.isdigit():
            raise serializers.ValidationError('OTP must be numeric')
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for password reset confirmation.
    
    Sets new password using reset token.
    """
    
    phone = serializers.CharField(
        required=True,
        validators=[validate_ghana_phone],
        help_text='Phone number'
    )
    
    reset_token = serializers.CharField(
        required=True,
        help_text='Reset token from OTP verification'
    )
    
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
        help_text='New password (minimum 8 characters)'
    )
    
    confirm_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        help_text='Confirm new password'
    )
    
    def validate(self, data):
        """
        Validate that passwords match.
        
        Args:
            data: Serializer data
            
        Returns:
            Validated data
            
        Raises:
            ValidationError: If passwords don't match
        """
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match'
            })
        return data
