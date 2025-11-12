"""
Booking services for HandyGH.

Design Decisions:
- Service layer separates business logic from views
- Database transactions ensure data consistency
- Conflict detection prevents double bookings
- State machine pattern for status transitions

SOLID Principles:
- Single Responsibility: Each service handles specific domain logic
- Dependency Inversion: Services depend on abstractions (models)
"""

import secrets
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, Dict, Any
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.core.exceptions import ValidationError
from apps.bookings.models import Booking, BookingStatusHistory
from apps.providers.models import Provider, ProviderService
from apps.users.models import User


class AvailabilityService:
    """
    Service for checking provider availability.
    
    Handles conflict detection to prevent double bookings.
    Uses database transactions to prevent race conditions.
    """
    
    @staticmethod
    def check_availability(
        provider_id: str,
        start_time: datetime,
        end_time: datetime,
        exclude_booking_id: Optional[str] = None
    ) -> bool:
        """
        Check if provider is available for the given time slot.
        
        Args:
            provider_id: UUID of the provider
            start_time: Start time of the booking
            end_time: End time of the booking
            exclude_booking_id: Optional booking ID to exclude (for updates)
            
        Returns:
            True if available, False if there's a conflict
            
        Raises:
            ValidationError: If time parameters are invalid
        """
        # Validate time parameters
        if end_time <= start_time:
            raise ValidationError("End time must be after start time")
        
        if start_time < timezone.now():
            raise ValidationError("Cannot book in the past")
        
        # Build query for overlapping bookings
        # Two bookings overlap if:
        # 1. New booking starts during existing booking
        # 2. New booking ends during existing booking
        # 3. New booking completely contains existing booking
        overlapping_query = Q(
            provider_id=provider_id,
            status__in=['REQUESTED', 'CONFIRMED', 'IN_PROGRESS']
        ) & (
            # New booking starts during existing booking
            Q(scheduled_start__lte=start_time, scheduled_end__gt=start_time) |
            # New booking ends during existing booking
            Q(scheduled_start__lt=end_time, scheduled_end__gte=end_time) |
            # New booking completely contains existing booking
            Q(scheduled_start__gte=start_time, scheduled_end__lte=end_time)
        )
        
        # Exclude specific booking if provided (for updates)
        if exclude_booking_id:
            overlapping_query &= ~Q(id=exclude_booking_id)
        
        # Check for conflicts
        has_conflict = Booking.objects.filter(overlapping_query).exists()
        
        return not has_conflict
    
    @staticmethod
    @transaction.atomic
    def check_and_reserve(
        provider_id: str,
        start_time: datetime,
        end_time: datetime
    ) -> bool:
        """
        Check availability and reserve the slot atomically.
        
        Uses database transaction with SELECT FOR UPDATE to prevent race conditions.
        
        Args:
            provider_id: UUID of the provider
            start_time: Start time of the booking
            end_time: End time of the booking
            
        Returns:
            True if available and reserved, False otherwise
        """
        # Lock the provider's bookings for update
        overlapping_query = Q(
            provider_id=provider_id,
            status__in=['REQUESTED', 'CONFIRMED', 'IN_PROGRESS']
        ) & (
            Q(scheduled_start__lte=start_time, scheduled_end__gt=start_time) |
            Q(scheduled_start__lt=end_time, scheduled_end__gte=end_time) |
            Q(scheduled_start__gte=start_time, scheduled_end__lte=end_time)
        )
        
        # Use select_for_update to lock rows and prevent race conditions
        conflicting_bookings = list(
            Booking.objects.filter(overlapping_query).select_for_update()
        )
        
        return len(conflicting_bookings) == 0


