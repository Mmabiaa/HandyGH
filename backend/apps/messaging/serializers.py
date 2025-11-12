"""
Serializers for messaging app.

Design Decisions:
- Separate serializers for create and read operations
- Nested serializers for sender information
- Validation in serializers for API layer
- Read-only fields for immutable data

SOLID Principles:
- Single Responsibility: Each serializer handles specific use case
- Open/Closed: Easy to extend with new fields
"""

from rest_framework import serializers
from apps.users.models import User
from apps.bookings.models import Booking
from .models import Message


class SenderSerializer(serializers.ModelSerializer):
    """Serializer for sender information in messages."""
    
    class Meta:
        model = User
        fields = ['id', 'name', 'phone', 'role']
        read_only_fields = ['id', 'name', 'phone', 'role']


class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for Message model (read operations).
    
    Includes nested sender information.
    """
    
    sender = SenderSerializer(read_only=True)
    has_attachments = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id',
            'booking',
            'sender',
            'content',
            'attachments',
            'has_attachments',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'booking',
            'sender',
            'created_at',
        ]


class CreateMessageSerializer(serializers.Serializer):
    """
    Serializer for creating messages.
    
    Validates content and attachments before message creation.
    """
    
    content = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=5000,
        help_text='Text content of the message'
    )
    
    attachments = serializers.ListField(
        child=serializers.URLField(),
        required=False,
        allow_empty=True,
        max_length=5,
        help_text='List of attachment URLs (max 5)'
    )
    
    def validate_content(self, value):
        """Validate message content."""
        if not value or not value.strip():
            raise serializers.ValidationError("Message content cannot be empty")
        return value.strip()
    
    def validate_attachments(self, value):
        """Validate attachments."""
        if value and len(value) > 5:
            raise serializers.ValidationError("Maximum 5 attachments allowed")
        
        # Validate each URL
        for url in value:
            if not url.startswith(('http://', 'https://')):
                raise serializers.ValidationError(
                    f"Attachment URL must use HTTP or HTTPS protocol: {url}"
                )
        
        return value


class MessageListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for message lists.
    
    Used for paginated message lists with minimal data.
    """
    
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    sender_id = serializers.UUIDField(source='sender.id', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id',
            'sender_id',
            'sender_name',
            'content',
            'attachments',
            'created_at',
        ]
        read_only_fields = fields
