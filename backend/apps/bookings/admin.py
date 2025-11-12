"""
Admin configuration for bookings app.
"""

from django.contrib import admin
from apps.bookings.models import Booking, BookingStatusHistory


class BookingStatusHistoryInline(admin.TabularInline):
    """Inline admin for booking status history."""
    model = BookingStatusHistory
    extra = 0
    readonly_fields = ['from_status', 'to_status', 'changed_by', 'reason', 'created_at']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """Admin interface for Booking model."""
    
    list_display = [
        'booking_ref',
        'customer',
        'provider',
        'status',
        'scheduled_start',
        'total_amount',
        'payment_status',
        'created_at'
    ]
    
    list_filter = [
        'status',
        'payment_status',
        'created_at',
        'scheduled_start'
    ]
    
    search_fields = [
        'booking_ref',
        'customer__name',
        'customer__phone',
        'provider__business_name',
        'provider__user__name',
        'address'
    ]
    
    readonly_fields = [
        'id',
        'booking_ref',
        'created_at',
        'updated_at'
    ]
    
    fieldsets = (
        ('Booking Information', {
            'fields': (
                'id',
                'booking_ref',
                'status',
                'payment_status'
            )
        }),
        ('Parties', {
            'fields': (
                'customer',
                'provider',
                'provider_service'
            )
        }),
        ('Schedule', {
            'fields': (
                'scheduled_start',
                'scheduled_end',
                'address',
                'notes'
            )
        }),
        ('Financial', {
            'fields': (
                'total_amount',
                'commission_amount'
            )
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at'
            )
        }),
    )
    
    inlines = [BookingStatusHistoryInline]
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        qs = super().get_queryset(request)
        return qs.select_related(
            'customer',
            'provider',
            'provider__user',
            'provider_service'
        )


@admin.register(BookingStatusHistory)
class BookingStatusHistoryAdmin(admin.ModelAdmin):
    """Admin interface for BookingStatusHistory model."""
    
    list_display = [
        'booking',
        'from_status',
        'to_status',
        'changed_by',
        'created_at'
    ]
    
    list_filter = [
        'to_status',
        'created_at'
    ]
    
    search_fields = [
        'booking__booking_ref',
        'reason'
    ]
    
    readonly_fields = [
        'id',
        'booking',
        'from_status',
        'to_status',
        'changed_by',
        'reason',
        'created_at'
    ]
    
    def has_add_permission(self, request):
        """Prevent manual creation of status history."""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of status history."""
        return False
