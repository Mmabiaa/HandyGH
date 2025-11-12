"""
Booking serializers for HandyGH API.

Design Decisions:
- Separate serializers for create, list, and detail views
- Nested serializers for related objects (customer, provider, service)
- Read-only fields for calculated values
- Validation at serializer level

SOLID Principles:
- Single Responsibility: Each serializer handles specific use case
- Open/Closed: Easy to extend with new fields
"""

from rest_framework import serializers
from django.utils import timezone
from apps.bookings.models import Booking, BookingStatusHistory
from apps.providers.models import ProviderService
from apps.users.serializers import UserSerializer
from apps.providers.serializers import ProviderSerializer, ProviderServiceSerializer
from core.validators import validate_future_datetime, validate_booking_duration


class BookingStatusHistorySerializer(serializers.ModelSerializer):
    """Serializer for booking status history."""
    
    changed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = BookingStatusHistory
        fields = [
            'id',
            'from_status',
            'to_status',
            'changed_by',
            'reason',
            'created_at'
        ]
        read_only_fields = fields


class BookingListSerializer(serializers.ModelSerializer):
    """Serializer for listing bookings (minimal data)."""
    
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    provider_name = serializers.CharField(source='provider.display_name', read_only=True)
    service_title = serializers.CharField(source='provider_service.title', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id',
            'booking_ref',
            'customer_name',
            'provider_name',
            'service_title',
            'status',
            'scheduled_start',
            'scheduled_end',
            'total_amount',
            'payment_status',
            'created_at'
        ]
        read_only_fields = fields


class BookingDetailSerializer(serializers.ModelSerializer):
    """Serializer for booking details (full data)."""
    
    customer = UserSerializer(read_only=True)
    provider = ProviderSerializer(read_only=True)
    provider_service = ProviderServiceSerializer(read_only=True)
    status_history = BookingStatusHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id',
            'booking_ref',
            'customer',
            'provider',
            'provider_service',
            'status',
            'scheduled_start',
            'scheduled_end',
            'address',
            'notes',
            'total_amount',
            'commission_amount',
            'payment_status',
            'status_history',
            'created_at',
            'updated_at'
        ]
        read_only_fields = fields


class BookingCreateSerializer(serializers.Serializer):
    """Serializer for creating bookings."""
    
    provider_service_id = serializers.UUIDField(
        required=True,
        help_text='UUID of the provider service to book'
    )
    scheduled_start = serializers.DateTimeField(
        required=True,
        validators=[validate_future_datetime],
        help_text='Start date and time for the booking (must be in the future)'
    )
    scheduled_end = serializers.DateTimeField(
        required=False,
        allow_null=True,
        help_text='End date and time for the booking (optional if duration_hours is provided)'
    )
    duration_hours = serializers.FloatField(
        required=False,
        allow_null=True,
        validators=[validate_booking_duration],
        help_text='Duration in hours (0.5 to 24 hours, optional if scheduled_end is provided)'
    )
    address = serializers.CharField(
        required=True,
        max_length=500,
        help_text='Service location address'
    )
    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=1000,
        help_text='Additional notes or requirements for the booking'
    )
    
    def validate(self, data):
        """Validate that either scheduled_end or duration_hours is provided."""
        scheduled_end = data.get('scheduled_end')
        duration_hours = data.get('duration_hours')
        
        if scheduled_end and duration_hours:
            raise serializers.ValidationError(
                "Provide either scheduled_end or duration_hours, not both"
            )
        
        if scheduled_end:
            scheduled_start = data.get('scheduled_start')
            if scheduled_end <= scheduled_start:
                raise serializers.ValidationError(
                    "Scheduled end time must be after start time"
                )
        
        return data


class BookingUpdateStatusSerializer(serializers.Serializer):
    """Serializer for updating booking status."""
    
    status = serializers.ChoiceField(
        choices=Booking.STATUS_CHOICES,
        required=True
    )
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500
    )


class BookingAcceptSerializer(serializers.Serializer):
    """Serializer for accepting a booking."""
    
    # No fields needed, just action confirmation
    pass


class BookingDeclineSerializer(serializers.Serializer):
    """Serializer for declining a booking."""
    
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
        help_text="Reason for declining the booking"
    )
