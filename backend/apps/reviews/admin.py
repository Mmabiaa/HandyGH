"""
Admin configuration for reviews app.
"""

from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """Admin interface for Review model."""
    
    list_display = [
        'id',
        'booking',
        'customer',
        'provider',
        'rating',
        'created_at',
    ]
    
    list_filter = [
        'rating',
        'created_at',
    ]
    
    search_fields = [
        'booking__booking_ref',
        'customer__name',
        'customer__phone',
        'provider__business_name',
        'provider__user__name',
        'comment',
    ]
    
    readonly_fields = [
        'id',
        'booking',
        'customer',
        'provider',
        'rating',
        'comment',
        'created_at',
    ]
    
    ordering = ['-created_at']
    
    def has_add_permission(self, request):
        """Disable adding reviews through admin."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Disable editing reviews through admin."""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete reviews."""
        return request.user.is_superuser
