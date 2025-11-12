"""
Unit tests for AdminReportService.
"""

import pytest
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from apps.admin_dashboard.services import AdminReportService
from apps.users.models import User
from apps.bookings.models import Booking
from apps.payments.models import Transaction
from apps.authentication.models import RefreshToken


@pytest.mark.django_db
class TestAdminReportService:
    """Test AdminReportService methods."""
    
    def test_get_dashboard_stats(self, customer_user, provider_user, admin_user):
        """Test getting dashboard statistics."""
        stats = AdminReportService.get_dashboard_stats()
        
        assert 'total_users' in stats
        assert 'total_customers' in stats
        assert 'total_providers' in stats
        assert 'active_users' in stats
        assert 'total_bookings' in stats
        assert 'total_revenue' in stats
        assert 'commission_earned' in stats
        
        # Verify counts
        assert stats['total_users'] >= 3  # At least the 3 fixture users
        assert stats['total_customers'] >= 1
        assert stats['total_providers'] >= 1
    
    def test_get_dashboard_stats_with_bookings(
        self, customer_user, provider, provider_service
    ):
        """Test dashboard stats with bookings."""
        from apps.bookings.models import Booking
        
        # Create a booking
        scheduled_start = timezone.now() + timedelta(days=1)
        Booking.objects.create(
            booking_ref='BK-DASH-TEST',
            customer=customer_user,
            provider=provider,
            provider_service=provider_service,
            status='CONFIRMED',
            scheduled_start=scheduled_start,
            scheduled_end=scheduled_start + timedelta(hours=2),
            address='Test Address',
            total_amount=Decimal('100.00'),
            payment_status='PENDING'
        )
        
        stats = AdminReportService.get_dashboard_stats()
        
        assert stats['total_bookings'] >= 1
        assert stats['active_bookings'] >= 1
    
    def test_get_dashboard_stats_with_transactions(
        self, customer_user, provider_user, sample_booking
    ):
        """Test dashboard stats with transactions."""
        # Create a successful transaction
        Transaction.objects.create(
            booking=sample_booking,
            customer=customer_user,
            provider=provider_user,
            amount=Decimal('100.00'),
            commission_amount=Decimal('10.00'),
            status='SUCCESS',
            txn_provider='MOMO'
        )
        
        stats = AdminReportService.get_dashboard_stats()
        
        assert Decimal(stats['total_revenue']) >= Decimal('100.00')
        assert Decimal(stats['commission_earned']) >= Decimal('10.00')
    
    def test_get_user_statistics(self, customer_user, provider_user):
        """Test getting user statistics."""
        stats = AdminReportService.get_user_statistics()
        
        assert 'total_users' in stats
        assert 'users_by_role' in stats
        assert 'active_users' in stats
        assert 'inactive_users' in stats
        assert 'new_users_last_30_days' in stats
        
        assert stats['total_users'] >= 2
        assert isinstance(stats['users_by_role'], list)
    
    def test_get_user_statistics_with_date_range(self, customer_user):
        """Test user statistics with date range filtering."""
        start_date = timezone.now() - timedelta(days=7)
        end_date = timezone.now()
        
        stats = AdminReportService.get_user_statistics(
            start_date=start_date,
            end_date=end_date
        )
        
        assert 'total_users' in stats
        assert stats['total_users'] >= 0
    
    def test_get_booking_statistics(self, booking):
        """Test getting booking statistics."""
        stats = AdminReportService.get_booking_statistics()
        
        assert 'total_bookings' in stats
        assert 'bookings_by_status' in stats
        assert 'total_amount' in stats
        assert 'avg_amount' in stats
        assert 'completion_rate' in stats
        assert 'cancellation_rate' in stats
        
        assert stats['total_bookings'] >= 1
        assert isinstance(stats['bookings_by_status'], list)
    
    def test_get_booking_statistics_with_date_range(self, booking):
        """Test booking statistics with date range filtering."""
        start_date = timezone.now() - timedelta(days=7)
        end_date = timezone.now() + timedelta(days=7)
        
        stats = AdminReportService.get_booking_statistics(
            start_date=start_date,
            end_date=end_date
        )
        
        assert stats['total_bookings'] >= 1
    
    def test_get_booking_statistics_completion_rate(
        self, customer_user, provider, provider_service
    ):
        """Test booking completion rate calculation."""
        scheduled_start = timezone.now() + timedelta(days=1)
        
        # Create completed booking
        Booking.objects.create(
            booking_ref='BK-COMP-1',
            customer=customer_user,
            provider=provider,
            provider_service=provider_service,
            status='COMPLETED',
            scheduled_start=scheduled_start,
            scheduled_end=scheduled_start + timedelta(hours=2),
            address='Test Address',
            total_amount=Decimal('100.00'),
            payment_status='PAID'
        )
        
        # Create cancelled booking
        Booking.objects.create(
            booking_ref='BK-CANC-1',
            customer=customer_user,
            provider=provider,
            provider_service=provider_service,
            status='CANCELLED',
            scheduled_start=scheduled_start,
            scheduled_end=scheduled_start + timedelta(hours=2),
            address='Test Address',
            total_amount=Decimal('100.00'),
            payment_status='PENDING'
        )
        
        stats = AdminReportService.get_booking_statistics()
        
        assert stats['completion_rate'] >= 0
        assert stats['cancellation_rate'] >= 0
    
    def test_get_transaction_statistics(self, sample_booking, customer_user, provider_user):
        """Test getting transaction statistics."""
        # Create transactions
        Transaction.objects.create(
            booking=sample_booking,
            customer=customer_user,
            provider=provider_user,
            amount=Decimal('100.00'),
            commission_amount=Decimal('10.00'),
            status='SUCCESS',
            txn_provider='MOMO'
        )
        
        stats = AdminReportService.get_transaction_statistics()
        
        assert 'total_transactions' in stats
        assert 'transactions_by_status' in stats
        assert 'transactions_by_provider' in stats
        assert 'success_rate' in stats
        assert 'total_revenue' in stats
        
        assert stats['total_transactions'] >= 1
        assert stats['successful_transactions'] >= 1
    
    def test_get_transaction_statistics_with_date_range(
        self, sample_booking, customer_user, provider_user
    ):
        """Test transaction statistics with date range filtering."""
        Transaction.objects.create(
            booking=sample_booking,
            customer=customer_user,
            provider=provider_user,
            amount=Decimal('100.00'),
            commission_amount=Decimal('10.00'),
            status='SUCCESS',
            txn_provider='MOMO'
        )
        
        start_date = timezone.now() - timedelta(days=1)
        end_date = timezone.now() + timedelta(days=1)
        
        stats = AdminReportService.get_transaction_statistics(
            start_date=start_date,
            end_date=end_date
        )
        
        assert stats['total_transactions'] >= 1
    
    def test_get_transaction_statistics_success_rate(
        self, sample_booking, customer_user, provider_user
    ):
        """Test transaction success rate calculation."""
        # Create successful transaction
        Transaction.objects.create(
            booking=sample_booking,
            customer=customer_user,
            provider=provider_user,
            amount=Decimal('100.00'),
            commission_amount=Decimal('10.00'),
            status='SUCCESS',
            txn_provider='MOMO'
        )
        
        # Create failed transaction
        Transaction.objects.create(
            booking=sample_booking,
            customer=customer_user,
            provider=provider_user,
            amount=Decimal('50.00'),
            commission_amount=Decimal('5.00'),
            status='FAILED',
            txn_provider='MOMO'
        )
        
        stats = AdminReportService.get_transaction_statistics()
        
        assert stats['success_rate'] >= 0
        assert stats['failure_rate'] >= 0
        assert stats['successful_transactions'] >= 1
        assert stats['failed_transactions'] >= 1
