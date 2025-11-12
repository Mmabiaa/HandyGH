"""
Dispute models for HandyGH.

Design Decisions:
- Dispute model tracks disputes raised against bookings
- Status field with predefined choices for workflow management
- Evidence stored as JSON for flexibility
- Unique constraint on booking_id to prevent duplicate disputes
- Indexes on frequently queried fields for performance

SOLID Principles:
- Single Responsibility: Each model handles specific domain
- Open/Closed: Easy to extend with new status types
"""

import uuid
from django.db import models
from django.core.validators import MinLengthValidator
from django.utils import timezone
from apps.bookings.models import Booking
from apps.users.models import User


class Dispute(models.Model):
    """
    Dispute model for booking disputes.
    
    Tracks disputes raised by customers or providers against bookings.
    
    Attributes:
        id: UUID primary key
        booking: Booking this dispute is about
        raised_by: User who raised the dispute
        reason: Short reason for the dispute
        description: Detailed description of the issue
        evidence: JSON field for evidence URLs and metadata
        status: Current dispute status
        resolution: Admin's resolution text
        resolved_by: Admin who resolved the dispute
        resolved_at: When the dispute was resolved
        created_at: Dispute creation timestamp
        updated_at: Last update timestamp
    """
    
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('INVESTIGATING', 'Investigating'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    ]
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text='Unique identifier for the dispute'
    )
    
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='dispute',
        help_text='Booking this dispute is about'
    )
    
    raised_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='disputes_raised',
        help_text='User who raised the dispute'
    )
    
    reason = models.CharField(
        max_length=255,
        validators=[MinLengthValidator(5)],
        help_text='Short reason for the dispute'
    )
    
    description = models.TextField(
        validators=[MinLengthValidator(20)],
        help_text='Detailed description of the issue'
    )
    
    evidence = models.JSONField(
        default=list,
        blank=True,
        help_text='Evidence URLs and metadata (photos, documents, etc.)'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='OPEN',
        help_text='Current dispute status'
    )
    
    resolution = models.TextField(
        blank=True,
        help_text="Admin's resolution text"
    )
    
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='disputes_resolved',
        help_text='Admin who resolved the dispute'
    )
    
    resolved_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When the dispute was resolved'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='Dispute creation timestamp'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text='Last update timestamp'
    )
    
    class Meta:
        db_table = 'disputes'
        verbose_name = 'Dispute'
        verbose_name_plural = 'Disputes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['booking']),
            models.Index(fields=['raised_by', 'status']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['booking'],
                name='unique_booking_dispute'
            )
        ]
    
    def __str__(self):
        return f"Dispute #{self.id} - {self.booking.booking_ref} ({self.status})"
    
    @property
    def is_open(self):
        """Check if dispute is open."""
        return self.status in ['OPEN', 'INVESTIGATING']
    
    @property
    def is_resolved(self):
        """Check if dispute is resolved."""
        return self.status in ['RESOLVED', 'CLOSED']
    
    @property
    def days_since_created(self):
        """Calculate days since dispute was created."""
        return (timezone.now() - self.created_at).days
