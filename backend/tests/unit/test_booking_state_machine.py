"""
Unit tests for BookingStateMachine.

Tests state transitions and validation logic.
"""

import pytest
from django.core.exceptions import ValidationError

from apps.bookings.services import BookingStateMachine
from apps.bookings.models import Booking, BookingStatusHistory


@pytest.mark.django_db
class TestBookingStateMachine:
    """Test suite for BookingStateMachine."""
    
    def test_can_transition_valid(self):
        """Test valid state transitions."""
        assert BookingStateMachine.can_transition('REQUESTED', 'CONFIRMED') is True
        assert BookingStateMachine.can_transition('REQUESTED', 'CANCELLED') is True
        assert BookingStateMachine.can_transition('CONFIRMED', 'IN_PROGRESS') is True
        assert BookingStateMachine.can_transition('IN_PROGRESS', 'COMPLETED') is True
    
    def test_can_transition_invalid(self):
        """Test invalid state transitions."""
        assert BookingStateMachine.can_transition('REQUESTED', 'COMPLETED') is False
        assert BookingStateMachine.can_transition('CANCELLED', 'CONFIRMED') is False
        assert BookingStateMachine.can_transition('COMPLETED', 'IN_PROGRESS') is False
    
    def test_transition_status_success(self, booking, customer):
        """Test successful status transition."""
        booking.status = 'REQUESTED'
        booking.save()
        
        updated_booking = BookingStateMachine.transition_status(
            booking=booking,
            new_status='CONFIRMED',
            changed_by=customer,
            reason='Test transition'
        )
        
        assert updated_booking.status == 'CONFIRMED'
        
        # Check history was logged
        history = BookingStatusHistory.objects.filter(
            booking=booking,
            to_status='CONFIRMED'
        )
        assert history.count() == 1
        assert history.first().from_status == 'REQUESTED'
    
    def test_transition_status_invalid_fails(self, booking, customer):
        """Test that invalid transitions raise error."""
        booking.status = 'REQUESTED'
        booking.save()
        
        with pytest.raises(ValidationError, match="Cannot transition"):
            BookingStateMachine.transition_status(
                booking=booking,
                new_status='COMPLETED',
                changed_by=customer
            )
    
    def test_accept_booking(self, booking, provider_user):
        """Test accepting a booking."""
        booking.status = 'REQUESTED'
        booking.save()
        
        updated_booking = BookingStateMachine.accept_booking(
            booking=booking,
            provider_user=provider_user
        )
        
        assert updated_booking.status == 'CONFIRMED'
        
        # Check history
        history = BookingStatusHistory.objects.filter(
            booking=booking,
            to_status='CONFIRMED'
        ).first()
        assert history is not None
        assert 'accepted' in history.reason.lower()
    
    def test_decline_booking(self, booking, provider_user):
        """Test declining a booking."""
        booking.status = 'REQUESTED'
        booking.save()
        
        updated_booking = BookingStateMachine.decline_booking(
            booking=booking,
            provider_user=provider_user,
            reason='Not available'
        )
        
        assert updated_booking.status == 'CANCELLED'
        
        # Check history
        history = BookingStatusHistory.objects.filter(
            booking=booking,
            to_status='CANCELLED'
        ).first()
        assert history is not None
        assert 'Not available' in history.reason
    
    def test_start_booking(self, booking, provider_user):
        """Test starting a booking."""
        booking.status = 'CONFIRMED'
        booking.save()
        
        updated_booking = BookingStateMachine.start_booking(
            booking=booking,
            user=provider_user
        )
        
        assert updated_booking.status == 'IN_PROGRESS'
    
    def test_complete_booking(self, booking, provider_user):
        """Test completing a booking."""
        booking.status = 'IN_PROGRESS'
        booking.save()
        
        updated_booking = BookingStateMachine.complete_booking(
            booking=booking,
            user=provider_user
        )
        
        assert updated_booking.status == 'COMPLETED'
    
    def test_cancel_booking(self, booking, customer):
        """Test cancelling a booking."""
        booking.status = 'REQUESTED'
        booking.save()
        
        updated_booking = BookingStateMachine.cancel_booking(
            booking=booking,
            user=customer,
            reason='Changed my mind'
        )
        
        assert updated_booking.status == 'CANCELLED'
        
        # Check history
        history = BookingStatusHistory.objects.filter(
            booking=booking,
            to_status='CANCELLED'
        ).first()
        assert history is not None
        assert 'Changed my mind' in history.reason
    
    def test_dispute_booking(self, booking, customer):
        """Test disputing a booking."""
        booking.status = 'COMPLETED'
        booking.save()
        
        updated_booking = BookingStateMachine.dispute_booking(
            booking=booking,
            user=customer,
            reason='Service not satisfactory'
        )
        
        assert updated_booking.status == 'DISPUTED'
