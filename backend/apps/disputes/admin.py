"""
Django admin configuration for disputes app.
"""

from django.contrib import admin

from .models import Dispute


@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    """Admin interface for Dispute model."""

    list_display = [
        "id",
        "booking",
        "raised_by",
        "status",
        "created_at",
        "resolved_at",
    ]

    list_filter = [
        "status",
        "created_at",
        "resolved_at",
    ]

    search_fields = [
        "booking__booking_ref",
        "raised_by__name",
        "raised_by__phone",
        "reason",
        "description",
    ]

    readonly_fields = [
        "id",
        "created_at",
        "updated_at",
    ]

    fieldsets = (
        (
            "Dispute Information",
            {
                "fields": (
                    "id",
                    "booking",
                    "raised_by",
                    "reason",
                    "description",
                    "evidence",
                    "status",
                )
            },
        ),
        (
            "Resolution",
            {
                "fields": (
                    "resolution",
                    "resolved_by",
                    "resolved_at",
                )
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    ordering = ["-created_at"]
