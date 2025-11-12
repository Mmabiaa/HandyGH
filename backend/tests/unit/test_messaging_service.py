"""
Unit tests for MessagingService.

Tests message creation, retrieval, and access control.
"""

import pytest
from django.core.exceptions import ValidationError, PermissionDenied
from apps.messaging.services import MessagingService
from apps.messaging.models import Message


@pytest.mark.django_db
class TestMessagingService:
    """Test MessagingService functionality."""
    
    def test_send_message_success(self, customer, booking):
        """Test successful message sending."""
        message = MessagingService.send_message(
            booking_id=str(booking.id),
            sender=customer,
            content='Hello, when can you start?',
            attachments=[]
        )
        
        assert message is not None
        assert message.booking == booking
        assert message.sender == customer
        assert message.content == 'Hello, when can you start?'
        assert message.attachments == []
    
    def test_send_message_with_attachments(self, customer, booking):
        """Test sending message with attachments."""
        attachments = [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg'
        ]
        
        message = MessagingService.send_message(
            booking_id=str(booking.id),
            sender=customer,
            content='Here are some photos',
            attachments=attachments
        )
        
        assert message.attachments == attachments
        assert message.has_attachments is True
    
    def test_send_message_empty_content(self, customer, booking):
        """Test sending message with empty content fails."""
        with pytest.raises(ValidationError) as exc_info:
            MessagingService.send_message(
                booking_id=str(booking.id),
                sender=customer,
                content='   ',
                attachments=[]
            )
        
        assert 'Message content cannot be empty' in str(exc_info.value)
    
    def test_send_message_invalid_booking(self, customer):
        """Test sending message to non-existent booking fails."""
        with pytest.raises(ValidationError) as exc_info:
            MessagingService.send_message(
                booking_id='00000000-0000-0000-0000-000000000000',
                sender=customer,
                content='Test message',
                attachments=[]
            )
        
        assert 'Booking not found' in str(exc_info.value)
    
    def test_send_message_not_participant(self, customer_user, booking):
        """Test sending message by non-participant fails."""
        with pytest.raises(PermissionDenied) as exc_info:
            MessagingService.send_message(
                booking_id=str(booking.id),
                sender=customer_user,
                content='Test message',
                attachments=[]
            )
        
        assert 'You do not have permission' in str(exc_info.value)
    
    def test_send_message_too_many_attachments(self, customer, booking):
        """Test sending message with too many attachments fails."""
        attachments = [
            f'https://example.com/image{i}.jpg'
            for i in range(6)
        ]
        
        with pytest.raises(ValidationError) as exc_info:
            MessagingService.send_message(
                booking_id=str(booking.id),
                sender=customer,
                content='Too many attachments',
                attachments=attachments
            )
        
        assert 'Maximum 5 attachments allowed' in str(exc_info.value)
    
    def test_send_message_invalid_attachment_url(self, customer, booking):
        """Test sending message with invalid attachment URL fails."""
        with pytest.raises(ValidationError) as exc_info:
            MessagingService.send_message(
                booking_id=str(booking.id),
                sender=customer,
                content='Invalid attachment',
                attachments=['not-a-valid-url']
            )
        
        assert 'Invalid attachment URL' in str(exc_info.value)
    
    def test_send_message_invalid_protocol(self, customer, booking):
        """Test sending message with invalid protocol fails."""
        with pytest.raises(ValidationError) as exc_info:
            MessagingService.send_message(
                booking_id=str(booking.id),
                sender=customer,
                content='Invalid protocol',
                attachments=['ftp://example.com/file.txt']
            )
        
        assert 'must use HTTP or HTTPS protocol' in str(exc_info.value)
    
    def test_get_booking_messages_success(self, customer, provider_user, booking):
        """Test retrieving booking messages."""
        # Send some messages
        msg1 = MessagingService.send_message(
            booking_id=str(booking.id),
            sender=customer,
            content='First message',
            attachments=[]
        )
        
        msg2 = MessagingService.send_message(
            booking_id=str(booking.id),
            sender=provider_user,
            content='Second message',
            attachments=[]
        )
        
        # Retrieve messages as customer
        messages = MessagingService.get_booking_messages(
            booking_id=str(booking.id),
            user=customer
        )
        
        assert messages.count() == 2
        assert list(messages) == [msg1, msg2]
    
    def test_get_booking_messages_with_pagination(self, customer, booking):
        """Test retrieving messages with pagination."""
        # Send multiple messages
        for i in range(10):
            MessagingService.send_message(
                booking_id=str(booking.id),
                sender=customer,
                content=f'Message {i}',
                attachments=[]
            )
        
        # Get first 5 messages
        messages = MessagingService.get_booking_messages(
            booking_id=str(booking.id),
            user=customer,
            limit=5,
            offset=0
        )
        
        assert len(list(messages)) == 5
        
        # Get next 5 messages
        messages = MessagingService.get_booking_messages(
            booking_id=str(booking.id),
            user=customer,
            limit=5,
            offset=5
        )
        
        assert len(list(messages)) == 5
    
    def test_get_booking_messages_not_participant(self, customer_user, booking):
        """Test retrieving messages by non-participant fails."""
        with pytest.raises(PermissionDenied) as exc_info:
            MessagingService.get_booking_messages(
                booking_id=str(booking.id),
                user=customer_user
            )
        
        assert 'You do not have permission' in str(exc_info.value)
    
    def test_get_booking_messages_invalid_booking(self, customer):
        """Test retrieving messages for non-existent booking fails."""
        with pytest.raises(ValidationError) as exc_info:
            MessagingService.get_booking_messages(
                booking_id='00000000-0000-0000-0000-000000000000',
                user=customer
            )
        
        assert 'Booking not found' in str(exc_info.value)
    
    def test_admin_can_access_messages(self, admin_user, customer, booking):
        """Test admin can access any booking messages."""
        # Send a message
        MessagingService.send_message(
            booking_id=str(booking.id),
            sender=customer,
            content='Test message',
            attachments=[]
        )
        
        # Admin should be able to retrieve messages
        messages = MessagingService.get_booking_messages(
            booking_id=str(booking.id),
            user=admin_user
        )
        
        assert messages.count() == 1
    
    def test_message_ordering(self, customer, provider_user, booking):
        """Test messages are ordered chronologically."""
        # Send messages in sequence
        msg1 = MessagingService.send_message(
            booking_id=str(booking.id),
            sender=customer,
            content='First',
            attachments=[]
        )
        
        msg2 = MessagingService.send_message(
            booking_id=str(booking.id),
            sender=provider_user,
            content='Second',
            attachments=[]
        )
        
        msg3 = MessagingService.send_message(
            booking_id=str(booking.id),
            sender=customer,
            content='Third',
            attachments=[]
        )
        
        # Retrieve messages
        messages = list(MessagingService.get_booking_messages(
            booking_id=str(booking.id),
            user=customer
        ))
        
        # Verify chronological order
        assert messages[0].id == msg1.id
        assert messages[1].id == msg2.id
        assert messages[2].id == msg3.id
