"""
Provider models for HandyGH.

Design Decisions:
- Provider linked to User model via OneToOne relationship
- Geolocation stored as decimal fields for distance calculations
- Categories stored as JSON for flexibility
- Service pricing supports both hourly and fixed rates
- Rating aggregation stored for performance

SOLID Principles:
- Single Responsibility: Each model handles specific domain
- Open/Closed: Easy to extend with new service types
"""

import uuid

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone

from apps.users.models import User


class ServiceCategory(models.Model):
    """
    Service categories for organizing provider services.

    Examples: Plumbing, Electrical, Cleaning, Tutoring, etc.

    Attributes:
        name: Category name
        slug: URL-friendly identifier
        description: Category description
        icon: Icon identifier or URL
        is_active: Whether category is active
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(
        max_length=100, unique=True, help_text="Category name (e.g., Plumbing, Electrical)"
    )

    slug = models.SlugField(max_length=100, unique=True, help_text="URL-friendly identifier")

    description = models.TextField(blank=True, help_text="Category description")

    icon = models.CharField(max_length=100, blank=True, help_text="Icon identifier or URL")

    is_active = models.BooleanField(default=True, help_text="Whether this category is active")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "service_categories"
        verbose_name = "Service Category"
        verbose_name_plural = "Service Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Provider(models.Model):
    """
    Provider profile for service providers.

    Extends User model with provider-specific information.

    Attributes:
        user: OneToOne relationship with User
        business_name: Business name (optional)
        categories: List of service categories
        latitude: Location latitude
        longitude: Location longitude
        address: Physical address
        verified: Verification status
        verification_doc_url: URL to verification document
        rating_avg: Average rating
        rating_count: Number of ratings
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="provider_profile",
        help_text="User account for this provider",
    )

    business_name = models.CharField(
        max_length=255, blank=True, help_text="Business name (optional)"
    )

    categories = models.JSONField(default=list, help_text="List of service category slugs")

    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=8,
        null=True,
        blank=True,
        help_text="Location latitude for distance calculations",
    )

    longitude = models.DecimalField(
        max_digits=11,
        decimal_places=8,
        null=True,
        blank=True,
        help_text="Location longitude for distance calculations",
    )

    address = models.TextField(blank=True, help_text="Physical address")

    verified = models.BooleanField(default=False, help_text="Whether provider has been verified")

    verification_doc_url = models.URLField(
        blank=True, help_text="URL to verification document (ID, license, etc.)"
    )

    rating_avg = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0.00), MaxValueValidator(5.00)],
        help_text="Average rating (0.00 to 5.00)",
    )

    rating_count = models.IntegerField(
        default=0, validators=[MinValueValidator(0)], help_text="Total number of ratings"
    )

    response_time_avg = models.IntegerField(
        default=0, validators=[MinValueValidator(0)], help_text="Average response time in minutes"
    )

    is_active = models.BooleanField(
        default=True, help_text="Whether provider is accepting bookings"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "providers"
        verbose_name = "Provider"
        verbose_name_plural = "Providers"
        ordering = ["-rating_avg", "-created_at"]
        indexes = [
            models.Index(fields=["latitude", "longitude"]),
            models.Index(fields=["verified"]),
            models.Index(fields=["rating_avg"]),
            models.Index(fields=["is_active"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.business_name or self.user.name} - Provider"

    @property
    def display_name(self):
        """Get display name for provider."""
        return self.business_name or self.user.name or self.user.phone

    def update_rating(self, new_avg: float, new_count: int):
        """
        Update provider rating.

        Args:
            new_avg: New average rating
            new_count: New rating count
        """
        self.rating_avg = new_avg
        self.rating_count = new_count
        self.save(update_fields=["rating_avg", "rating_count", "updated_at"])


class ProviderService(models.Model):
    """
    Services offered by providers.

    Each provider can offer multiple services with different pricing.

    Attributes:
        provider: Provider offering this service
        title: Service title
        description: Service description
        price_type: Pricing model (hourly or fixed)
        price_amount: Price in local currency
        duration_estimate_min: Estimated duration in minutes
        is_active: Whether service is available
    """

    PRICE_TYPE_CHOICES = [
        ("HOURLY", "Hourly Rate"),
        ("FIXED", "Fixed Price"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    provider = models.ForeignKey(
        Provider,
        on_delete=models.CASCADE,
        related_name="services",
        help_text="Provider offering this service",
    )

    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name="services",
        help_text="Service category",
    )

    title = models.CharField(
        max_length=255, help_text='Service title (e.g., "Emergency Plumbing Repair")'
    )

    description = models.TextField(help_text="Detailed service description")

    price_type = models.CharField(
        max_length=10, choices=PRICE_TYPE_CHOICES, default="FIXED", help_text="Pricing model"
    )

    price_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0.00)],
        help_text="Price in GHS",
    )

    duration_estimate_min = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Estimated duration in minutes",
    )

    is_active = models.BooleanField(
        default=True, help_text="Whether this service is currently available"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "provider_services"
        verbose_name = "Provider Service"
        verbose_name_plural = "Provider Services"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["provider", "is_active"]),
            models.Index(fields=["category"]),
            models.Index(fields=["price_type"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.title} by {self.provider.display_name}"

    @property
    def price_display(self):
        """Get formatted price display."""
        if self.price_type == "HOURLY":
            return f"GHS {self.price_amount}/hour"
        return f"GHS {self.price_amount}"
