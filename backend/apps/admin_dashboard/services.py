"""
Admin dashboard services for HandyGH.

Design Decisions:
- AdminReportService provides aggregated statistics and reports
- UserModerationService handles user account management
- DataExportService generates CSV exports for data analysis
- All services use Django ORM aggregation for efficiency

SOLID Principles:
- Single Responsibility: Each service handles specific admin domain
- Open/Closed: Easy to extend with new report types
- Dependency Inversion: Services depend on abstractions (models)
"""

import csv
from datetime import datetime, timedelta
from decimal import Decimal
from io import StringIO
from typing import Dict, List, Optional
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from apps.users.models import User
from apps.bookings.models import Booking
from apps.payments.models import Transaction
from apps.providers.models import Provider
from apps.authentication.models import RefreshToken


class AdminReportService:
    """
    Service for generating admin reports and statistics.
    
    Provides methods to get dashboard statistics, user statistics,
    booking statistics, and transaction statistics.
    """
    
    @staticmethod
    def get_dashboard_stats() -> Dict:
        """
        Get overview statistics for admin dashboard.
        
        Returns:
            Dict containing:
                - total_users: Total number of users
                - total_customers: Number of customers
                - total_providers: Number of providers
                - active_users: Users active in last 30 days
                - total_bookings: Total number of bookings
                - active_bookings: Bookings in active states
                - completed_bookings: Completed bookings
                - total_revenue: Total successful transaction amount
                - commission_earned: Total commission earned
                - pending_payouts: Amount pending payout to providers
        """
        # User statistics
        total_users = User.objects.count()
        total_customers = User.objects.filter(role='CUSTOMER').count()
        total_providers = User.objects.filter(role='PROVIDER').count()
        
        # Active users (logged in within last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        active_users = RefreshToken.objects.filter(
            created_at__gte=thirty_days_ago
        ).values('user').distinct().count()
        
        # Booking statistics
        total_bookings = Booking.objects.count()
        active_bookings = Booking.objects.filter(
            status__in=['REQUESTED', 'CONFIRMED', 'IN_PROGRESS']
        ).count()
        completed_bookings = Booking.objects.filter(status='COMPLETED').count()
        
        # Transaction statistics
        transaction_stats = Transaction.objects.filter(
            status='SUCCESS'
        ).aggregate(
            total_revenue=Sum('amount'),
            commission_earned=Sum('commission_amount')
        )
        
        total_revenue = transaction_stats['total_revenue'] or Decimal('0.00')
        commission_earned = transaction_stats['commission_earned'] or Decimal('0.00')
        
        # Pending payouts (successful transactions where provider hasn't been paid)
        pending_payouts = Transaction.objects.filter(
            status='SUCCESS'
        ).aggregate(
            pending=Sum('amount') - Sum('commission_amount')
        )['pending'] or Decimal('0.00')
        
        return {
            'total_users': total_users,
            'total_customers': total_customers,
            'total_providers': total_providers,
            'active_users': active_users,
            'total_bookings': total_bookings,
            'active_bookings': active_bookings,
            'completed_bookings': completed_bookings,
            'total_revenue': str(total_revenue),
            'commission_earned': str(commission_earned),
            'pending_payouts': str(pending_payouts),
        }
    
    @staticmethod
    def get_user_statistics(
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict:
        """
        Get detailed user statistics.
        
        Args:
            start_date: Optional start date for filtering
            end_date: Optional end date for filtering
            
        Returns:
            Dict containing user statistics by role, status, and time period
        """
        queryset = User.objects.all()
        
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        # Users by role
        users_by_role = queryset.values('role').annotate(
            count=Count('id')
        ).order_by('role')
        
        # Users by status
        active_users = queryset.filter(is_active=True).count()
        inactive_users = queryset.filter(is_active=False).count()
        
        # New users over time (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        new_users_last_30_days = queryset.filter(
            created_at__gte=thirty_days_ago
        ).count()
        
        # Provider verification status
        verified_providers = Provider.objects.filter(verified=True).count()
        unverified_providers = Provider.objects.filter(verified=False).count()
        
        return {
            'total_users': queryset.count(),
            'users_by_role': list(users_by_role),
            'active_users': active_users,
            'inactive_users': inactive_users,
            'new_users_last_30_days': new_users_last_30_days,
            'verified_providers': verified_providers,
            'unverified_providers': unverified_providers,
        }
    
    @staticmethod
    def get_booking_statistics(
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict:
        """
        Get detailed booking statistics.
        
        Args:
            start_date: Optional start date for filtering
            end_date: Optional end date for filtering
            
        Returns:
            Dict containing booking statistics by status, time period, and trends
        """
        queryset = Booking.objects.all()
        
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        # Bookings by status
        bookings_by_status = queryset.values('status').annotate(
            count=Count('id')
        ).order_by('status')
        
        # Booking amounts
        booking_amounts = queryset.aggregate(
            total_booking_amount=Sum('total_amount'),
            avg_booking_amount=Avg('total_amount'),
            total_booking_commission=Sum('commission_amount')
        )
        
        # Bookings by payment status
        bookings_by_payment_status = queryset.values('payment_status').annotate(
            count=Count('id')
        ).order_by('payment_status')
        
        # Recent trends (last 7 days)
        seven_days_ago = timezone.now() - timedelta(days=7)
        recent_bookings = queryset.filter(created_at__gte=seven_days_ago).count()
        
        # Completion rate
        total_bookings = queryset.count()
        completed_bookings = queryset.filter(status='COMPLETED').count()
        completion_rate = (completed_bookings / total_bookings * 100) if total_bookings > 0 else 0
        
        # Cancellation rate
        cancelled_bookings = queryset.filter(status='CANCELLED').count()
        cancellation_rate = (cancelled_bookings / total_bookings * 100) if total_bookings > 0 else 0
        
        return {
            'total_bookings': total_bookings,
            'bookings_by_status': list(bookings_by_status),
            'bookings_by_payment_status': list(bookings_by_payment_status),
            'total_amount': str(booking_amounts['total_booking_amount'] or Decimal('0.00')),
            'avg_amount': str(booking_amounts['avg_booking_amount'] or Decimal('0.00')),
            'total_commission': str(booking_amounts['total_booking_commission'] or Decimal('0.00')),
            'recent_bookings_7_days': recent_bookings,
            'completion_rate': round(completion_rate, 2),
            'cancellation_rate': round(cancellation_rate, 2),
        }
    
    @staticmethod
    def get_transaction_statistics(
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict:
        """
        Get detailed transaction statistics.
        
        Args:
            start_date: Optional start date for filtering
            end_date: Optional end date for filtering
            
        Returns:
            Dict containing transaction statistics by status, provider, and trends
        """
        queryset = Transaction.objects.all()
        
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        # Transactions by status
        transactions_by_status = queryset.values('status').annotate(
            count=Count('id'),
            total_amount=Sum('amount')
        ).order_by('status')
        
        # Transactions by provider
        transactions_by_provider = queryset.values('txn_provider').annotate(
            count=Count('id'),
            total_amount=Sum('amount')
        ).order_by('txn_provider')
        
        # Success metrics
        total_transactions = queryset.count()
        successful_transactions = queryset.filter(status='SUCCESS').count()
        success_rate = (successful_transactions / total_transactions * 100) if total_transactions > 0 else 0
        
        # Revenue metrics
        revenue_metrics = queryset.filter(status='SUCCESS').aggregate(
            total_revenue=Sum('amount'),
            total_commission=Sum('commission_amount'),
            avg_transaction=Avg('amount')
        )
        
        # Failed transactions
        failed_transactions = queryset.filter(status='FAILED').count()
        failure_rate = (failed_transactions / total_transactions * 100) if total_transactions > 0 else 0
        
        # Refunded transactions
        refunded_transactions = queryset.filter(status='REFUNDED')
        refunded_count = refunded_transactions.count()
        refunded_amount = refunded_transactions.aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        return {
            'total_transactions': total_transactions,
            'transactions_by_status': list(transactions_by_status),
            'transactions_by_provider': list(transactions_by_provider),
            'successful_transactions': successful_transactions,
            'success_rate': round(success_rate, 2),
            'failed_transactions': failed_transactions,
            'failure_rate': round(failure_rate, 2),
            'refunded_count': refunded_count,
            'refunded_amount': str(refunded_amount),
            'total_revenue': str(revenue_metrics['total_revenue'] or Decimal('0.00')),
            'total_commission': str(revenue_metrics['total_commission'] or Decimal('0.00')),
            'avg_transaction': str(revenue_metrics['avg_transaction'] or Decimal('0.00')),
        }


class UserModerationService:
    """
    Service for user moderation operations.
    
    Provides methods to suspend, activate users, and revoke sessions.
    """
    
    @staticmethod
    def suspend_user(user_id: str, reason: str = '') -> Dict:
        """
        Suspend a user account.
        
        Args:
            user_id: UUID of the user to suspend
            reason: Optional reason for suspension
            
        Returns:
            Dict with success status and message
            
        Raises:
            User.DoesNotExist: If user not found
        """
        user = User.objects.get(id=user_id)
        
        if not user.is_active:
            return {
                'success': False,
                'message': 'User is already suspended'
            }
        
        user.deactivate()
        
        # Revoke all active sessions
        UserModerationService.revoke_all_sessions(user_id)
        
        return {
            'success': True,
            'message': f'User {user.phone} has been suspended',
            'user_id': str(user.id),
            'reason': reason
        }
    
    @staticmethod
    def activate_user(user_id: str) -> Dict:
        """
        Activate a suspended user account.
        
        Args:
            user_id: UUID of the user to activate
            
        Returns:
            Dict with success status and message
            
        Raises:
            User.DoesNotExist: If user not found
        """
        user = User.objects.get(id=user_id)
        
        if user.is_active:
            return {
                'success': False,
                'message': 'User is already active'
            }
        
        user.activate()
        
        return {
            'success': True,
            'message': f'User {user.phone} has been activated',
            'user_id': str(user.id)
        }
    
    @staticmethod
    def revoke_all_sessions(user_id: str) -> Dict:
        """
        Revoke all active sessions for a user.
        
        Args:
            user_id: UUID of the user
            
        Returns:
            Dict with count of revoked sessions
        """
        # Delete all refresh tokens for the user
        deleted_count = RefreshToken.objects.filter(user_id=user_id).delete()[0]
        
        return {
            'success': True,
            'message': f'Revoked {deleted_count} session(s)',
            'revoked_count': deleted_count
        }


class DataExportService:
    """
    Service for exporting data to CSV format.
    
    Provides methods to export users, bookings, and transactions.
    """
    
    @staticmethod
    def export_transactions_csv(
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> str:
        """
        Export transactions to CSV format.
        
        Args:
            start_date: Optional start date for filtering
            end_date: Optional end date for filtering
            
        Returns:
            CSV string
        """
        queryset = Transaction.objects.select_related(
            'booking', 'customer', 'provider'
        ).all()
        
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        output = StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'Transaction ID',
            'Booking Reference',
            'Customer Phone',
            'Provider Phone',
            'Amount',
            'Commission',
            'Currency',
            'Status',
            'Payment Provider',
            'Provider Reference',
            'Created At',
            'Updated At'
        ])
        
        # Write data
        for txn in queryset:
            writer.writerow([
                str(txn.id),
                txn.booking.booking_ref,
                txn.customer.phone,
                txn.provider.phone,
                str(txn.amount),
                str(txn.commission_amount),
                txn.currency,
                txn.status,
                txn.txn_provider,
                txn.txn_provider_ref,
                txn.created_at.isoformat(),
                txn.updated_at.isoformat()
            ])
        
        return output.getvalue()
    
    @staticmethod
    def export_bookings_csv(
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> str:
        """
        Export bookings to CSV format.
        
        Args:
            start_date: Optional start date for filtering
            end_date: Optional end date for filtering
            
        Returns:
            CSV string
        """
        queryset = Booking.objects.select_related(
            'customer', 'provider', 'provider_service'
        ).all()
        
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        output = StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'Booking ID',
            'Booking Reference',
            'Customer Phone',
            'Provider Business Name',
            'Service Title',
            'Status',
            'Scheduled Start',
            'Scheduled End',
            'Total Amount',
            'Commission Amount',
            'Payment Status',
            'Address',
            'Created At',
            'Updated At'
        ])
        
        # Write data
        for booking in queryset:
            writer.writerow([
                str(booking.id),
                booking.booking_ref,
                booking.customer.phone,
                booking.provider.business_name or booking.provider.user.name,
                booking.provider_service.title,
                booking.status,
                booking.scheduled_start.isoformat(),
                booking.scheduled_end.isoformat() if booking.scheduled_end else '',
                str(booking.total_amount),
                str(booking.commission_amount) if booking.commission_amount else '',
                booking.payment_status,
                booking.address,
                booking.created_at.isoformat(),
                booking.updated_at.isoformat()
            ])
        
        return output.getvalue()
    
    @staticmethod
    def export_users_csv(
        role: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> str:
        """
        Export users to CSV format.
        
        Args:
            role: Optional role filter (CUSTOMER, PROVIDER, ADMIN)
            is_active: Optional active status filter
            
        Returns:
            CSV string
        """
        queryset = User.objects.all()
        
        if role:
            queryset = queryset.filter(role=role)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active)
        
        output = StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'User ID',
            'Phone',
            'Email',
            'Name',
            'Role',
            'Is Active',
            'Created At',
            'Updated At'
        ])
        
        # Write data
        for user in queryset:
            writer.writerow([
                str(user.id),
                user.phone,
                user.email or '',
                user.name,
                user.role,
                'Yes' if user.is_active else 'No',
                user.created_at.isoformat(),
                user.updated_at.isoformat()
            ])
        
        return output.getvalue()
