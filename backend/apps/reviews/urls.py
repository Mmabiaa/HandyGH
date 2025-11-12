"""
URL configuration for reviews app.
"""

from django.urls import path
from .views import (
    CreateReviewView,
    ProviderReviewsListView,
    ReviewDetailView,
    ProviderRatingStatsView,
)

app_name = 'reviews'

urlpatterns = [
    # Create review for a booking
    path(
        'bookings/<uuid:booking_id>/reviews/',
        CreateReviewView.as_view(),
        name='create-review'
    ),
    
    # Get reviews for a provider
    path(
        'providers/<uuid:provider_id>/reviews/',
        ProviderReviewsListView.as_view(),
        name='provider-reviews'
    ),
    
    # Get provider rating statistics
    path(
        'providers/<uuid:provider_id>/rating-stats/',
        ProviderRatingStatsView.as_view(),
        name='provider-rating-stats'
    ),
    
    # Get review details
    path(
        'reviews/<uuid:review_id>/',
        ReviewDetailView.as_view(),
        name='review-detail'
    ),
]
