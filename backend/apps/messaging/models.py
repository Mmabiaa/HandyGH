"""
Messaging models for HandyGH.

Design Decisions:
- Message model tied to bookings for context
- Support for text content and attachments
- Indexes on frequently queried fields for performance
- Chronological ordering for chat display

SOLID Principles:
- Single Responsibility: Message model handles message data only
- Open/Closed: Easy to extend with new message types
"""

import uuid
from django.db import models
from django.core.validators import URLValidator
from apps.bookings.models import Booking
from apps.users.models import User


class Message(models.Model):
    """
    Message model for in-app chat between customers and providers.
    
    Messages are tied to bookings to provide context for conversations.
    
    Attributes:
        id: UUID primary key
        booking: Booking this message belongs to
        sender: User who sent the message
        content: Text content of the message
        attachments: JSON array of attachment URLs
        created_at: Message creation timestamp
    """
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text='Unique identifier for the message'
    )
    
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='messages',
        help_text='Booking this message belongs to'
    )
    
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        help_text='User who sent the message'
    )
    
    content = models.TextField(
        help_text='Text content of the message'
    )
    
    attachments = models.JSONField(
        default=list,
        blank=True,
        help_text='Array of attachment URLs'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='Message creation timestamp'
    )
    
    class Meta:
        db_table = 'messages'
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['created_at']  # Chronological order for chat display
        indexes = [
            models.Index(fields=['booking', 'created_at']),
            models.Index(fields=['sender', 'created_at']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Message from {self.sender.name or self.sender.phone} in {self.booking.booking_ref}"
    
    @property
    def has_attachments(self):
        """Check if message has attachments."""
        return bool(self.attachments)
