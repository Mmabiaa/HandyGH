"""
Admin configuration for messaging app.
"""

from django.contrib import admin

from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """Admin interface for Message model."""

    list_display = [
        "id",
        "booking",
        "sender",
        "content_preview",
        "has_attachments",
        "created_at",
    ]

    list_filter = [
        "created_at",
    ]

    search_fields = [
        "booking__booking_ref",
        "sender__phone",
        "sender__name",
        "content",
    ]

    readonly_fields = [
        "id",
        "created_at",
    ]

    ordering = ["-created_at"]

    @admin.display(description="Content")
    def content_preview(self, obj):
        """Show preview of message content."""
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content

    @admin.display(
        description="Attachments",
        boolean=True,
    )
    def has_attachments(self, obj):
        """Show if message has attachments."""
        return obj.has_attachments
