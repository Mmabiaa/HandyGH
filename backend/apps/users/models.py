"""
User models for HandyGH.

Design Decisions:
- Custom User model extending AbstractBaseUser for flexibility
- UUID primary keys for security and scalability
- Role-based user types (CUSTOMER, PROVIDER, ADMIN)
- Phone number as primary identifier (common in Ghana)
- Email optional (not all users have email)

SOLID Principles:
- Single Responsibility: User model handles user data only
- Open/Closed: Easy to extend with additional fields
- Liskov Substitution: Properly extends AbstractBaseUser
"""

import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone

from core.validators import validate_ghana_phone


class UserManager(BaseUserManager):
    """
    Custom manager for User model.

    Provides methods to create users and superusers with proper validation.
    """

    def create_user(self, phone, password=None, **extra_fields):
        """
        Create and save a regular user.

        Args:
            phone: Phone number (required)
            password: Password (optional for OTP-only users)
            **extra_fields: Additional fields

        Returns:
            User instance

        Raises:
            ValueError: If phone is not provided
        """
        if not phone:
            raise ValueError("Phone number is required")

        # Normalize phone number
        from core.utils import normalize_phone_number

        phone = normalize_phone_number(phone)

        # Normalize email if provided
        email = extra_fields.get("email")
        if email:
            email = self.normalize_email(email)
            extra_fields["email"] = email

        user = self.model(phone=phone, **extra_fields)

        if password:
            user.set_password(password)

        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        """
        Create and save a superuser.

        Args:
            phone: Phone number (required)
            password: Password (required for superuser)
            **extra_fields: Additional fields

        Returns:
            User instance with admin privileges
        """
        extra_fields.setdefault("role", "ADMIN")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("role") != "ADMIN":
            raise ValueError("Superuser must have role=ADMIN")
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")

        return self.create_user(phone, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model for HandyGH.

    Uses phone number as the primary identifier instead of username.
    Supports three user roles: CUSTOMER, PROVIDER, ADMIN.

    Attributes:
        id: UUID primary key
        phone: Phone number (unique, required)
        email: Email address (unique, optional)
        name: Full name
        role: User role (CUSTOMER, PROVIDER, ADMIN)
        is_active: Account active status
        is_staff: Staff status for admin access
        created_at: Account creation timestamp
        updated_at: Last update timestamp
    """

    ROLE_CHOICES = [
        ("CUSTOMER", "Customer"),
        ("PROVIDER", "Provider"),
        ("ADMIN", "Admin"),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the user",
    )

    phone = models.CharField(
        max_length=20,
        unique=True,
        validators=[validate_ghana_phone],
        help_text="Phone number in format +233XXXXXXXXX or 0XXXXXXXXX",
    )

    email = models.EmailField(
        unique=True, null=True, blank=True, help_text="Email address (optional)"
    )

    name = models.CharField(max_length=255, blank=True, help_text="Full name of the user")

    role = models.CharField(
        max_length=20, choices=ROLE_CHOICES, default="CUSTOMER", help_text="User role in the system"
    )

    is_active = models.BooleanField(
        default=True, help_text="Designates whether this user should be treated as active"
    )

    is_staff = models.BooleanField(
        default=False, help_text="Designates whether the user can log into the admin site"
    )

    created_at = models.DateTimeField(
        default=timezone.now, help_text="Date and time when the user was created"
    )

    updated_at = models.DateTimeField(
        auto_now=True, help_text="Date and time when the user was last updated"
    )

    # Specify the field to use as username
    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = []  # Phone is already required as USERNAME_FIELD

    objects = UserManager()

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["phone"]),
            models.Index(fields=["email"]),
            models.Index(fields=["role"]),
            models.Index(fields=["is_active"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        """String representation of user."""
        return f"{self.name or self.phone} ({self.role})"

    def get_full_name(self):
        """Return the full name of the user."""
        return self.name or self.phone

    def get_short_name(self):
        """Return the short name of the user."""
        if self.name:
            return self.name.split()[0]
        return self.phone

    @property
    def is_customer(self):
        """Check if user is a customer."""
        return self.role == "CUSTOMER"

    @property
    def is_provider(self):
        """Check if user is a provider."""
        return self.role == "PROVIDER"

    @property
    def is_admin(self):
        """Check if user is an admin."""
        return self.role == "ADMIN"

    def deactivate(self):
        """Deactivate the user account."""
        self.is_active = False
        self.save(update_fields=["is_active", "updated_at"])

    def activate(self):
        """Activate the user account."""
        self.is_active = True
        self.save(update_fields=["is_active", "updated_at"])


class UserProfile(models.Model):
    """
    Extended profile information for users.

    Stores additional user information that's not part of the core User model.

    Attributes:
        user: One-to-one relationship with User
        profile_picture: URL to profile picture
        address: Physical address
        date_of_birth: Date of birth
        preferences: JSON field for user preferences
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
        help_text="User this profile belongs to",
    )

    profile_picture = models.URLField(blank=True, help_text="URL to profile picture")

    address = models.TextField(blank=True, help_text="Physical address")

    date_of_birth = models.DateField(null=True, blank=True, help_text="Date of birth")

    preferences = models.JSONField(
        default=dict, blank=True, help_text="User preferences and settings"
    )

    created_at = models.DateTimeField(auto_now_add=True, help_text="Profile creation timestamp")

    updated_at = models.DateTimeField(auto_now=True, help_text="Profile last update timestamp")

    class Meta:
        db_table = "user_profiles"
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

    def __str__(self):
        """String representation of user profile."""
        return f"Profile for {self.user}"