class BookingService:
    """
    Service for managing bookings.
    
    Handles booking creation, validation, and amount calculations.
    """
    
    @staticmethod
    def generate_booking_ref() -> str:
        """
        Generate a unique booking reference.
        
        Format: BK-XXXXXXXX (8 random uppercase alphanumeric characters)
        
        Returns:
            Unique booking reference string
        """
        while True:
            # Generate random 8-character alphanumeric string
            random_part = ''.join(
                secrets.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
                for _ in range(8)
            )
            booking_ref = f"BK-{random_part}"
            
            # Check if it's unique
            if not Booking.objects.filter(booking_ref=booking_ref).exists():
                return booking_ref
    
    @staticmethod
    def validate_booking_data(
        customer: User,
        provider_service: ProviderService,
        scheduled_start: datetime,
        scheduled_end: Optional[datetime] = None,
        duration_hours: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Validate booking data and calculate end time if needed.
        
        Args:
            customer: Customer making the booking
            provider_service: Service being booked
            scheduled_start: Start time
            scheduled_end: End time (optional if duration_hours provided)
            duration_hours: Duration in hours (optional if scheduled_end provided)
            
        Returns:
            Dictionary with validated data including calculated end time
            
        Raises:
            ValidationError: If validation fails
        """
        # Validate customer role
        if not customer.is_customer:
            raise ValidationError("Only customers can create bookings")
        
        # Validate provider service is active
        if not provider_service.is_active:
            raise ValidationError("This service is not currently available")
        
        # Validate provider is active
        if not provider_service.provider.is_active:
            raise ValidationError("This provider is not currently accepting bookings")
        
        # Calculate end time if not provided
        if scheduled_end is None:
            if duration_hours is None:
                # Use service duration estimate if available
                if provider_service.duration_estimate_min:
                    duration_hours = provider_service.duration_estimate_min / 60
                else:
                    # Default to 1 hour if no duration specified
                    duration_hours = 1.0
            
            scheduled_end = scheduled_start + timedelta(hours=duration_hours)
        
        # Validate times
        if scheduled_end <= scheduled_start:
            raise ValidationError("End time must be after start time")
        
        if scheduled_start < timezone.now():
            raise ValidationError("Cannot book in the past")
        
        # Validate booking is not too far in the future (e.g., 6 months)
        max_future_date = timezone.now() + timedelta(days=180)
        if scheduled_start > max_future_date:
            raise ValidationError("Cannot book more than 6 months in advance")
        
        return {
            'scheduled_end': scheduled_end,
            'duration_hours': (scheduled_end - scheduled_start).total_seconds() / 3600
        }
    
    @staticmethod
    def calculate_booking_amount(
        provider_service: ProviderService,
        duration_hours: float
    ) -> Decimal:
        """
        Calculate total booking amount based on service pricing.
        
        Args:
            provider_service: Service being booked
            duration_hours: Duration in hours
            
        Returns:
            Total amount as Decimal
        """
        if provider_service.price_type == 'HOURLY':
            return provider_service.price_amount * Decimal(str(duration_hours))
        else:
            # Fixed price
            return provider_service.price_amount
    
    @staticmethod
    @transaction.atomic
    def create_booking(
        customer: User,
        provider_service_id: str,
        scheduled_start: datetime,
        address: str,
        scheduled_end: Optional[datetime] = None,
        duration_hours: Optional[float] = None,
        notes: str = ""
    ) -> Booking:
        """
        Create a new booking with availability check.
        
        Args:
            customer: Customer making the booking
            provider_service_id: UUID of the service
            scheduled_start: Start time
            address: Service location
            scheduled_end: End time (optional)
            duration_hours: Duration in hours (optional)
            notes: Additional notes
            
        Returns:
            Created Booking instance
            
        Raises:
            ValidationError: If validation fails or provider unavailable
        """
        # Get provider service
        try:
            provider_service = ProviderService.objects.select_related(
                'provider', 'provider__user'
            ).get(id=provider_service_id)
        except ProviderService.DoesNotExist:
            raise ValidationError("Service not found")
        
        # Validate booking data
        validated_data = BookingService.validate_booking_data(
            customer=customer,
            provider_service=provider_service,
            scheduled_start=scheduled_start,
            scheduled_end=scheduled_end,
            duration_hours=duration_hours
        )
        
        scheduled_end = validated_data['scheduled_end']
        duration_hours = validated_data['duration_hours']
        
        # Check availability with atomic reservation
        is_available = AvailabilityService.check_and_reserve(
            provider_id=str(provider_service.provider.id),
            start_time=scheduled_start,
            end_time=scheduled_end
        )
        
        if not is_available:
            raise ValidationError(
                "Provider is not available for the selected time slot"
            )
        
        # Calculate amount
        total_amount = BookingService.calculate_booking_amount(
            provider_service=provider_service,
            duration_hours=duration_hours
        )
        
        # Generate booking reference
        booking_ref = BookingService.generate_booking_ref()
        
        # Create booking
        booking = Booking.objects.create(
            booking_ref=booking_ref,
            customer=customer,
            provider=provider_service.provider,
            provider_service=provider_service,
            status='REQUESTED',
            scheduled_start=scheduled_start,
            scheduled_end=scheduled_end,
            address=address,
            notes=notes,
            total_amount=total_amount,
            payment_status='PENDING'
        )
        
        # Create initial status history
        BookingStatusHistory.objects.create(
            booking=booking,
            from_status=None,
            to_status='REQUESTED',
            changed_by=customer,
            reason='Booking created'
        )
        
        return booking


class BookingStateMachine:
    """
    State machine for managing booking status transitions.
    
    Validates allowed transitions and logs all changes.
    """
    
    # Define allowed status transitions
    ALLOWED_TRANSITIONS = {
        'REQUESTED': ['CONFIRMED', 'CANCELLED'],
        'CONFIRMED': ['IN_PROGRESS', 'CANCELLED'],
        'IN_PROGRESS': ['COMPLETED', 'DISPUTED'],
        'COMPLETED': ['DISPUTED'],
        'CANCELLED': [],  # Terminal state
        'DISPUTED': ['COMPLETED', 'CANCELLED'],  # Can be resolved
    }
    
    @staticmethod
    def can_transition(from_status: str, to_status: str) -> bool:
        """
        Check if a status transition is allowed.
        
        Args:
            from_status: Current status
            to_status: Desired status
            
        Returns:
            True if transition is allowed, False otherwise
        """
        allowed = BookingStateMachine.ALLOWED_TRANSITIONS.get(from_status, [])
        return to_status in allowed
    
    @staticmethod
    @transaction.atomic
    def transition_status(
        booking: Booking,
        new_status: str,
        changed_by: User,
        reason: str = ""
    ) -> Booking:
        """
        Transition booking to new status with validation.
        
        Args:
            booking: Booking to update
            new_status: New status
            changed_by: User making the change
            reason: Reason for change
            
        Returns:
            Updated Booking instance
            
        Raises:
            ValidationError: If transition is not allowed
        """
        # Check if transition is allowed
        if not BookingStateMachine.can_transition(booking.status, new_status):
            raise ValidationError(
                f"Cannot transition from {booking.status} to {new_status}"
            )
        
        old_status = booking.status
        
        # Update booking status
        booking.status = new_status
        booking.save(update_fields=['status', 'updated_at'])
        
        # Log status change
        BookingStatusHistory.objects.create(
            booking=booking,
            from_status=old_status,
            to_status=new_status,
            changed_by=changed_by,
            reason=reason
        )
        
        return booking
    
    @staticmethod
    def accept_booking(booking: Booking, provider_user: User) -> Booking:
        """
        Provider accepts a booking.
        
        Args:
            booking: Booking to accept
            provider_user: Provider user accepting
            
        Returns:
            Updated Booking instance
        """
        return BookingStateMachine.transition_status(
            booking=booking,
            new_status='CONFIRMED',
            changed_by=provider_user,
            reason='Provider accepted booking'
        )
    
    @staticmethod
    def decline_booking(
        booking: Booking,
        provider_user: User,
        reason: str = ""
    ) -> Booking:
        """
        Provider declines a booking.
        
        Args:
            booking: Booking to decline
            provider_user: Provider user declining
            reason: Reason for declining
            
        Returns:
            Updated Booking instance
        """
        return BookingStateMachine.transition_status(
            booking=booking,
            new_status='CANCELLED',
            changed_by=provider_user,
            reason=reason or 'Provider declined booking'
        )
    
    @staticmethod
    def start_booking(booking: Booking, user: User) -> Booking:
        """
        Mark booking as in progress.
        
        Args:
            booking: Booking to start
            user: User starting the booking
            
        Returns:
            Updated Booking instance
        """
        return BookingStateMachine.transition_status(
            booking=booking,
            new_status='IN_PROGRESS',
            changed_by=user,
            reason='Service started'
        )
    
    @staticmethod
    def complete_booking(booking: Booking, user: User) -> Booking:
        """
        Mark booking as completed.
        
        Args:
            booking: Booking to complete
            user: User completing the booking
            
        Returns:
            Updated Booking instance
        """
        return BookingStateMachine.transition_status(
            booking=booking,
            new_status='COMPLETED',
            changed_by=user,
            reason='Service completed'
        )
    
    @staticmethod
    def cancel_booking(
        booking: Booking,
        user: User,
        reason: str = ""
    ) -> Booking:
        """
        Cancel a booking.
        
        Args:
            booking: Booking to cancel
            user: User cancelling
            reason: Reason for cancellation
            
        Returns:
            Updated Booking instance
        """
        return BookingStateMachine.transition_status(
            booking=booking,
            new_status='CANCELLED',
            changed_by=user,
            reason=reason or 'Booking cancelled'
        )
    
    @staticmethod
    def dispute_booking(
        booking: Booking,
        user: User,
        reason: str = ""
    ) -> Booking:
        """
        Mark booking as disputed.
        
        Args:
            booking: Booking to dispute
            user: User raising dispute
            reason: Reason for dispute
            
        Returns:
            Updated Booking instance
        """
        return BookingStateMachine.transition_status(
            booking=booking,
            new_status='DISPUTED',
            changed_by=user,
            reason=reason or 'Booking disputed'
        )
