"""
Business logic services for disputes app.

Design Decisions:
- DisputeService handles dispute creation and validation
- DisputeResolutionService handles admin resolution workflow
- Separate services for clear separation of concerns
- Validation logic centralized in service layer

SOLID Principles:
- Single Responsibility: Each service handles specific domain logic
- Dependency Inversion: Services depend on abstractions (models)
"""

from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from apps.bookings.models import Booking
from core.exceptions import NotFoundError, PermissionDeniedError, ValidationError

from .models import Dispute


class DisputeService:
    """
    Service for managing dispute creation and validation.

    Handles:
    - Dispute creation with validation
    - Dispute window validation (7 days)
    - Evidence management
    """

    # Dispute window in days
    DISPUTE_WINDOW_DAYS = 7

    @staticmethod
    def create_dispute(
        booking_id: str, raised_by_user, reason: str, description: str, evidence: list = None
    ) -> Dispute:
        """
        Create a new dispute for a booking.

        Args:
            booking_id: UUID of the booking
            raised_by_user: User raising the dispute
            reason: Short reason for the dispute
            description: Detailed description
            evidence: List of evidence URLs/metadata

        Returns:
            Created Dispute instance

        Raises:
            NotFoundError: If booking doesn't exist
            ValidationError: If validation fails
            PermissionDeniedError: If user not authorized
        """
        # Get booking
        try:
            booking = Booking.objects.select_related("customer", "provider__user").get(
                id=booking_id
            )
        except Booking.DoesNotExist:
            raise NotFoundError("Booking not found")

        # Validate user is part of the booking
        if raised_by_user.id not in [booking.customer.id, booking.provider.user.id]:
            raise PermissionDeniedError(
                "Only the customer or provider can raise a dispute for this booking"
            )

        # Validate booking status
        if booking.status not in ["COMPLETED", "CANCELLED"]:
            raise ValidationError("Disputes can only be raised for completed or cancelled bookings")

        # Validate dispute window
        DisputeService.validate_dispute_window(booking)

        # Check for existing dispute
        if hasattr(booking, "dispute"):
            raise ValidationError("A dispute already exists for this booking")

        # Validate reason and description
        if not reason or len(reason.strip()) < 5:
            raise ValidationError("Reason must be at least 5 characters long")

        if not description or len(description.strip()) < 20:
            raise ValidationError("Description must be at least 20 characters long")

        # Create dispute
        with transaction.atomic():
            dispute = Dispute.objects.create(
                booking=booking,
                raised_by=raised_by_user,
                reason=reason.strip(),
                description=description.strip(),
                evidence=evidence or [],
                status="OPEN",
            )

            # Update booking status to DISPUTED
            booking.status = "DISPUTED"
            booking.save(update_fields=["status", "updated_at"])

        return dispute

    @staticmethod
    def validate_dispute_window(booking: Booking) -> None:
        """
        Validate that dispute is raised within allowed window.

        Args:
            booking: Booking instance

        Raises:
            ValidationError: If outside dispute window
        """
        # Calculate time since booking completion/cancellation
        reference_time = booking.updated_at
        time_elapsed = timezone.now() - reference_time

        if time_elapsed > timedelta(days=DisputeService.DISPUTE_WINDOW_DAYS):
            raise ValidationError(
                f"Disputes must be raised within {DisputeService.DISPUTE_WINDOW_DAYS} days "
                f"of booking completion or cancellation"
            )

    @staticmethod
    def add_evidence(dispute_id: str, user, evidence_item: dict) -> Dispute:
        """
        Add evidence to an existing dispute.

        Args:
            dispute_id: UUID of the dispute
            user: User adding evidence
            evidence_item: Dictionary with evidence data (url, type, description)

        Returns:
            Updated Dispute instance

        Raises:
            NotFoundError: If dispute doesn't exist
            PermissionDeniedError: If user not authorized
            ValidationError: If dispute is closed
        """
        # Get dispute
        try:
            dispute = Dispute.objects.select_related(
                "booking__customer", "booking__provider__user", "raised_by"
            ).get(id=dispute_id)
        except Dispute.DoesNotExist:
            raise NotFoundError("Dispute not found")

        # Validate user is part of the dispute
        booking = dispute.booking
        if user.id not in [booking.customer.id, booking.provider.user.id]:
            raise PermissionDeniedError(
                "Only the customer or provider can add evidence to this dispute"
            )

        # Validate dispute is still open
        if dispute.status in ["RESOLVED", "CLOSED"]:
            raise ValidationError("Cannot add evidence to a resolved or closed dispute")

        # Validate evidence item
        if not isinstance(evidence_item, dict):
            raise ValidationError("Evidence item must be a dictionary")

        if "url" not in evidence_item:
            raise ValidationError("Evidence item must contain a 'url' field")

        # Add timestamp and user info to evidence
        evidence_item["added_by"] = str(user.id)
        evidence_item["added_at"] = timezone.now().isoformat()

        # Add evidence
        dispute.evidence.append(evidence_item)
        dispute.save(update_fields=["evidence", "updated_at"])

        return dispute

    @staticmethod
    def get_dispute(dispute_id: str, user) -> Dispute:
        """
        Get dispute details.

        Args:
            dispute_id: UUID of the dispute
            user: User requesting the dispute

        Returns:
            Dispute instance

        Raises:
            NotFoundError: If dispute doesn't exist
            PermissionDeniedError: If user not authorized
        """
        try:
            dispute = Dispute.objects.select_related(
                "booking__customer", "booking__provider__user", "raised_by", "resolved_by"
            ).get(id=dispute_id)
        except Dispute.DoesNotExist:
            raise NotFoundError("Dispute not found")

        # Check permissions (customer, provider, or admin)
        booking = dispute.booking
        if not (
            user.is_admin or user.id == booking.customer.id or user.id == booking.provider.user.id
        ):
            raise PermissionDeniedError("You don't have permission to view this dispute")

        return dispute


