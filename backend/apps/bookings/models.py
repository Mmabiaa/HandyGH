"""
Booking models for HandyGH.

Design Decisions:
- Booking model tracks complete lifecycle of service bookings
- Status field with predefined choices for state management
- BookingStatusHistory for audit trail of all status changes
- Unique booking reference for customer-facing identification
- Indexes on frequently queried fields for performance

SOLID Principles:
- Single Responsibility: Each model handles specific domain
- Open/Closed: Easy to extend with new status types
"""

import secrets
import uuid

from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from apps.providers.models import Provider, ProviderService
from apps.users.models import User


class Booking(models.Model):
    """
    Booking model for service bookings.

    Tracks the complete lifecycle of a booking from request to completion.

    Attributes:
        id: UUID primary key
        booking_ref: Unique customer-facing reference
        customer: User who made the booking
        provider: Provider fulfilling the booking
        provider_service: Service being booked
        status: Current booking status
        scheduled_start: When service is scheduled to start
        scheduled_end: When service is scheduled to end
        address: Location where service will be performed
        notes: Additional notes from customer
        total_amount: Total booking amount
        commission_amount: Platform commission
        payment_status: Payment status
        created_at: Booking creation timestamp
        updated_at: Last update timestamp
    """

    STATUS_CHOICES = [
        ("REQUESTED", "Requested"),
        ("CONFIRMED", "Confirmed"),
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
        ("DISPUTED", "Disputed"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("AUTHORIZED", "Authorized"),
        ("PAID", "Paid"),
        ("FAILED", "Failed"),
        ("REFUNDED", "Refunded"),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the booking",
    )

    booking_ref = models.CharField(
        max_length=50, unique=True, help_text="Unique customer-facing booking reference"
    )

    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="customer_bookings",
        help_text="Customer who made the booking",
    )

    provider = models.ForeignKey(
        Provider,
        on_delete=models.CASCADE,
        related_name="provider_bookings",
        help_text="Provider fulfilling the booking",
    )

    provider_service = models.ForeignKey(
        ProviderService,
        on_delete=models.CASCADE,
        related_name="bookings",
        help_text="Service being booked",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="REQUESTED",
        help_text="Current booking status",
    )

    scheduled_start = models.DateTimeField(help_text="When service is scheduled to start")

    scheduled_end = models.DateTimeField(
        null=True, blank=True, help_text="When service is scheduled to end"
    )

    address = models.TextField(help_text="Location where service will be performed")

    notes = models.TextField(blank=True, help_text="Additional notes from customer")

    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0.00)],
        help_text="Total booking amount in GHS",
    )

    commission_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0.00)],
        help_text="Platform commission amount in GHS",
    )

    payment_status = models.CharField(
        max_length=20, choices=PAYMENT_STATUS_CHOICES, default="PENDING", help_text="Payment status"
    )

    created_at = models.DateTimeField(auto_now_add=True, help_text="Booking creation timestamp")

    updated_at = models.DateTimeField(auto_now=True, help_text="Last update timestamp")

    class Meta:
        db_table = "bookings"
        verbose_name = "Booking"
        verbose_name_plural = "Bookings"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["booking_ref"]),
            models.Index(fields=["customer", "status"]),
            models.Index(fields=["provider", "status"]),
            models.Index(fields=["status"]),
            models.Index(fields=["scheduled_start"]),
            models.Index(fields=["payment_status"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"Booking {self.booking_ref} - {self.status}"

    @property
    def is_active(self):
        """Check if booking is in an active state."""
        return self.status in ["REQUESTED", "CONFIRMED", "IN_PROGRESS"]

    @property
    def can_be_cancelled(self):
        """Check if booking can be cancelled."""
        return self.status in ["REQUESTED", "CONFIRMED"]

    @property
    def can_be_reviewed(self):
        """Check if booking can be reviewed."""
        return self.status == "COMPLETED"


class BookingStatusHistory(models.Model):
    """
    Audit trail for booking status changes.

    Records all status transitions for compliance and debugging.

    Attributes:
        id: UUID primary key
        booking: Booking this history entry belongs to
        from_status: Previous status
        to_status: New status
        changed_by: User who made the change
        reason: Reason for status change
        created_at: When the change occurred
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="status_history",
        help_text="Booking this history entry belongs to",
    )

    from_status = models.CharField(
        max_length=20,
        choices=Booking.STATUS_CHOICES,
        null=True,
        blank=True,
        help_text="Previous status (null for initial creation)",
    )

    to_status = models.CharField(
        max_length=20, choices=Booking.STATUS_CHOICES, help_text="New status"
    )

    changed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="booking_status_changes",
        help_text="User who made the change",
    )

    reason = models.TextField(blank=True, help_text="Reason for status change")

    created_at = models.DateTimeField(auto_now_add=True, help_text="When the change occurred")

    class Meta:
        db_table = "booking_status_history"
        verbose_name = "Booking Status History"
        verbose_name_plural = "Booking Status Histories"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["booking", "created_at"]),
            models.Index(fields=["to_status"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.booking.booking_ref}: {self.from_status} → {self.to_status}"
