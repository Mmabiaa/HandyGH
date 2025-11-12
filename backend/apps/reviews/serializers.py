"""
Serializers for reviews app.

Design Decisions:
- Separate serializers for create and read operations
- Nested serializers for related objects (customer, provider)
- Validation in serializers for API layer
- Read-only fields for immutable data

SOLID Principles:
- Single Responsibility: Each serializer handles specific use case
- Open/Closed: Easy to extend with new fields
"""

from rest_framework import serializers
from apps.users.models import User
from apps.providers.models import Provider
from apps.bookings.models import Booking
from .models import Review


class CustomerSerializer(serializers.ModelSerializer):
    """Serializer for customer information in reviews."""
    
    class Meta:
        model = User
        fields = ['id', 'name', 'phone']
        read_only_fields = ['id', 'name', 'phone']


class ProviderSerializer(serializers.ModelSerializer):
    """Serializer for provider information in reviews."""
    
    display_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Provider
        fields = ['id', 'business_name', 'display_name']
        read_only_fields = ['id', 'business_name', 'display_name']


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for booking information in reviews."""
    
    class Meta:
        model = Booking
        fields = ['id', 'booking_ref', 'scheduled_start']
        read_only_fields = ['id', 'booking_ref', 'scheduled_start']


class ReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for Review model (read operations).
    
    Includes nested customer, provider, and booking information.
    """
    
    customer = CustomerSerializer(read_only=True)
    provider = ProviderSerializer(read_only=True)
    booking = BookingSerializer(read_only=True)
    rating_display = serializers.CharField(read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id',
            'booking',
            'customer',
            'provider',
            'rating',
            'rating_display',
            'comment',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'booking',
            'customer',
            'provider',
            'created_at',
        ]


class CreateReviewSerializer(serializers.Serializer):
    """
    Serializer for creating reviews.
    
    Validates rating and comment fields.
    """
    
    rating = serializers.IntegerField(
        min_value=1,
        max_value=5,
        required=True,
        help_text='Rating from 1 to 5 stars'
    )
    
    comment = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=2000,
        help_text='Optional review text (max 2000 characters)'
    )
    
    def validate_rating(self, value):
        """Validate rating is within range."""
        if not (1 <= value <= 5):
            raise serializers.ValidationError(
                "Rating must be between 1 and 5"
            )
        return value
    
    def validate_comment(self, value):
        """Validate and clean comment."""
        if value:
            value = value.strip()
            if len(value) > 2000:
                raise serializers.ValidationError(
                    "Comment must not exceed 2000 characters"
                )
        return value


class ProviderRatingStatsSerializer(serializers.Serializer):
    """
    Serializer for provider rating statistics.
    """
    
    rating_avg = serializers.FloatField(
        help_text='Average rating (0.00 to 5.00)'
    )
    
    rating_count = serializers.IntegerField(
        help_text='Total number of reviews'
    )
    
    rating_distribution = serializers.DictField(
        child=serializers.IntegerField(),
        help_text='Count of reviews per rating (1-5)'
    )
