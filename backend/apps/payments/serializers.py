"""
Serializers for payments app.
"""

from rest_framework import serializers

from apps.bookings.models import Booking

from .models import Commission, Transaction


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model."""

    booking_ref = serializers.CharField(source="booking.booking_ref", read_only=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    customer_phone = serializers.CharField(source="customer.phone", read_only=True)
    provider_name = serializers.CharField(source="provider.name", read_only=True)
    provider_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id",
            "booking",
            "booking_ref",
            "customer",
            "customer_name",
            "customer_phone",
            "provider",
            "provider_name",
            "amount",
            "commission_amount",
            "provider_amount",
            "currency",
            "status",
            "txn_provider",
            "txn_provider_ref",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "customer",
            "provider",
            "commission_amount",
            "status",
            "txn_provider_ref",
            "created_at",
            "updated_at",
        ]


class MoMoChargeRequestSerializer(serializers.Serializer):
    """Serializer for MoMo charge request."""

    booking_id = serializers.UUIDField(required=True)
    phone = serializers.CharField(max_length=20, required=True)

    def validate_booking_id(self, value):
        """Validate booking exists and is valid for payment."""
        try:
            booking = Booking.objects.get(id=value)
        except Booking.DoesNotExist:
            raise serializers.ValidationError("Booking not found")

        if booking.payment_status == "PAID":
            raise serializers.ValidationError("Booking is already paid")

        if booking.status == "CANCELLED":
            raise serializers.ValidationError("Cannot pay for cancelled booking")

        return value


class MoMoChargeResponseSerializer(serializers.Serializer):
    """Serializer for MoMo charge response."""

    transaction_id = serializers.UUIDField()
    status = serializers.CharField()
    message = serializers.CharField()
    provider_ref = serializers.CharField(required=False, allow_null=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)


class MoMoWebhookSerializer(serializers.Serializer):
    """Serializer for MoMo webhook payload."""

    transaction_ref = serializers.CharField(required=True)
    status = serializers.ChoiceField(choices=["SUCCESS", "FAILED", "PENDING"], required=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=True)
    phone = serializers.CharField(max_length=20, required=True)
    provider_ref = serializers.CharField(required=False, allow_blank=True)
    message = serializers.CharField(required=False, allow_blank=True)


class ManualPaymentConfirmSerializer(serializers.Serializer):
    """Serializer for manual payment confirmation."""

    booking_id = serializers.UUIDField(required=True)
    transaction_ref = serializers.CharField(max_length=255, required=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=True)
    payment_method = serializers.ChoiceField(choices=["MOMO", "BANK", "CASH"], default="MOMO")
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_booking_id(self, value):
        """Validate booking exists."""
        try:
            booking = Booking.objects.get(id=value)
        except Booking.DoesNotExist:
            raise serializers.ValidationError("Booking not found")

        if booking.payment_status == "PAID":
            raise serializers.ValidationError("Booking is already paid")

        return value

    def validate_amount(self, value):
        """Validate amount is positive."""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")
        return value


class CommissionSerializer(serializers.ModelSerializer):
    """Serializer for Commission model."""

    class Meta:
        model = Commission
        fields = [
            "id",
            "name",
            "rate",
            "flat_fee",
            "is_active",
            "applies_to",
            "category",
            "provider",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
