"""
Unit tests for AvailabilityService.

Tests conflict detection and availability checking logic.
"""

import pytest
from datetime import timedelta
from django.utils import timezone
from django.core.exceptions import ValidationError

from apps.bookings.services import AvailabilityService
from apps.bookings.models import Booking


@pytest.mark.django_db
class TestAvailabilityService:
    """Test suite for AvailabilityService."""
    
    def test_check_availability_no_conflicts(self, provider, provider_service):
        """Test availability check when no conflicts exist."""
        start_time = timezone.now() + timedelta(days=1)
        end_time = start_time + timedelta(hours=2)
        
        is_available = AvailabilityService.check_availability(
            provider_id=str(provider.id),
            start_time=start_time,
            end_time=end_time
        )
        
        assert is_available is True
    
    def test_check_availability_with_conflict(
        self, customer, provider, provider_service
    ):
        """Test availability check when conflict exists."""
        # Create existing booking
        start_time = timezone.now() + timedelta(days=1)
        end_time = start_time + timedelta(hours=2)
        
        Booking.objects.create(
            booking_ref='BK-TEST001',
            customer=customer,
            provider=provider,
            provider_service=provider_service,
            status='CONFIRMED',
            scheduled_start=start_time,
            scheduled_end=end_time,
            address='Test Address',
            total_amount=100.00,
            payment_status='PENDING'
        )
        
        # Try to book overlapping time
        new_start = start_time + timedelta(hours=1)
        new_end = new_start + timedelta(hours=2)
        
        is_available = AvailabilityService.check_availability(
            provider_id=str(provider.id),
            start_time=new_start,
            end_time=new_end
        )
        
        assert is_available is False
    
    def test_check_availability_cancelled_booking_not_conflict(
        self, customer, provider, provider_service
    ):
        """Test that cancelled bookings don't cause conflicts."""
        # Create cancelled booking
        start_time = timezone.now() + timedelta(days=1)
        end_time = start_time + timedelta(hours=2)
        
        Booking.objects.create(
            booking_ref='BK-TEST002',
            customer=customer,
            provider=provider,
            provider_service=provider_service,
            status='CANCELLED',
            scheduled_start=start_time,
            scheduled_end=end_time,
            address='Test Address',
            total_amount=100.00,
            payment_status='PENDING'
        )
        
        # Try to book same time
        is_available = AvailabilityService.check_availability(
            provider_id=str(provider.id),
            start_time=start_time,
            end_time=end_time
        )
        
        assert is_available is True
    
    def test_check_availability_exclude_booking(
        self, customer, provider, provider_service
    ):
        """Test availability check with excluded booking."""
        # Create existing booking
        start_time = timezone.now() + timedelta(days=1)
        end_time = start_time + timedelta(hours=2)
        
        booking = Booking.objects.create(
            booking_ref='BK-TEST003',
            customer=customer,
            provider=provider,
            provider_service=provider_service,
            status='CONFIRMED',
            scheduled_start=start_time,
            scheduled_end=end_time,
            address='Test Address',
            total_amount=100.00,
            payment_status='PENDING'
        )
        
        # Check availability excluding this booking (for updates)
        is_available = AvailabilityService.check_availability(
            provider_id=str(provider.id),
            start_time=start_time,
            end_time=end_time,
            exclude_booking_id=str(booking.id)
        )
        
        assert is_available is True
    
    def test_check_availability_past_time_raises_error(self, provider):
        """Test that booking in the past raises validation error."""
        start_time = timezone.now() - timedelta(hours=1)
        end_time = start_time + timedelta(hours=2)
        
        with pytest.raises(ValidationError, match="Cannot book in the past"):
            AvailabilityService.check_availability(
                provider_id=str(provider.id),
                start_time=start_time,
                end_time=end_time
            )
    
    def test_check_availability_invalid_time_range(self, provider):
        """Test that end time before start time raises error."""
        start_time = timezone.now() + timedelta(days=1)
        end_time = start_time - timedelta(hours=1)
        
        with pytest.raises(ValidationError, match="End time must be after start time"):
            AvailabilityService.check_availability(
                provider_id=str(provider.id),
                start_time=start_time,
                end_time=end_time
            )
    
    def test_check_and_reserve_atomic(self, provider, provider_service):
        """Test atomic check and reserve operation."""
        start_time = timezone.now() + timedelta(days=1)
        end_time = start_time + timedelta(hours=2)
        
        is_available = AvailabilityService.check_and_reserve(
            provider_id=str(provider.id),
            start_time=start_time,
            end_time=end_time
        )
        
        assert is_available is True
