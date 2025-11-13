"""
URL configuration for reviews app.
"""

from django.urls import path

from .views import (
    CreateReviewView,
    ProviderRatingStatsView,
    ProviderReviewsListView,
    ReviewDetailView,
)

app_name = "reviews"

urlpatterns = [
    # Get review details
    path("<uuid:review_id>/", ReviewDetailView.as_view(), name="review-detail"),
]
