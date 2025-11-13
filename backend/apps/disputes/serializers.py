"""
Serializers for disputes app.

Design Decisions:
- Separate serializers for create, list, and detail views
- Nested serializers for related objects
- Validation at serializer level
- Read-only fields for computed/system-managed data

SOLID Principles:
- Single Responsibility: Each serializer handles specific use case
- Open/Closed: Easy to extend with new fields
"""

from rest_framework import serializers

from apps.bookings.serializers import BookingDetailSerializer
from apps.users.serializers import UserSerializer

from .models import Dispute


class DisputeCreateSerializer(serializers.Serializer):
    """Serializer for creating disputes."""

    booking_id = serializers.UUIDField(required=True)
    reason = serializers.CharField(
        required=True, min_length=5, max_length=255, help_text="Short reason for the dispute"
    )
    description = serializers.CharField(
        required=True, min_length=20, help_text="Detailed description of the issue"
    )
    evidence = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_empty=True,
        help_text="List of evidence items (URLs, metadata)",
    )

    def validate_evidence(self, value):
        """Validate evidence items."""
        if value:
            for item in value:
                if not isinstance(item, dict):
                    raise serializers.ValidationError("Each evidence item must be a dictionary")
                if "url" not in item:
                    raise serializers.ValidationError(
                        "Each evidence item must contain a 'url' field"
                    )
        return value


class DisputeListSerializer(serializers.ModelSerializer):
    """Serializer for listing disputes."""

    booking_ref = serializers.CharField(source="booking.booking_ref", read_only=True)
    raised_by_name = serializers.CharField(source="raised_by.name", read_only=True)
    raised_by_phone = serializers.CharField(source="raised_by.phone", read_only=True)
    days_since_created = serializers.IntegerField(read_only=True)

    class Meta:
        model = Dispute
        fields = [
            "id",
            "booking_ref",
            "raised_by_name",
            "raised_by_phone",
            "reason",
            "status",
            "days_since_created",
            "created_at",
            "resolved_at",
        ]
        read_only_fields = fields


class DisputeDetailSerializer(serializers.ModelSerializer):
    """Serializer for dispute details."""

    booking = BookingDetailSerializer(read_only=True)
    raised_by = UserSerializer(read_only=True)
    resolved_by = UserSerializer(read_only=True)
    is_open = serializers.BooleanField(read_only=True)
    is_resolved = serializers.BooleanField(read_only=True)
    days_since_created = serializers.IntegerField(read_only=True)

    class Meta:
        model = Dispute
        fields = [
            "id",
            "booking",
            "raised_by",
            "reason",
            "description",
            "evidence",
            "status",
            "resolution",
            "resolved_by",
            "resolved_at",
            "is_open",
            "is_resolved",
            "days_since_created",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class DisputeUpdateSerializer(serializers.Serializer):
    """Serializer for updating dispute status (admin only)."""

    status = serializers.ChoiceField(
        choices=Dispute.STATUS_CHOICES, required=True, help_text="New dispute status"
    )
    notes = serializers.CharField(
        required=False, allow_blank=True, help_text="Optional notes about the status change"
    )


class DisputeResolveSerializer(serializers.Serializer):
    """Serializer for resolving disputes (admin only)."""

    resolution = serializers.CharField(
        required=True, min_length=20, help_text="Resolution text explaining the decision"
    )


class AddEvidenceSerializer(serializers.Serializer):
    """Serializer for adding evidence to disputes."""

    url = serializers.URLField(required=True, help_text="URL to the evidence file")
    type = serializers.CharField(
        required=False, max_length=50, help_text="Type of evidence (photo, document, etc.)"
    )
    description = serializers.CharField(
        required=False, allow_blank=True, help_text="Description of the evidence"
    )
