"""
Business logic services for reviews app.

Design Decisions:
- ReviewService handles review creation and validation
- RatingAggregationService handles provider rating updates
- Validation ensures only completed bookings can be reviewed
- Prevents duplicate reviews per booking

SOLID Principles:
- Single Responsibility: Each service handles specific domain logic
- Dependency Inversion: Services depend on abstractions (models)
"""

import logging
from typing import Dict, Any
from decimal import Decimal
from django.db import transaction
from django.db.models import Avg, Count
from django.core.exceptions import ValidationError
from apps.bookings.models import Booking
from apps.users.models import User
from apps.providers.models import Provider
from .models import Review

logger = logging.getLogger(__name__)


class ReviewService:
    """
    Service for managing customer reviews.
    
    Handles review creation with validation to ensure:
    - Booking is completed
    - Customer is the booking owner
    - No duplicate reviews
    """
    
    @staticmethod
    def create_review(
        booking_id: str,
        customer: User,
        rating: int,
        comment: str = ""
    ) -> Review:
        """
        Create a review for a completed booking.
        
        Args:
            booking_id: UUID of the booking
            customer: User creating the review
            rating: Rating from 1 to 5
            comment: Optional review text
            
        Returns:
            Created Review instance
            
        Raises:
            ValidationError: If validation fails
        """
        try:
            # Get booking
            booking = Booking.objects.select_related(
                'customer',
                'provider',
                'provider__user'
            ).get(id=booking_id)
        except Booking.DoesNotExist:
            raise ValidationError("Booking not found")
        
        # Validate review eligibility
        ReviewService.validate_review_eligibility(booking, customer)
        
        # Prevent duplicate reviews
        ReviewService.prevent_duplicate_reviews(booking)
        
        # Validate rating
        if not (1 <= rating <= 5):
            raise ValidationError("Rating must be between 1 and 5")
        
        # Create review
        with transaction.atomic():
            review = Review.objects.create(
                booking=booking,
                customer=customer,
                provider=booking.provider,
                rating=rating,
                comment=comment.strip()
            )
            
            # Update provider rating
            RatingAggregationService.update_provider_rating(booking.provider.id)
            
            logger.info(
                f"Review created: {review.id} for booking {booking.booking_ref} "
                f"by customer {customer.id}"
            )
            
            return review
    
    @staticmethod
    def validate_review_eligibility(booking: Booking, customer: User) -> None:
        """
        Validate that a booking can be reviewed.
        
        Args:
            booking: Booking to validate
            customer: User attempting to create review
            
        Raises:
            ValidationError: If booking cannot be reviewed
        """
        # Check if customer owns the booking
        if booking.customer.id != customer.id:
            raise ValidationError("You can only review your own bookings")
        
        # Check if booking is completed
        if booking.status != 'COMPLETED':
            raise ValidationError(
                f"Only completed bookings can be reviewed. "
                f"Current status: {booking.get_status_display()}"
            )
    
    @staticmethod
    def prevent_duplicate_reviews(booking: Booking) -> None:
        """
        Prevent duplicate reviews for the same booking.
        
        Args:
            booking: Booking to check
            
        Raises:
            ValidationError: If review already exists
        """
        if hasattr(booking, 'review'):
            raise ValidationError(
                "This booking has already been reviewed"
            )
    
    @staticmethod
    def get_provider_reviews(
        provider_id: str,
        limit: int = None
    ) -> 'QuerySet[Review]':
        """
        Get reviews for a provider.
        
        Args:
            provider_id: UUID of the provider
            limit: Optional limit on number of reviews
            
        Returns:
            QuerySet of Review instances
        """
        queryset = Review.objects.filter(
            provider_id=provider_id
        ).select_related(
            'customer',
            'booking'
        ).order_by('-created_at')
        
        if limit:
            queryset = queryset[:limit]
        
        return queryset
    
    @staticmethod
    def get_review_by_id(review_id: str) -> Review:
        """
        Get a review by ID.
        
        Args:
            review_id: UUID of the review
            
        Returns:
            Review instance
            
        Raises:
            Review.DoesNotExist: If review not found
        """
        return Review.objects.select_related(
            'customer',
            'provider',
            'provider__user',
            'booking'
        ).get(id=review_id)


class RatingAggregationService:
    """
    Service for aggregating provider ratings.
    
    Calculates and updates provider average ratings based on all reviews.
    """
    
    @staticmethod
    def update_provider_rating(provider_id: str) -> Dict[str, Any]:
        """
        Update provider's average rating and count.
        
        Calculates the average rating from all reviews and updates
        the provider's rating_avg and rating_count fields.
        
        Args:
            provider_id: UUID of the provider
            
        Returns:
            Dictionary with updated rating info:
                - rating_avg: New average rating
                - rating_count: Total number of reviews
        """
        try:
            provider = Provider.objects.get(id=provider_id)
        except Provider.DoesNotExist:
            logger.error(f"Provider not found: {provider_id}")
            raise ValidationError("Provider not found")
        
        # Calculate aggregated rating using database functions
        aggregation = Review.objects.filter(
            provider_id=provider_id
        ).aggregate(
            avg_rating=Avg('rating'),
            total_reviews=Count('id')
        )
        
        avg_rating = aggregation['avg_rating'] or Decimal('0.00')
        total_reviews = aggregation['total_reviews'] or 0
        
        # Round to 2 decimal places
        avg_rating = round(Decimal(avg_rating), 2)
        
        # Update provider
        provider.rating_avg = avg_rating
        provider.rating_count = total_reviews
        provider.save(update_fields=['rating_avg', 'rating_count', 'updated_at'])
        
        logger.info(
            f"Updated provider {provider_id} rating: "
            f"{avg_rating} ({total_reviews} reviews)"
        )
        
        return {
            'rating_avg': float(avg_rating),
            'rating_count': total_reviews
        }
    
    @staticmethod
    def get_provider_rating_stats(provider_id: str) -> Dict[str, Any]:
        """
        Get detailed rating statistics for a provider.
        
        Args:
            provider_id: UUID of the provider
            
        Returns:
            Dictionary with rating statistics:
                - rating_avg: Average rating
                - rating_count: Total reviews
                - rating_distribution: Count per rating (1-5)
        """
        try:
            provider = Provider.objects.get(id=provider_id)
        except Provider.DoesNotExist:
            raise ValidationError("Provider not found")
        
        # Get rating distribution
        reviews = Review.objects.filter(provider_id=provider_id)
        
        distribution = {
            '5': reviews.filter(rating=5).count(),
            '4': reviews.filter(rating=4).count(),
            '3': reviews.filter(rating=3).count(),
            '2': reviews.filter(rating=2).count(),
            '1': reviews.filter(rating=1).count(),
        }
        
        return {
            'rating_avg': float(provider.rating_avg),
            'rating_count': provider.rating_count,
            'rating_distribution': distribution
        }
