"""
URL configuration for messaging app.

Design Decisions:
- Messages are nested under bookings (bookings/{id}/messages/)
- RESTful URL structure
- Clear endpoint naming

Routes:
- GET/POST /api/v1/bookings/{booking_id}/messages/ - List/send messages
"""

from django.urls import path
from .views import BookingMessagesView

app_name = 'messaging'

urlpatterns = [
    # Booking messages
    path(
        'bookings/<uuid:booking_id>/messages/',
        BookingMessagesView.as_view(),
        name='booking-messages'
    ),
]
