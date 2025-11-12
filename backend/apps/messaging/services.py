"""
Business logic services for messaging app.

Design Decisions:
- MessagingService handles message creation and retrieval
- Access control ensures only booking participants can send/view messages
- Attachment URL validation for security
- Pagination support for message history

SOLID Principles:
- Single Responsibility: Service handles messaging domain logic
- Dependency Inversion: Service depends on abstractions (models)
"""

import logging
from typing import List, Dict, Any
from django.core.exceptions import ValidationError, PermissionDenied
from django.core.validators import URLValidator
from django.db.models import QuerySet
from apps.bookings.models import Booking
from apps.users.models import User
from .models import Message

logger = logging.getLogger(__name__)


class MessagingService:
    """
    Service for managing in-app messaging between customers and providers.
    
    Handles message creation, retrieval, and access control.
    """
    
    @staticmethod
    def send_message(
        booking_id: str,
        sender: User,
        content: str,
        attachments: List[str] = None
    ) -> Message:
        """
        Send a message in a booking conversation.
        
        Args:
            booking_id: UUID of the booking
            sender: User sending the message
            content: Text content of the message
            attachments: Optional list of attachment URLs
            
        Returns:
            Created Message instance
            
        Raises:
            ValidationError: If validation fails
            PermissionDenied: If sender is not a booking participant
        """
        # Get booking
        try:
            booking = Booking.objects.select_related(
                'customer',
                'provider',
                'provider__user'
            ).get(id=booking_id)
        except Booking.DoesNotExist:
            raise ValidationError("Booking not found")
        
        # Validate access control
        MessagingService._validate_booking_participant(booking, sender)
        
        # Validate content
        if not content or not content.strip():
            raise ValidationError("Message content cannot be empty")
        
        # Validate attachments
        if attachments:
            MessagingService._validate_attachments(attachments)
        
        # Create message
        message = Message.objects.create(
            booking=booking,
            sender=sender,
            content=content.strip(),
            attachments=attachments or []
        )
        
        logger.info(
            f"Message sent: {message.id} in booking {booking.booking_ref} "
            f"by user {sender.id}"
        )
        
        return message
    
    @staticmethod
    def get_booking_messages(
        booking_id: str,
        user: User,
        limit: int = None,
        offset: int = None
    ) -> QuerySet[Message]:
        """
        Get messages for a booking with pagination.
        
        Args:
            booking_id: UUID of the booking
            user: User requesting messages
            limit: Maximum number of messages to return
            offset: Number of messages to skip
            
        Returns:
            QuerySet of Message instances
            
        Raises:
            ValidationError: If booking not found
            PermissionDenied: If user is not a booking participant
        """
        # Get booking
        try:
            booking = Booking.objects.select_related(
                'customer',
                'provider',
                'provider__user'
            ).get(id=booking_id)
        except Booking.DoesNotExist:
            raise ValidationError("Booking not found")
        
        # Validate access control
        MessagingService._validate_booking_participant(booking, user)
        
        # Get messages
        messages = Message.objects.filter(
            booking=booking
        ).select_related(
            'sender'
        ).order_by('created_at')
        
        # Apply pagination if specified
        if offset is not None:
            messages = messages[offset:]
        if limit is not None:
            messages = messages[:limit]
        
        return messages
    
    @staticmethod
    def _validate_booking_participant(booking: Booking, user: User) -> None:
        """
        Validate that user is a participant in the booking.
        
        Args:
            booking: Booking instance
            user: User to validate
            
        Raises:
            PermissionDenied: If user is not a booking participant
        """
        is_customer = booking.customer.id == user.id
        is_provider = booking.provider.user.id == user.id
        is_admin = user.role == 'ADMIN'
        
        if not (is_customer or is_provider or is_admin):
            raise PermissionDenied(
                "You do not have permission to access messages for this booking"
            )
    
    @staticmethod
    def _validate_attachments(attachments: List[str]) -> None:
        """
        Validate attachment URLs.
        
        Args:
            attachments: List of attachment URLs
            
        Raises:
            ValidationError: If any URL is invalid
        """
        if not isinstance(attachments, list):
            raise ValidationError("Attachments must be a list")
        
        if len(attachments) > 5:
            raise ValidationError("Maximum 5 attachments allowed per message")
        
        url_validator = URLValidator()
        
        for url in attachments:
            if not isinstance(url, str):
                raise ValidationError("Each attachment must be a valid URL string")
            
            try:
                url_validator(url)
            except ValidationError:
                raise ValidationError(f"Invalid attachment URL: {url}")
            
            # Additional security: check for allowed domains/protocols
            if not url.startswith(('http://', 'https://')):
                raise ValidationError(
                    f"Attachment URL must use HTTP or HTTPS protocol: {url}"
                )
