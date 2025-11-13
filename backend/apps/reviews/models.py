"""
Review models for HandyGH.

Design Decisions:
- Review model linked to completed bookings
- One review per booking (unique constraint)
- Rating constrained to 1-5 range
- Reviews immutable after creation (no updates)
- Indexes on frequently queried fields

SOLID Principles:
- Single Responsibility: Review model handles review data only
- Open/Closed: Easy to extend with additional fields
"""

import uuid

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone

from apps.bookings.models import Booking
from apps.providers.models import Provider
from apps.users.models import User


class Review(models.Model):
    """
    Customer review for a completed booking.

    Each booking can have only one review. Reviews are created after
    booking completion and cannot be modified.

    Attributes:
        id: UUID primary key
        booking: Booking being reviewed (unique)
        customer: Customer who wrote the review
        provider: Provider being reviewed
        rating: Rating from 1 to 5
        comment: Review text (optional)
        created_at: Review creation timestamp
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the review",
    )

    booking = models.OneToOneField(
        Booking, on_delete=models.CASCADE, related_name="review", help_text="Booking being reviewed"
    )

    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reviews_written",
        help_text="Customer who wrote the review",
    )

    provider = models.ForeignKey(
        Provider,
        on_delete=models.CASCADE,
        related_name="reviews_received",
        help_text="Provider being reviewed",
    )

    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars",
    )

    comment = models.TextField(blank=True, help_text="Review text (optional)")

    created_at = models.DateTimeField(auto_now_add=True, help_text="Review creation timestamp")

    class Meta:
        db_table = "reviews"
        verbose_name = "Review"
        verbose_name_plural = "Reviews"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["booking"]),
            models.Index(fields=["customer"]),
            models.Index(fields=["provider", "-created_at"]),
            models.Index(fields=["rating"]),
            models.Index(fields=["created_at"]),
        ]
        constraints = [
            models.UniqueConstraint(fields=["booking"], name="unique_booking_review"),
            models.CheckConstraint(
                check=models.Q(rating__gte=1, rating__lte=5), name="rating_range_1_to_5"
            ),
        ]

    def __str__(self):
        return f"Review by {self.customer.name} for {self.provider.display_name} - {self.rating}★"

    @property
    def rating_display(self):
        """Get star rating display."""
        return "★" * self.rating + "☆" * (5 - self.rating)
