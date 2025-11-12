"""
Unit tests for BookingService.

Tests booking creation, validation, and amount calculations.
"""

import pytest
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from django.core.exceptions import ValidationError

from apps.bookings.services import BookingService
from apps.bookings.models import Booking, BookingStatusHistory


@pytest.mark.django_db
class TestBookingService:
    """Test suite for BookingService."""
    
    def test_generate_booking_ref_unique(self):
        """Test that generated booking references are unique."""
        ref1 = BookingService.generate_booking_ref()
        ref2 = BookingService.generate_booking_ref()
        
        assert ref1 != ref2
        assert ref1.startswith('BK-')
        assert len(ref1) == 11  # BK- + 8 characters
    
    def test_validate_booking_data_success(
        self, customer, provider_service
    ):
        """Test successful booking data validation."""
        scheduled_start = timezone.now() + timedelta(days=1)
        
        validated = BookingService.validate_booking_data(
            customer=customer,
            provider_service=provider_service,
            scheduled_start=scheduled_start,
            duration_hours=2.0
        )
        
        assert 'scheduled_end' in validated
        assert 'duration_hours' in validated
        assert validated['duration_hours'] == 2.0
    
    def test_validate_booking_data_non_customer_fails(
        self, provider_user, provider_service
    ):
        """Test that non-customers cannot create bookings."""
        scheduled_start = timezone.now() + timedelta(days=1)
        
        with pytest.raises(ValidationError, match="Only customers can create bookings"):
            BookingService.validate_booking_data(
                customer=provider_user,
                provider_service=provider_service,
                scheduled_start=scheduled_start,
                duration_hours=2.0
            )
    
    def test_validate_booking_data_inactive_service_fails(
        self, customer, provider_service
    ):
        """Test that inactive services cannot be booked."""
        provider_service.is_active = False
        provider_service.save()
        
        scheduled_start = timezone.now() + timedelta(days=1)
        
        with pytest.raises(ValidationError, match="not currently available"):
            BookingService.validate_booking_data(
                customer=customer,
                provider_service=provider_service,
                scheduled_start=scheduled_start,
                duration_hours=2.0
            )
    
    def test_validate_booking_data_past_time_fails(
        self, customer, provider_service
    ):
        """Test that past times are rejected."""
        scheduled_start = timezone.now() - timedelta(hours=1)
        
        with pytest.raises(ValidationError, match="Cannot book in the past"):
            BookingService.validate_booking_data(
                customer=customer,
                provider_service=provider_service,
                scheduled_start=scheduled_start,
                duration_hours=2.0
            )
    
    def test_calculate_booking_amount_hourly(self, provider_service):
        """Test amount calculation for hourly services."""
        provider_service.price_type = 'HOURLY'
        provider_service.price_amount = Decimal('50.00')
        provider_service.save()
        
        amount = BookingService.calculate_booking_amount(
            provider_service=provider_service,
            duration_hours=3.0
        )
        
        assert amount == Decimal('150.00')
    
    def test_calculate_booking_amount_fixed(self, provider_service):
        """Test amount calculation for fixed price services."""
        provider_service.price_type = 'FIXED'
        provider_service.price_amount = Decimal('100.00')
        provider_service.save()
        
        amount = BookingService.calculate_booking_amount(
            provider_service=provider_service,
            duration_hours=3.0
        )
        
        assert amount == Decimal('100.00')
    
    def test_create_booking_success(self, customer, provider_service):
        """Test successful booking creation."""
        scheduled_start = timezone.now() + timedelta(days=1)
        
        booking = BookingService.create_booking(
            customer=customer,
            provider_service_id=str(provider_service.id),
            scheduled_start=scheduled_start,
            address='123 Test Street',
            duration_hours=2.0,
            notes='Test booking'
        )
        
        assert booking is not None
        assert booking.customer == customer
        assert booking.provider == provider_service.provider
        assert booking.status == 'REQUESTED'
        assert booking.payment_status == 'PENDING'
        assert booking.booking_ref.startswith('BK-')
        
        # Check status history was created
        history = BookingStatusHistory.objects.filter(booking=booking)
        assert history.count() == 1
        assert history.first().to_status == 'REQUESTED'
    
    def test_create_booking_unavailable_provider_fails(
        self, customer, provider, provider_service
    ):
        """Test that booking fails when provider is unavailable."""
        # Create existing booking
        start_time = timezone.now() + timedelta(days=1)
        
        Booking.objects.create(
            booking_ref='BK-EXIST01',
            customer=customer,
            provider=provider,
            provider_service=provider_service,
            status='CONFIRMED',
            scheduled_start=start_time,
            scheduled_end=start_time + timedelta(hours=2),
            address='Test Address',
            total_amount=100.00,
            payment_status='PENDING'
        )
        
        # Try to book overlapping time
        with pytest.raises(ValidationError, match="not available"):
            BookingService.create_booking(
                customer=customer,
                provider_service_id=str(provider_service.id),
                scheduled_start=start_time + timedelta(hours=1),
                address='123 Test Street',
                duration_hours=2.0
            )
    
    def test_create_booking_invalid_service_fails(self, customer):
        """Test that invalid service ID fails."""
        scheduled_start = timezone.now() + timedelta(days=1)
        
        with pytest.raises(ValidationError, match="Service not found"):
            BookingService.create_booking(
                customer=customer,
                provider_service_id='00000000-0000-0000-0000-000000000000',
                scheduled_start=scheduled_start,
                address='123 Test Street',
                duration_hours=2.0
            )
