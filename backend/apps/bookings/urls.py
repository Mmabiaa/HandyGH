"""
URL configuration for bookings app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.bookings.views import BookingViewSet
from apps.reviews.views import CreateReviewView

app_name = 'bookings'

router = DefaultRouter()
router.register(r'', BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
    # Create review for a booking
    path(
        '<uuid:booking_id>/reviews/',
        CreateReviewView.as_view(),
        name='create-review'
    ),
]
