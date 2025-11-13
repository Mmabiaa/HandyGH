"""
Admin configuration for payments app.
"""

from django.contrib import admin

from .models import Commission, Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """Admin interface for Transaction model."""

    list_display = [
        "id",
        "booking",
        "customer",
        "amount",
        "commission_amount",
        "status",
        "txn_provider",
        "created_at",
    ]
    list_filter = ["status", "txn_provider", "created_at"]
    search_fields = ["id", "booking__booking_ref", "txn_provider_ref", "customer__phone"]
    readonly_fields = ["id", "created_at", "updated_at"]
    date_hierarchy = "created_at"

    fieldsets = (
        ("Transaction Information", {"fields": ("id", "booking", "customer", "provider")}),
        ("Payment Details", {"fields": ("amount", "commission_amount", "currency", "status")}),
        (
            "Provider Information",
            {"fields": ("txn_provider", "txn_provider_ref", "idempotency_key")},
        ),
        ("Metadata", {"fields": ("metadata",), "classes": ("collapse",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )


@admin.register(Commission)
class CommissionAdmin(admin.ModelAdmin):
    """Admin interface for Commission model."""

    list_display = [
        "name",
        "rate",
        "flat_fee",
        "applies_to",
        "is_active",
        "created_at",
    ]
    list_filter = ["is_active", "applies_to", "created_at"]
    search_fields = ["name", "category"]
    readonly_fields = ["id", "created_at", "updated_at"]

    fieldsets = (
        ("Commission Configuration", {"fields": ("id", "name", "rate", "flat_fee", "is_active")}),
        ("Application Rules", {"fields": ("applies_to", "category", "provider")}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )
