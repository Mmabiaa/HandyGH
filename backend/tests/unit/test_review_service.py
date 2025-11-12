"""
Unit tests for ReviewService.

Tests review creation, validation, and eligibility checks.
"""

import pytest
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from apps.reviews.services import ReviewService
from apps.reviews.models import Review
from apps.bookings.models import Booking


@pytest.mark.django_db
class TestReviewService:
    """Test ReviewService functionality."""
    
    def test_create_review_success(self, customer, provider, booking):
        """Test successful review creation."""
        # Update booking to completed status
        booking.status = 'COMPLETED'
        booking.save()
        
        # Create review
        review = ReviewService.create_review(
            booking_id=str(booking.id),
            customer=customer,
            rating=5,
            comment='Excellent service!'
        )
        
        assert review is not None
        assert review.booking == booking
        assert review.customer == customer
        assert review.provider == provider
        assert review.rating == 5
        assert review.comment == 'Excellent service!'
        
        # Verify provider rating was updated
        provider.refresh_from_db()
        assert provider.rating_avg == Decimal('5.00')
        assert provider.rating_count == 1
    
    def test_create_review_not_completed(self, customer, booking):
        """Test review creation fails for non-completed booking."""
        # Booking is in REQUESTED status
        with pytest.raises(ValidationError) as exc_info:
            ReviewService.create_review(
                booking_id=str(booking.id),
                customer=customer,
                rating=5,
                comment='Test'
            )
        
        assert 'Only completed bookings can be reviewed' in str(exc_info.value)
    
    def test_create_review_wrong_customer(self, customer_user, booking):
        """Test review creation fails for wrong customer."""
        # Update booking to completed
        booking.status = 'COMPLETED'
        booking.save()
        
        # Try to create review with different customer
        with pytest.raises(ValidationError) as exc_info:
            ReviewService.create_review(
                booking_id=str(booking.id),
                customer=customer_user,
                rating=5,
                comment='Test'
            )
        
        assert 'You can only review your own bookings' in str(exc_info.value)
    
    def test_create_review_duplicate(self, customer, provider, booking):
        """Test duplicate review prevention."""
        # Update booking to completed
        booking.status = 'COMPLETED'
        booking.save()
        
        # Create first review
        ReviewService.create_review(
            booking_id=str(booking.id),
            customer=customer,
            rating=5,
            comment='First review'
        )
        
        # Try to create second review
        with pytest.raises(ValidationError) as exc_info:
            ReviewService.create_review(
                booking_id=str(booking.id),
                customer=customer,
                rating=4,
                comment='Second review'
            )
        
        assert 'This booking has already been reviewed' in str(exc_info.value)
    
    def test_create_review_invalid_rating(self, customer, booking):
        """Test review creation with invalid rating."""
        booking.status = 'COMPLETED'
        booking.save()
        
        # Test rating too low
        with pytest.raises(ValidationError) as exc_info:
            ReviewService.create_review(
                booking_id=str(booking.id),
                customer=customer,
                rating=0,
                comment='Test'
            )
        
        assert 'Rating must be between 1 and 5' in str(exc_info.value)
        
        # Test rating too high
        with pytest.raises(ValidationError) as exc_info:
            ReviewService.create_review(
                booking_id=str(booking.id),
                customer=customer,
                rating=6,
                comment='Test'
            )
        
        assert 'Rating must be between 1 and 5' in str(exc_info.value)
    
    def test_create_review_booking_not_found(self, customer):
        """Test review creation with non-existent booking."""
        with pytest.raises(ValidationError) as exc_info:
            ReviewService.create_review(
                booking_id='00000000-0000-0000-0000-000000000000',
                customer=customer,
                rating=5,
                comment='Test'
            )
        
        assert 'Booking not found' in str(exc_info.value)
    
    def test_create_review_empty_comment(self, customer, provider, booking):
        """Test review creation with empty comment."""
        booking.status = 'COMPLETED'
        booking.save()
        
        review = ReviewService.create_review(
            booking_id=str(booking.id),
            customer=customer,
            rating=4,
            comment=''
        )
        
        assert review.comment == ''
        assert review.rating == 4
    
    def test_get_provider_reviews(self, customer, provider, booking):
        """Test getting provider reviews."""
        # Create multiple completed bookings and reviews
        booking.status = 'COMPLETED'
        booking.save()
        
        review1 = ReviewService.create_review(
            booking_id=str(booking.id),
            customer=customer,
            rating=5,
            comment='Great service'
        )
        
        # Create another booking and review
        booking2 = Booking.objects.create(
            booking_ref='BK-TEST456',
            customer=customer,
            provider=provider,
            provider_service=booking.provider_service,
            status='COMPLETED',
            scheduled_start=timezone.now() + timedelta(days=2),
            scheduled_end=timezone.now() + timedelta(days=2, hours=2),
            address='456 Test Street',
            total_amount=Decimal('150.00'),
            payment_status='PAID'
        )
        
        review2 = ReviewService.create_review(
            booking_id=str(booking2.id),
            customer=customer,
            rating=4,
            comment='Good service'
        )
        
        # Get reviews
        reviews = ReviewService.get_provider_reviews(str(provider.id))
        
        assert reviews.count() == 2
        assert review2 in reviews  # Most recent first
        assert review1 in reviews
    
    def test_get_provider_reviews_with_limit(self, customer, provider, booking):
        """Test getting provider reviews with limit."""
        booking.status = 'COMPLETED'
        booking.save()
        
        ReviewService.create_review(
            booking_id=str(booking.id),
            customer=customer,
            rating=5,
            comment='Review 1'
        )
        
        reviews = ReviewService.get_provider_reviews(str(provider.id), limit=1)
        
        assert reviews.count() == 1
    
    def test_get_review_by_id(self, customer, provider, booking):
        """Test getting review by ID."""
        booking.status = 'COMPLETED'
        booking.save()
        
        created_review = ReviewService.create_review(
            booking_id=str(booking.id),
            customer=customer,
            rating=5,
            comment='Test review'
        )
        
        fetched_review = ReviewService.get_review_by_id(str(created_review.id))
        
        assert fetched_review.id == created_review.id
        assert fetched_review.rating == 5
        assert fetched_review.comment == 'Test review'
    
    def test_get_review_by_id_not_found(self):
        """Test getting non-existent review."""
        with pytest.raises(Review.DoesNotExist):
            ReviewService.get_review_by_id('00000000-0000-0000-0000-000000000000')
