"""
Unit tests for DisputeService.
"""

import pytest
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from apps.disputes.services import DisputeService
from apps.disputes.models import Dispute
from core.exceptions import ValidationError, NotFoundError, PermissionDeniedError


@pytest.mark.django_db
class TestDisputeService:
    """Test DisputeService methods."""
    
    def test_create_dispute_success(self, customer, provider, booking):
        """Test successful dispute creation."""
        # Update booking to completed status
        booking.status = 'COMPLETED'
        booking.save()
        
        # Create dispute
        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason='Service not completed properly',
            description='The plumbing work was not done according to specifications and there are still leaks.',
            evidence=[
                {'url': 'https://example.com/photo1.jpg', 'type': 'photo'}
            ]
        )
        
        # Assertions
        assert dispute is not None
        assert dispute.booking == booking
        assert dispute.raised_by == customer
        assert dispute.reason == 'Service not completed properly'
        assert dispute.status == 'OPEN'
        assert len(dispute.evidence) == 1
        
        # Check booking status updated
        booking.refresh_from_db()
        assert booking.status == 'DISPUTED'
    
    def test_create_dispute_by_provider(self, provider_user, provider, booking):
        """Test dispute creation by provider."""
        booking.status = 'COMPLETED'
        booking.save()
        
        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=provider_user,
            reason='Customer refused to pay',
            description='Customer refused to pay the agreed amount after service was completed successfully.',
            evidence=[]
        )
        
        assert dispute.raised_by == provider_user
        assert dispute.status == 'OPEN'
    
    def test_create_dispute_booking_not_found(self, customer):
        """Test dispute creation with non-existent booking."""
        with pytest.raises(NotFoundError) as exc_info:
            DisputeService.create_dispute(
                booking_id='00000000-0000-0000-0000-000000000000',
                raised_by_user=customer,
                reason='Test reason',
                description='Test description that is long enough'
            )
        
        assert 'Booking not found' in str(exc_info.value)
    
    def test_create_dispute_unauthorized_user(self, admin_user, booking):
        """Test dispute creation by unauthorized user."""
        booking.status = 'COMPLETED'
        booking.save()
        
        with pytest.raises(PermissionDeniedError) as exc_info:
            DisputeService.create_dispute(
                booking_id=str(booking.id),
                raised_by_user=admin_user,
                reason='Test reason',
                description='Test description that is long enough'
            )
        
        assert 'Only the customer or provider' in str(exc_info.value)
    
    def test_create_dispute_invalid_booking_status(self, customer, booking):
        """Test dispute creation for booking with invalid status."""
        # Booking is in REQUESTED status by default
        with pytest.raises(ValidationError) as exc_info:
            DisputeService.create_dispute(
                booking_id=str(booking.id),
                raised_by_user=customer,
                reason='Test reason',
                description='Test description that is long enough'
            )
        
        assert 'completed or cancelled' in str(exc_info.value).lower()
    
    def test_create_dispute_outside_window(self, customer, booking):
        """Test dispute creation outside allowed window."""
        # Set booking to completed 8 days ago
        booking.status = 'COMPLETED'
        booking.updated_at = timezone.now() - timedelta(days=8)
        booking.save()
        
        with pytest.raises(ValidationError) as exc_info:
            DisputeService.create_dispute(
                booking_id=str(booking.id),
                raised_by_user=customer,
                reason='Test reason',
                description='Test description that is long enough'
            )
        
        assert 'within 7 days' in str(exc_info.value)
    
    def test_create_dispute_duplicate(self, customer, booking):
        """Test creating duplicate dispute for same booking."""
        booking.status = 'COMPLETED'
        booking.save()
        
        # Create first dispute
        DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason='First dispute',
            description='This is the first dispute for this booking'
        )
        
        # Try to create second dispute
        with pytest.raises(ValidationError) as exc_info:
            DisputeService.create_dispute(
                booking_id=str(booking.id),
                raised_by_user=customer,
                reason='Second dispute',
                description='This is the second dispute for this booking'
            )
        
        assert 'already exists' in str(exc_info.value)
    
    def test_create_dispute_short_reason(self, customer, booking):
        """Test dispute creation with too short reason."""
        booking.status = 'COMPLETED'
        booking.save()
        
        with pytest.raises(ValidationError) as exc_info:
            DisputeService.create_dispute(
                booking_id=str(booking.id),
                raised_by_user=customer,
                reason='Bad',
                description='This is a longer description that meets requirements'
            )
        
        assert 'at least 5 characters' in str(exc_info.value)
    
    def test_create_dispute_short_description(self, customer, booking):
        """Test dispute creation with too short description."""
        booking.status = 'COMPLETED'
        booking.save()
        
        with pytest.raises(ValidationError) as exc_info:
            DisputeService.create_dispute(
                booking_id=str(booking.id),
                raised_by_user=customer,
                reason='Valid reason',
                description='Too short'
            )
        
        assert 'at least 20 characters' in str(exc_info.value)
    
    def test_validate_dispute_window_within_window(self, booking):
        """Test dispute window validation within allowed time."""
        booking.status = 'COMPLETED'
        booking.updated_at = timezone.now() - timedelta(days=3)
        booking.save()
        
        # Should not raise exception
        DisputeService.validate_dispute_window(booking)
    
    def test_validate_dispute_window_outside_window(self, booking):
        """Test dispute window validation outside allowed time."""
        booking.status = 'COMPLETED'
        booking.updated_at = timezone.now() - timedelta(days=10)
        booking.save()
        
        with pytest.raises(ValidationError) as exc_info:
            DisputeService.validate_dispute_window(booking)
        
        assert 'within 7 days' in str(exc_info.value)
    
    def test_add_evidence_success(self, customer, booking):
        """Test adding evidence to dispute."""
        booking.status = 'COMPLETED'
        booking.save()
        
        # Create dispute
        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason='Service issue',
            description='There are issues with the service provided'
        )
        
        # Add evidence
        evidence_item = {
            'url': 'https://example.com/evidence.jpg',
            'type': 'photo',
            'description': 'Photo of the issue'
        }
        
        updated_dispute = DisputeService.add_evidence(
            dispute_id=str(dispute.id),
            user=customer,
            evidence_item=evidence_item
        )
        
        assert len(updated_dispute.evidence) == 1
        assert updated_dispute.evidence[0]['url'] == evidence_item['url']
        assert 'added_by' in updated_dispute.evidence[0]
        assert 'added_at' in updated_dispute.evidence[0]
    
    def test_add_evidence_by_provider(self, provider_user, customer, booking):
        """Test adding evidence by provider."""
        booking.status = 'COMPLETED'
        booking.save()
        
        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason='Service issue',
            description='There are issues with the service provided'
        )
        
        evidence_item = {
            'url': 'https://example.com/provider-evidence.jpg',
            'type': 'photo'
        }
        
        updated_dispute = DisputeService.add_evidence(
            dispute_id=str(dispute.id),
            user=provider_user,
            evidence_item=evidence_item
        )
        
        assert len(updated_dispute.evidence) == 1
    
    def test_add_evidence_unauthorized(self, admin_user, customer, booking):
        """Test adding evidence by unauthorized user."""
        booking.status = 'COMPLETED'
        booking.save()
        
        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason='Service issue',
            description='There are issues with the service provided'
        )
        
        with pytest.raises(PermissionDeniedError):
            DisputeService.add_evidence(
                dispute_id=str(dispute.id),
                user=admin_user,
                evidence_item={'url': 'https://example.com/test.jpg'}
            )
    
    def test_add_evidence_to_closed_dispute(self, customer, booking):
        """Test adding evidence to closed dispute."""
        booking.status = 'COMPLETED'
        booking.save()
        
        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason='Service issue',
            description='There are issues with the service provided'
        )
        
        # Close dispute
        dispute.status = 'CLOSED'
        dispute.save()
        
        with pytest.raises(ValidationError) as exc_info:
            DisputeService.add_evidence(
                dispute_id=str(dispute.id),
                user=customer,
                evidence_item={'url': 'https://example.com/test.jpg'}
            )
        
        assert 'resolved or closed' in str(exc_info.value).lower()
    
    def test_get_dispute_by_customer(self, customer, booking):
        """Test getting dispute by customer."""
        booking.status = 'COMPLETED'
        booking.save()
        
        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason='Service issue',
            description='There are issues with the service provided'
        )
        
        retrieved_dispute = DisputeService.get_dispute(
            dispute_id=str(dispute.id),
            user=customer
        )
        
        assert retrieved_dispute.id == dispute.id
    
    def test_get_dispute_by_admin(self, admin_user, customer, booking):
        """Test getting dispute by admin."""
        booking.status = 'COMPLETED'
        booking.save()
        
        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason='Service issue',
            description='There are issues with the service provided'
        )
        
        retrieved_dispute = DisputeService.get_dispute(
            dispute_id=str(dispute.id),
            user=admin_user
        )
        
        assert retrieved_dispute.id == dispute.id
    
    def test_get_dispute_unauthorized(self, customer_user, customer, booking):
        """Test getting dispute by unauthorized user."""
        booking.status = 'COMPLETED'
        booking.save()
        
        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason='Service issue',
            description='There are issues with the service provided'
        )
        
        with pytest.raises(PermissionDeniedError):
            DisputeService.get_dispute(
                dispute_id=str(dispute.id),
                user=customer_user
            )