class DisputeResolutionService:
    """
    Service for admin dispute resolution.

    Handles:
    - Status updates (admin only)
    - Dispute resolution
    - Dispute closure
    """

    @staticmethod
    def update_dispute_status(
        dispute_id: str, admin_user, new_status: str, notes: str = None
    ) -> Dispute:
        """
        Update dispute status (admin only).

        Args:
            dispute_id: UUID of the dispute
            admin_user: Admin user performing the update
            new_status: New status value
            notes: Optional notes about the status change

        Returns:
            Updated Dispute instance

        Raises:
            NotFoundError: If dispute doesn't exist
            PermissionDeniedError: If user is not admin
            ValidationError: If status transition is invalid
        """
        # Validate admin permission
        if not admin_user.is_admin:
            raise PermissionDeniedError("Only administrators can update dispute status")

        # Get dispute
        try:
            dispute = Dispute.objects.select_related("booking").get(id=dispute_id)
        except Dispute.DoesNotExist:
            raise NotFoundError("Dispute not found")

        # Validate status
        valid_statuses = [choice[0] for choice in Dispute.STATUS_CHOICES]
        if new_status not in valid_statuses:
            raise ValidationError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

        # Validate status transition
        if dispute.status == "CLOSED" and new_status != "CLOSED":
            raise ValidationError("Cannot change status of a closed dispute")

        # Update status
        old_status = dispute.status
        dispute.status = new_status

        # If moving to RESOLVED or CLOSED, set resolved timestamp
        if new_status in ["RESOLVED", "CLOSED"] and not dispute.resolved_at:
            dispute.resolved_at = timezone.now()
            dispute.resolved_by = admin_user

        dispute.save(update_fields=["status", "resolved_at", "resolved_by", "updated_at"])

        return dispute

    @staticmethod
    def resolve_dispute(dispute_id: str, admin_user, resolution: str) -> Dispute:
        """
        Resolve a dispute with resolution text.

        Args:
            dispute_id: UUID of the dispute
            admin_user: Admin user resolving the dispute
            resolution: Resolution text explaining the decision

        Returns:
            Resolved Dispute instance

        Raises:
            NotFoundError: If dispute doesn't exist
            PermissionDeniedError: If user is not admin
            ValidationError: If resolution is invalid or dispute already resolved
        """
        # Validate admin permission
        if not admin_user.is_admin:
            raise PermissionDeniedError("Only administrators can resolve disputes")

        # Get dispute
        try:
            dispute = Dispute.objects.select_related("booking").get(id=dispute_id)
        except Dispute.DoesNotExist:
            raise NotFoundError("Dispute not found")

        # Validate dispute is not already resolved
        if dispute.status in ["RESOLVED", "CLOSED"]:
            raise ValidationError("Dispute is already resolved or closed")

        # Validate resolution text
        if not resolution or len(resolution.strip()) < 20:
            raise ValidationError("Resolution must be at least 20 characters long")

        # Resolve dispute
        with transaction.atomic():
            dispute.status = "RESOLVED"
            dispute.resolution = resolution.strip()
            dispute.resolved_by = admin_user
            dispute.resolved_at = timezone.now()
            dispute.save(
                update_fields=["status", "resolution", "resolved_by", "resolved_at", "updated_at"]
            )

        return dispute

    @staticmethod
    def close_dispute(dispute_id: str, admin_user) -> Dispute:
        """
        Close a resolved dispute.

        Args:
            dispute_id: UUID of the dispute
            admin_user: Admin user closing the dispute

        Returns:
            Closed Dispute instance

        Raises:
            NotFoundError: If dispute doesn't exist
            PermissionDeniedError: If user is not admin
            ValidationError: If dispute is not resolved
        """
        # Validate admin permission
        if not admin_user.is_admin:
            raise PermissionDeniedError("Only administrators can close disputes")

        # Get dispute
        try:
            dispute = Dispute.objects.get(id=dispute_id)
        except Dispute.DoesNotExist:
            raise NotFoundError("Dispute not found")

        # Validate dispute is resolved
        if dispute.status != "RESOLVED":
            raise ValidationError("Only resolved disputes can be closed")

        # Close dispute
        dispute.status = "CLOSED"
        dispute.save(update_fields=["status", "updated_at"])

        return dispute
