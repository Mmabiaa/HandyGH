"""
Serializers for authentication app.
"""

from rest_framework import serializers

from apps.users.models import User
from core.utils import normalize_phone_number
from core.validators import validate_ghana_phone, validate_otp_code


class SignupRequestSerializer(serializers.Serializer):
    """
    Serializer for signup request.

    Validates user registration data and checks for existing accounts.
    """

    name = serializers.CharField(
        required=True,
        min_length=2,
        max_length=255,
        help_text="User's full name (minimum 2 characters)",
    )

    email = serializers.EmailField(
        required=False,
        allow_blank=True,
        help_text="User's email address (optional)",
    )

    phone = serializers.CharField(
        required=True,
        validators=[validate_ghana_phone],
        help_text="Phone number in format +233XXXXXXXXX or 0XXXXXXXXX",
    )

    role = serializers.ChoiceField(
        choices=["CUSTOMER", "PROVIDER"],
        required=True,
        help_text="User role (CUSTOMER or PROVIDER)",
    )

    def validate_name(self, value):
        """Validate name contains only letters, spaces, and hyphens."""
        if not all(c.isalpha() or c.isspace() or c == "-" for c in value):
            raise serializers.ValidationError("Name can only contain letters, spaces, and hyphens")
        return value.strip()

    def validate_phone(self, value):
        """Check if user already exists with this phone number."""
        normalized_phone = normalize_phone_number(value)

        if User.objects.filter(phone=normalized_phone).exists():
            raise serializers.ValidationError(
                "An account with this phone number already exists. Please log in instead."
            )

        return value


class SignupVerifySerializer(serializers.Serializer):
    """
    Serializer for signup OTP verification.

    Validates phone and OTP during signup completion.
    """

    phone = serializers.CharField(
        required=True,
        validators=[validate_ghana_phone],
        help_text="Phone number in format +233XXXXXXXXX or 0XXXXXXXXX",
    )

    otp = serializers.CharField(
        required=True,
        min_length=6,
        max_length=6,
        validators=[validate_otp_code],
        help_text="6-digit OTP code",
    )


class LoginRequestSerializer(serializers.Serializer):
    """
    Serializer for login request.

    Validates phone number and checks if user exists.
    """

    phone = serializers.CharField(
        required=True,
        validators=[validate_ghana_phone],
        help_text="Phone number in format +233XXXXXXXXX or 0XXXXXXXXX",
    )

    def validate_phone(self, value):
        """Check if user exists with this phone number."""
        normalized_phone = normalize_phone_number(value)

        if not User.objects.filter(phone=normalized_phone).exists():
            raise serializers.ValidationError(
                "No account found with this phone number. Please sign up first."
            )

        return value


class LoginVerifySerializer(serializers.Serializer):
    """
    Serializer for login OTP verification.

    Validates phone and OTP during login.
    """

    phone = serializers.CharField(
        required=True,
        validators=[validate_ghana_phone],
        help_text="Phone number in format +233XXXXXXXXX or 0XXXXXXXXX",
    )

    otp = serializers.CharField(
        required=True,
        min_length=6,
        max_length=6,
        validators=[validate_otp_code],
        help_text="6-digit OTP code",
    )


class OTPRequestSerializer(serializers.Serializer):
    """
    Serializer for OTP request.

    Validates phone number and initiates OTP sending.
    """

    phone = serializers.CharField(
        required=True,
        validators=[validate_ghana_phone],
        help_text="Phone number in format +233XXXXXXXXX or 0XXXXXXXXX",
    )


class OTPVerifySerializer(serializers.Serializer):
    """
    Serializer for OTP verification.

    Validates phone number and OTP code.
    """

    phone = serializers.CharField(
        required=True,
        validators=[validate_ghana_phone],
        help_text="Phone number in format +233XXXXXXXXX or 0XXXXXXXXX",
    )

    otp = serializers.CharField(
        required=True,
        min_length=6,
        max_length=6,
        validators=[validate_otp_code],
        help_text="6-digit OTP code",
    )


class TokenRefreshSerializer(serializers.Serializer):
    """
    Serializer for token refresh.

    Validates refresh token.
    """

    refresh_token = serializers.CharField(
        required=True, help_text="Refresh token to exchange for new access token"
    )


class LogoutSerializer(serializers.Serializer):
    """
    Serializer for logout.

    Validates refresh token for revocation.
    """

    refresh_token = serializers.CharField(required=True, help_text="Refresh token to revoke")


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for password reset request.

    Initiates password reset by sending OTP to phone.
    """

    phone = serializers.CharField(
        required=True,
        validators=[validate_ghana_phone],
        help_text="Phone number in format +233XXXXXXXXX or 0XXXXXXXXX",
    )


class PasswordResetVerifySerializer(serializers.Serializer):
    """
    Serializer for password reset OTP verification.

    Verifies OTP and returns reset token.
    """

    phone = serializers.CharField(
        required=True, validators=[validate_ghana_phone], help_text="Phone number"
    )

    otp = serializers.CharField(
        required=True, min_length=6, max_length=6, help_text="6-digit OTP code"
    )

    def validate_otp(self, value):
        """Validate OTP is numeric."""
        if not value.isdigit():
            raise serializers.ValidationError("OTP must be numeric")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for password reset confirmation.

    Sets new password using reset token.
    """

    phone = serializers.CharField(
        required=True, validators=[validate_ghana_phone], help_text="Phone number"
    )

    reset_token = serializers.CharField(
        required=True, help_text="Reset token from OTP verification"
    )

    new_password = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
        help_text="New password (minimum 8 characters)",
    )

    confirm_password = serializers.CharField(
        required=True,
        write_only=True,
        style={"input_type": "password"},
        help_text="Confirm new password",
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
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})
        return data
