"""
URL configuration for providers app.

Design Decisions:
- Use DRF routers for automatic URL generation
- Nested routes for provider services
- Separate endpoints for categories
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProviderViewSet, ProviderServiceViewSet, ServiceCategoryViewSet
from apps.reviews.views import ProviderReviewsListView, ProviderRatingStatsView

app_name = 'providers'

# Create router and register viewsets
router = DefaultRouter()
router.register(r'categories', ServiceCategoryViewSet, basename='category')
router.register(r'services', ProviderServiceViewSet, basename='service')
router.register(r'', ProviderViewSet, basename='provider')

urlpatterns = [
    path('', include(router.urls)),
    # Get reviews for a provider
    path(
        '<uuid:provider_id>/reviews/',
        ProviderReviewsListView.as_view(),
        name='provider-reviews'
    ),
    # Get provider rating statistics
    path(
        '<uuid:provider_id>/rating-stats/',
        ProviderRatingStatsView.as_view(),
        name='provider-rating-stats'
    ),
]
