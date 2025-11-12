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
    # Get review details
    path(
        '<uuid:review_id>/',
        ReviewDetailView.as_view(),
        name='review-detail'
    ),
]
