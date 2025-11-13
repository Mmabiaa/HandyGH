"""
Django admin configuration for providers app.

Design Decisions:
- Comprehensive admin interface for provider management
- Inline editing for provider services
- Search and filter capabilities
- Custom actions for verification
"""

from django.contrib import admin

from .models import Provider, ProviderService, ServiceCategory


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    """Admin interface for ServiceCategory model."""

    list_display = ["name", "slug", "is_active", "created_at"]
    list_filter = ["is_active", "created_at"]
    search_fields = ["name", "slug", "description"]
    prepopulated_fields = {"slug": ("name",)}
    ordering = ["name"]


class ProviderServiceInline(admin.TabularInline):
    """Inline admin for provider services."""

    model = ProviderService
    extra = 0
    fields = ["title", "category", "price_type", "price_amount", "is_active"]
    readonly_fields = ["created_at"]


@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    """Admin interface for Provider model."""

    list_display = [
        "display_name",
        "user",
        "verified",
        "rating_avg",
        "rating_count",
        "is_active",
        "created_at",
    ]
    list_filter = ["verified", "is_active", "created_at"]
    search_fields = ["business_name", "user__name", "user__phone", "user__email", "address"]
    readonly_fields = [
        "id",
        "rating_avg",
        "rating_count",
        "response_time_avg",
        "created_at",
        "updated_at",
    ]
    inlines = [ProviderServiceInline]

    fieldsets = (
        ("Basic Information", {"fields": ("id", "user", "business_name", "categories")}),
        ("Location", {"fields": ("latitude", "longitude", "address")}),
        ("Verification", {"fields": ("verified", "verification_doc_url")}),
        ("Ratings & Performance", {"fields": ("rating_avg", "rating_count", "response_time_avg")}),
        ("Status", {"fields": ("is_active",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    actions = [
        "verify_providers",
        "unverify_providers",
        "activate_providers",
        "deactivate_providers",
    ]

    @admin.action(description="Verify selected providers")
    def verify_providers(self, request, queryset):
        """Verify selected providers."""
        count = queryset.update(verified=True)
        self.message_user(request, f"{count} provider(s) verified successfully.")

    @admin.action(description="Unverify selected providers")
    def unverify_providers(self, request, queryset):
        """Remove verification from selected providers."""
        count = queryset.update(verified=False)
        self.message_user(request, f"{count} provider(s) unverified successfully.")

    @admin.action(description="Activate selected providers")
    def activate_providers(self, request, queryset):
        """Activate selected providers."""
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} provider(s) activated successfully.")

    @admin.action(description="Deactivate selected providers")
    def deactivate_providers(self, request, queryset):
        """Deactivate selected providers."""
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} provider(s) deactivated successfully.")


@admin.register(ProviderService)
class ProviderServiceAdmin(admin.ModelAdmin):
    """Admin interface for ProviderService model."""

    list_display = [
        "title",
        "provider",
        "category",
        "price_type",
        "price_amount",
        "is_active",
        "created_at",
    ]
    list_filter = ["price_type", "is_active", "category", "created_at"]
    search_fields = ["title", "description", "provider__business_name", "provider__user__name"]
    readonly_fields = ["id", "created_at", "updated_at"]

    fieldsets = (
        ("Basic Information", {"fields": ("id", "provider", "category", "title", "description")}),
        ("Pricing", {"fields": ("price_type", "price_amount", "duration_estimate_min")}),
        ("Status", {"fields": ("is_active",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    actions = ["activate_services", "deactivate_services"]

    @admin.action(description="Activate selected services")
    def activate_services(self, request, queryset):
        """Activate selected services."""
        count = queryset.update(is_active=True)
        self.message_user(request, f"{count} service(s) activated successfully.")

    @admin.action(description="Deactivate selected services")
    def deactivate_services(self, request, queryset):
        """Deactivate selected services."""
        count = queryset.update(is_active=False)
        self.message_user(request, f"{count} service(s) deactivated successfully.")
