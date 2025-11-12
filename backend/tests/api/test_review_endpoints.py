"""
API tests for review endpoints.

Tests review creation, listing, and retrieval endpoints.
"""

import pytest
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from apps.reviews.models import Review
from apps.bookings.models import Booking


@pytest.mark.django_db
class TestCreateReviewEndpoint:
    """Test POST /api/v1/bookings/{booking_id}/reviews/"""
    
    def test_create_review_success(self, api_client, customer, customer_token, booking):
        """Test successful review creation."""
        # Update booking to completed
        booking.status = 'COMPLETED'
        booking.save()
        
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        url = f'/api/v1/bookings/{booking.id}/reviews/'
        data = {
            'rating': 5,
            'comment': 'Excellent service! Very professional.'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['success'] is True
        assert response.data['data']['rating'] == 5
        assert response.data['data']['comment'] == 'Excellent service! Very professional.'
        
        # Verify review was created
        assert Review.objects.filter(booking=booking).exists()
    
    def test_create_review_without_comment(self, api_client, customer, customer_token, booking):
        """Test review creation without comment."""
        booking.status = 'COMPLETED'
        booking.save()
        
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        url = f'/api/v1/bookings/{booking.id}/reviews/'
        data = {'rating': 4}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['data']['rating'] == 4
        assert response.data['data']['comment'] == ''
    
    def test_create_review_unauthenticated(self, api_client, booking):
        """Test review creation without authentication."""
        booking.status = 'COMPLETED'
        booking.save()
        
        url = f'/api/v1/bookings/{booking.id}/reviews/'
        data = {'rating': 5, 'comment': 'Test'}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_create_review_not_completed(self, api_client, customer, customer_token, booking):
        """Test review creation for non-completed booking."""
        # Booking is in REQUESTED status
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        url = f'/api/v1/bookings/{booking.id}/reviews/'
        data = {'rating': 5, 'comment': 'Test'}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'Only completed bookings can be reviewed' in str(response.data)
    
    def test_create_review_invalid_rating(self, api_client, customer, customer_token, booking):
        """Test review creation with invalid rating."""
        booking.status = 'COMPLETED'
        booking.save()
        
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        url = f'/api/v1/bookings/{booking.id}/reviews/'
        
        # Test rating too low
        data = {'rating': 0, 'comment': 'Test'}
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        
        # Test rating too high
        data = {'rating': 6, 'comment': 'Test'}
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_create_review_duplicate(self, api_client, customer, customer_token, booking):
        """Test duplicate review prevention."""
        booking.status = 'COMPLETED'
        booking.save()
        
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        url = f'/api/v1/bookings/{booking.id}/reviews/'
        data = {'rating': 5, 'comment': 'First review'}
        
        # Create first review
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        
        # Try to create second review
        data = {'rating': 4, 'comment': 'Second review'}
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'already been reviewed' in str(response.data)
    
    def test_create_review_wrong_customer(self, api_client, customer_user, booking):
        """Test review creation by wrong customer."""
        from apps.authentication.services import JWTService
        
        booking.status = 'COMPLETED'
        booking.save()
        
        # Use different customer token
        tokens = JWTService.create_tokens(customer_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        url = f'/api/v1/bookings/{booking.id}/reviews/'
        data = {'rating': 5, 'comment': 'Test'}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'You can only review your own bookings' in str(response.data)
    
    def test_create_review_missing_rating(self, api_client, customer, customer_token, booking):
        """Test review creation without rating."""
        booking.status = 'COMPLETED'
        booking.save()
        
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        url = f'/api/v1/bookings/{booking.id}/reviews/'
        data = {'comment': 'Test comment'}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestProviderReviewsListEndpoint:
    """Test GET /api/v1/providers/{provider_id}/reviews/"""
    
    def test_list_provider_reviews(self, api_client, customer, customer_token, provider, booking):
        """Test listing provider reviews."""
        # Create multiple reviews
        booking.status = 'COMPLETED'
        booking.save()
        
        Review.objects.create(
            booking=booking,
            customer=customer,
            provider=provider,
            rating=5,
            comment='Great service'
        )
        
        # Create another booking and review
        booking2 = Booking.objects.create(
            booking_ref='BK-LIST1',
            customer=customer,
            provider=provider,
            provider_service=booking.provider_service,
            status='COMPLETED',
            scheduled_start=timezone.now() + timedelta(days=1),
            scheduled_end=timezone.now() + timedelta(days=1, hours=2),
            address='Test Address',
            total_amount=Decimal('100.00'),
            payment_status='PAID'
        )
        
        Review.objects.create(
            booking=booking2,
            customer=customer,
            provider=provider,
            rating=4,
            comment='Good service'
        )
        
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        url = f'/api/v1/providers/{provider.id}/reviews/'
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
    
    def test_list_provider_reviews_empty(self, api_client, customer_token, provider):
        """Test listing reviews for provider with no reviews."""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        url = f'/api/v1/providers/{provider.id}/reviews/'
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 0
    
    def test_list_provider_reviews_unauthenticated(self, api_client, provider):
        """Test listing reviews without authentication."""
        url = f'/api/v1/providers/{provider.id}/reviews/'
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_list_provider_reviews_pagination(self, api_client, customer, customer_token, provider, booking):
        """Test review list pagination."""
        # Create multiple reviews
        for i in range(25):
            new_booking = Booking.objects.create(
                booking_ref=f'BK-PAGE{i}',
                customer=customer,
                provider=provider,
                provider_service=booking.provider_service,
                status='COMPLETED',
                scheduled_start=timezone.now() + timedelta(days=i),
                scheduled_end=timezone.now() + timedelta(days=i, hours=2),
                address=f'{i} Test Street',
                total_amount=Decimal('100.00'),
                payment_status='PAID'
            )
            
            Review.objects.create(
                booking=new_booking,
                customer=customer,
                provider=provider,
                rating=5,
                comment=f'Review {i}'
            )
        
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        url = f'/api/v1/providers/{provider.id}/reviews/'
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 20  # Default page size
        assert response.data['count'] == 25


@pytest.mark.django_db
class TestReviewDetailEndpoint:
    """Test GET /api/v1/reviews/{review_id}/"""
    
    def test_get_review_detail(self, api_client, customer, customer_token, provider, booking):
        """Test getting review details."""
        booking.status = 'COMPLETED'
        booking.save()
        
        review = Review.objects.create(
            booking=booking,
            customer=customer,
            provider=provider,
            rating=5,
            comment='Excellent work'
        )
        
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        url = f'/api/v1/reviews/{review.id}/'
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert response.data['data']['id'] == str(review.id)
        assert response.data['data']['rating'] == 5
        assert response.data['data']['comment'] == 'Excellent work'
    
    def test_get_review_detail_not_found(self, api_client, customer_token):
        """Test getting non-existent review."""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        url = '/api/v1/reviews/00000000-0000-0000-0000-000000000000/'
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_get_review_detail_unauthenticated(self, api_client, customer, provider, booking):
        """Test getting review without authentication."""
        booking.status = 'COMPLETED'
        booking.save()
        
        review = Review.objects.create(
            booking=booking,
            customer=customer,
            provider=provider,
            rating=5,
            comment='Test'
        )
        
        url = f'/api/v1/reviews/{review.id}/'
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestProviderRatingStatsEndpoint:
    """Test GET /api/v1/providers/{provider_id}/rating-stats/"""
    
    def test_get_rating_stats(self, api_client, customer, customer_token, provider, booking):
        """Test getting provider rating statistics."""
        # Create reviews with different ratings
        for i, rating in enumerate([5, 4, 5, 3, 5], start=1):
            new_booking = Booking.objects.create(
                booking_ref=f'BK-STAT{i}',
                customer=customer,
                provider=provider,
                provider_service=booking.provider_service,
                status='COMPLETED',
                scheduled_start=timezone.now() + timedelta(days=i),
                scheduled_end=timezone.now() + timedelta(days=i, hours=2),
                address=f'{i} Stat Street',
                total_amount=Decimal('100.00'),
                payment_status='PAID'
            )
            
            Review.objects.create(
                booking=new_booking,
                customer=customer,
                provider=provider,
                rating=rating,
                comment=f'Review {i}'
            )
        
        # Update provider rating
        from apps.reviews.services import RatingAggregationService
        RatingAggregationService.update_provider_rating(str(provider.id))
        
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        url = f'/api/v1/providers/{provider.id}/rating-stats/'
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert response.data['data']['rating_count'] == 5
        assert response.data['data']['rating_avg'] == 4.4
        
        distribution = response.data['data']['rating_distribution']
        assert distribution['5'] == 3
        assert distribution['4'] == 1
        assert distribution['3'] == 1
    
    def test_get_rating_stats_no_reviews(self, api_client, customer_token, provider):
        """Test getting stats for provider with no reviews."""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        url = f'/api/v1/providers/{provider.id}/rating-stats/'
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['rating_count'] == 0
        assert response.data['data']['rating_avg'] == 0.0
    
    def test_get_rating_stats_unauthenticated(self, api_client, provider):
        """Test getting stats without authentication."""
        url = f'/api/v1/providers/{provider.id}/rating-stats/'
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
