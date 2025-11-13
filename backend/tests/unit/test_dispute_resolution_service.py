"""
Unit tests for DisputeResolutionService.
"""

from django.utils import timezone

import pytest

from apps.disputes.models import Dispute
from apps.disputes.services import DisputeResolutionService, DisputeService
from core.exceptions import NotFoundError, PermissionDeniedError, ValidationError


@pytest.mark.django_db
class TestDisputeResolutionService:
    """Test DisputeResolutionService methods."""

    def test_update_dispute_status_success(self, admin_user, customer, booking):
        """Test successful dispute status update by admin."""
        booking.status = "COMPLETED"
        booking.save()

        # Create dispute
        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason="Service issue",
            description="There are issues with the service provided",
        )

        # Update status
        updated_dispute = DisputeResolutionService.update_dispute_status(
            dispute_id=str(dispute.id), admin_user=admin_user, new_status="INVESTIGATING"
        )

        assert updated_dispute.status == "INVESTIGATING"

    def test_update_dispute_status_non_admin(self, customer, booking):
        """Test dispute status update by non-admin user."""
        booking.status = "COMPLETED"
        booking.save()

        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason="Service issue",
            description="There are issues with the service provided",
        )

        with pytest.raises(PermissionDeniedError) as exc_info:
            DisputeResolutionService.update_dispute_status(
                dispute_id=str(dispute.id), admin_user=customer, new_status="INVESTIGATING"
            )

        assert "administrators" in str(exc_info.value).lower()

    def test_update_dispute_status_invalid_status(self, admin_user, customer, booking):
        """Test dispute status update with invalid status."""
        booking.status = "COMPLETED"
        booking.save()

        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason="Service issue",
            description="There are issues with the service provided",
        )

        with pytest.raises(ValidationError) as exc_info:
            DisputeResolutionService.update_dispute_status(
                dispute_id=str(dispute.id), admin_user=admin_user, new_status="INVALID_STATUS"
            )

        assert "Invalid status" in str(exc_info.value)

    def test_update_closed_dispute_status(self, admin_user, customer, booking):
        """Test updating status of closed dispute."""
        booking.status = "COMPLETED"
        booking.save()

        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason="Service issue",
            description="There are issues with the service provided",
        )

        # Close dispute
        dispute.status = "CLOSED"
        dispute.save()

        with pytest.raises(ValidationError) as exc_info:
            DisputeResolutionService.update_dispute_status(
                dispute_id=str(dispute.id), admin_user=admin_user, new_status="INVESTIGATING"
            )

        assert "closed dispute" in str(exc_info.value).lower()

    def test_update_status_to_resolved_sets_timestamp(self, admin_user, customer, booking):
        """Test that updating to RESOLVED sets resolved_at timestamp."""
        booking.status = "COMPLETED"
        booking.save()

        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason="Service issue",
            description="There are issues with the service provided",
        )

        updated_dispute = DisputeResolutionService.update_dispute_status(
            dispute_id=str(dispute.id), admin_user=admin_user, new_status="RESOLVED"
        )

        assert updated_dispute.resolved_at is not None
        assert updated_dispute.resolved_by == admin_user

    def test_resolve_dispute_success(self, admin_user, customer, booking):
        """Test successful dispute resolution."""
        booking.status = "COMPLETED"
        booking.save()

        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason="Service issue",
            description="There are issues with the service provided",
        )

        resolution_text = (
            "After reviewing the evidence, we have determined that a partial refund is appropriate."
        )

        resolved_dispute = DisputeResolutionService.resolve_dispute(
            dispute_id=str(dispute.id), admin_user=admin_user, resolution=resolution_text
        )

        assert resolved_dispute.status == "RESOLVED"
        assert resolved_dispute.resolution == resolution_text
        assert resolved_dispute.resolved_by == admin_user
        assert resolved_dispute.resolved_at is not None

    def test_resolve_dispute_non_admin(self, customer, booking):
        """Test dispute resolution by non-admin user."""
        booking.status = "COMPLETED"
        booking.save()

        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason="Service issue",
            description="There are issues with the service provided",
        )

        with pytest.raises(PermissionDeniedError) as exc_info:
            DisputeResolutionService.resolve_dispute(
                dispute_id=str(dispute.id),
                admin_user=customer,
                resolution="Test resolution text that is long enough",
            )

        assert "administrators" in str(exc_info.value).lower()

    def test_resolve_already_resolved_dispute(self, admin_user, customer, booking):
        """Test resolving already resolved dispute."""
        booking.status = "COMPLETED"
        booking.save()

        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason="Service issue",
            description="There are issues with the service provided",
        )

        # Resolve first time
        DisputeResolutionService.resolve_dispute(
            dispute_id=str(dispute.id),
            admin_user=admin_user,
            resolution="First resolution text that is long enough",
        )

        # Try to resolve again
        with pytest.raises(ValidationError) as exc_info:
            DisputeResolutionService.resolve_dispute(
                dispute_id=str(dispute.id),
                admin_user=admin_user,
                resolution="Second resolution text that is long enough",
            )

        assert "already resolved" in str(exc_info.value).lower()

    def test_resolve_dispute_short_resolution(self, admin_user, customer, booking):
        """Test resolving dispute with too short resolution text."""
        booking.status = "COMPLETED"
        booking.save()

        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason="Service issue",
            description="There are issues with the service provided",
        )

        with pytest.raises(ValidationError) as exc_info:
            DisputeResolutionService.resolve_dispute(
                dispute_id=str(dispute.id), admin_user=admin_user, resolution="Too short"
            )

        assert "at least 20 characters" in str(exc_info.value)

    def test_close_dispute_success(self, admin_user, customer, booking):
        """Test successful dispute closure."""
        booking.status = "COMPLETED"
        booking.save()

        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason="Service issue",
            description="There are issues with the service provided",
        )

        # Resolve dispute first
        DisputeResolutionService.resolve_dispute(
            dispute_id=str(dispute.id),
            admin_user=admin_user,
            resolution="Resolution text that is long enough for validation",
        )

        # Close dispute
        closed_dispute = DisputeResolutionService.close_dispute(
            dispute_id=str(dispute.id), admin_user=admin_user
        )

        assert closed_dispute.status == "CLOSED"

    def test_close_dispute_non_admin(self, customer, booking):
        """Test dispute closure by non-admin user."""
        booking.status = "COMPLETED"
        booking.save()

        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason="Service issue",
            description="There are issues with the service provided",
        )

        with pytest.raises(PermissionDeniedError) as exc_info:
            DisputeResolutionService.close_dispute(dispute_id=str(dispute.id), admin_user=customer)

        assert "administrators" in str(exc_info.value).lower()

    def test_close_unresolved_dispute(self, admin_user, customer, booking):
        """Test closing unresolved dispute."""
        booking.status = "COMPLETED"
        booking.save()

        dispute = DisputeService.create_dispute(
            booking_id=str(booking.id),
            raised_by_user=customer,
            reason="Service issue",
            description="There are issues with the service provided",
        )

        with pytest.raises(ValidationError) as exc_info:
            DisputeResolutionService.close_dispute(
                dispute_id=str(dispute.id), admin_user=admin_user
            )

        assert "resolved disputes" in str(exc_info.value).lower()

    def test_dispute_not_found(self, admin_user):
        """Test operations on non-existent dispute."""
        fake_id = "00000000-0000-0000-0000-000000000000"

        with pytest.raises(NotFoundError):
            DisputeResolutionService.update_dispute_status(
                dispute_id=fake_id, admin_user=admin_user, new_status="INVESTIGATING"
            )

        with pytest.raises(NotFoundError):
            DisputeResolutionService.resolve_dispute(
                dispute_id=fake_id,
                admin_user=admin_user,
                resolution="Test resolution text that is long enough",
            )

        with pytest.raises(NotFoundError):
            DisputeResolutionService.close_dispute(dispute_id=fake_id, admin_user=admin_user)
