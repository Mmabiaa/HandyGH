"""
Admin configuration for authentication app.
"""

from django.contrib import admin
from .models import OTPToken, RefreshToken


@admin.register(OTPToken)
class OTPTokenAdmin(admin.ModelAdmin):
    """Admin interface for OTP tokens."""
    
    list_display = ['phone', 'created_at', 'expires_at', 'attempts', 'verified']
    list_filter = ['verified', 'created_at']
    search_fields = ['phone']
    readonly_fields = ['id', 'code_hash', 'created_at', 'expires_at']
    ordering = ['-created_at']
    
    def has_add_permission(self, request):
        """Disable manual OTP creation."""
        return False


@admin.register(RefreshToken)
class RefreshTokenAdmin(admin.ModelAdmin):
    """Admin interface for refresh tokens."""
    
    list_display = ['user', 'created_at', 'expires_at', 'revoked', 'ip_address']
    list_filter = ['revoked', 'created_at']
    search_fields = ['user__phone', 'user__name', 'ip_address']
    readonly_fields = ['id', 'token_hash', 'created_at', 'expires_at']
    ordering = ['-created_at']
    
    def has_add_permission(self, request):
        """Disable manual token creation."""
        return False
