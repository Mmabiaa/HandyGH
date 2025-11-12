"""
Admin dashboard serializers for HandyGH.

Design Decisions:
- Serializers for admin operations and reports
- Input validation for date ranges and filters
- Output formatting for statistics and exports

SOLID Principles:
- Single Responsibility: Each serializer handles specific data format
- Open/Closed: Easy to extend with new fields
"""

from rest_framework import serializers
from apps.users.models import User


class DateRangeSerializer(serializers.Serializer):
    """Serializer for date range filtering."""
    
    start_date = serializers.DateTimeField(required=False, allow_null=True)
    end_date = serializers.DateTimeField(required=False, allow_null=True)
    
    def validate(self, data):
        """Validate that start_date is before end_date."""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError(
                "start_date must be before end_date"
            )
        
        return data


class UserModerationSerializer(serializers.Serializer):
    """Serializer for user moderation actions."""
    
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
        help_text='Reason for the moderation action'
    )


class ExportFilterSerializer(serializers.Serializer):
    """Serializer for export filtering."""
    
    start_date = serializers.DateTimeField(required=False, allow_null=True)
    end_date = serializers.DateTimeField(required=False, allow_null=True)
    role = serializers.ChoiceField(
        choices=['CUSTOMER', 'PROVIDER', 'ADMIN'],
        required=False,
        allow_null=True
    )
    is_active = serializers.BooleanField(required=False, allow_null=True)
    export_type = serializers.ChoiceField(
        choices=['users', 'bookings', 'transactions'],
        required=True
    )


class AdminUserListSerializer(serializers.ModelSerializer):
    """Serializer for listing users in admin panel."""
    
    class Meta:
        model = User
        fields = [
            'id',
            'phone',
            'email',
            'name',
            'role',
            'is_active',
            'is_staff',
            'created_at',
            'updated_at'
        ]
        read_only_fields = fields


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics."""
    
    total_users = serializers.IntegerField()
    total_customers = serializers.IntegerField()
    total_providers = serializers.IntegerField()
    active_users = serializers.IntegerField()
    total_bookings = serializers.IntegerField()
    active_bookings = serializers.IntegerField()
    completed_bookings = serializers.IntegerField()
    total_revenue = serializers.CharField()
    commission_earned = serializers.CharField()
    pending_payouts = serializers.CharField()


class UserStatisticsSerializer(serializers.Serializer):
    """Serializer for user statistics."""
    
    total_users = serializers.IntegerField()
    users_by_role = serializers.ListField()
    active_users = serializers.IntegerField()
    inactive_users = serializers.IntegerField()
    new_users_last_30_days = serializers.IntegerField()
    verified_providers = serializers.IntegerField()
    unverified_providers = serializers.IntegerField()


class BookingStatisticsSerializer(serializers.Serializer):
    """Serializer for booking statistics."""
    
    total_bookings = serializers.IntegerField()
    bookings_by_status = serializers.ListField()
    bookings_by_payment_status = serializers.ListField()
    total_amount = serializers.CharField()
    avg_amount = serializers.CharField()
    total_commission = serializers.CharField()
    recent_bookings_7_days = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    cancellation_rate = serializers.FloatField()


class TransactionStatisticsSerializer(serializers.Serializer):
    """Serializer for transaction statistics."""
    
    total_transactions = serializers.IntegerField()
    transactions_by_status = serializers.ListField()
    transactions_by_provider = serializers.ListField()
    successful_transactions = serializers.IntegerField()
    success_rate = serializers.FloatField()
    failed_transactions = serializers.IntegerField()
    failure_rate = serializers.FloatField()
    refunded_count = serializers.IntegerField()
    refunded_amount = serializers.CharField()
    total_revenue = serializers.CharField()
    total_commission = serializers.CharField()
    avg_transaction = serializers.CharField()
