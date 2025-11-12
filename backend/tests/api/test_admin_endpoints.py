"""
API tests for admin dashboard endpoints.
"""

import pytest
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from apps.users.models import User
from apps.bookings.models import Booking
from apps.payments.models import Transaction


@pytest.mark.django_db
class TestAdminDashboardEndpoints:
    """Test admin dashboard API endpoints."""
    
    def test_dashboard_stats_requires_authentication(self, api_client):
        """Test that dashboard stats requires authentication."""
        response = api_client.get('/api/v1/admin/dashboard/stats/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_dashboard_stats_requires_admin(self, api_client, customer_user):
        """Test that dashboard stats requires admin role."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(customer_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        response = api_client.get('/api/v1/admin/dashboard/stats/')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_dashboard_stats_success(self, api_client, admin_user):
        """Test getting dashboard stats as admin."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        response = api_client.get('/api/v1/admin/dashboard/stats/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert 'data' in response.data
        
        data = response.data['data']
        assert 'total_users' in data
        assert 'total_customers' in data
        assert 'total_providers' in data
        assert 'total_bookings' in data
        assert 'total_revenue' in data
    
    def test_user_statistics_success(self, api_client, admin_user):
        """Test getting user statistics as admin."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        response = api_client.get('/api/v1/admin/reports/users/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        
        data = response.data['data']
        assert 'total_users' in data
        assert 'users_by_role' in data
        assert 'active_users' in data
    
    def test_user_statistics_with_date_range(self, api_client, admin_user):
        """Test user statistics with date range parameters."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        start_date = (timezone.now() - timedelta(days=7)).isoformat()
        end_date = timezone.now().isoformat()
        
        response = api_client.get(
            f'/api/v1/admin/reports/users/?start_date={start_date}&end_date={end_date}'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
    
    def test_booking_statistics_success(self, api_client, admin_user, booking):
        """Test getting booking statistics as admin."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        response = api_client.get('/api/v1/admin/reports/bookings/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        
        data = response.data['data']
        assert 'total_bookings' in data
        assert 'bookings_by_status' in data
        assert 'completion_rate' in data
    
    def test_transaction_statistics_success(
        self, api_client, admin_user, sample_booking, customer_user, provider_user
    ):
        """Test getting transaction statistics as admin."""
        from apps.authentication.services import JWTService
        
        # Create a transaction
        Transaction.objects.create(
            booking=sample_booking,
            customer=customer_user,
            provider=provider_user,
            amount=Decimal('100.00'),
            commission_amount=Decimal('10.00'),
            status='SUCCESS',
            txn_provider='MOMO'
        )
        
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        response = api_client.get('/api/v1/admin/reports/transactions/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        
        data = response.data['data']
        assert 'total_transactions' in data
        assert 'transactions_by_status' in data
        assert 'success_rate' in data
    
    def test_list_users_success(self, api_client, admin_user, customer_user, provider_user):
        """Test listing all users as admin."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        response = api_client.get('/api/v1/admin/users/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert 'data' in response.data
        assert isinstance(response.data['data'], list)
        assert len(response.data['data']) >= 3  # At least 3 users
    
    def test_list_users_with_role_filter(self, api_client, admin_user, customer_user):
        """Test listing users with role filter."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        response = api_client.get('/api/v1/admin/users/?role=CUSTOMER')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        
        # Check that all returned users are customers
        for user in response.data['data']:
            assert user['role'] == 'CUSTOMER'
    
    def test_list_users_with_search(self, api_client, admin_user, customer_user):
        """Test listing users with search parameter."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        response = api_client.get(f'/api/v1/admin/users/?search={customer_user.phone}')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert len(response.data['data']) >= 1
    
    def test_suspend_user_success(self, api_client, admin_user, customer_user):
        """Test suspending a user as admin."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        response = api_client.patch(
            f'/api/v1/admin/users/{customer_user.id}/suspend/',
            {'reason': 'Test suspension'},
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        
        # Verify user is suspended
        customer_user.refresh_from_db()
        assert customer_user.is_active is False
    
    def test_suspend_user_requires_admin(self, api_client, customer_user, provider_user):
        """Test that suspending user requires admin role."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(customer_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        response = api_client.patch(
            f'/api/v1/admin/users/{provider_user.id}/suspend/',
            {'reason': 'Test suspension'},
            format='json'
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_suspend_nonexistent_user(self, api_client, admin_user):
        """Test suspending a non-existent user."""
        from apps.authentication.services import JWTService
        import uuid
        
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        fake_id = uuid.uuid4()
        response = api_client.patch(
            f'/api/v1/admin/users/{fake_id}/suspend/',
            {'reason': 'Test suspension'},
            format='json'
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_activate_user_success(self, api_client, admin_user, customer_user):
        """Test activating a suspended user as admin."""
        from apps.authentication.services import JWTService
        
        # Suspend user first
        customer_user.deactivate()
        
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        response = api_client.patch(
            f'/api/v1/admin/users/{customer_user.id}/activate/',
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        
        # Verify user is activated
        customer_user.refresh_from_db()
        assert customer_user.is_active is True
    
    def test_activate_user_requires_admin(self, api_client, customer_user, provider_user):
        """Test that activating user requires admin role."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(customer_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        response = api_client.patch(
            f'/api/v1/admin/users/{provider_user.id}/activate/',
            format='json'
        )
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_export_csv_users(self, api_client, admin_user, customer_user):
        """Test exporting users to CSV."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        response = api_client.get('/api/v1/admin/export/csv/?export_type=users')
        
        assert response.status_code == status.HTTP_200_OK
        assert response['Content-Type'] == 'text/csv'
        assert 'attachment' in response['Content-Disposition']
        assert 'users_export.csv' in response['Content-Disposition']
    
    def test_export_csv_bookings(self, api_client, admin_user, booking):
        """Test exporting bookings to CSV."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        response = api_client.get('/api/v1/admin/export/csv/?export_type=bookings')
        
        assert response.status_code == status.HTTP_200_OK
        assert response['Content-Type'] == 'text/csv'
        assert 'bookings_export.csv' in response['Content-Disposition']
    
    def test_export_csv_transactions(
        self, api_client, admin_user, sample_booking, customer_user, provider_user
    ):
        """Test exporting transactions to CSV."""
        from apps.authentication.services import JWTService
        
        # Create a transaction
        Transaction.objects.create(
            booking=sample_booking,
            customer=customer_user,
            provider=provider_user,
            amount=Decimal('100.00'),
            commission_amount=Decimal('10.00'),
            status='SUCCESS',
            txn_provider='MOMO'
        )
        
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        response = api_client.get('/api/v1/admin/export/csv/?export_type=transactions')
        
        assert response.status_code == status.HTTP_200_OK
        assert response['Content-Type'] == 'text/csv'
        assert 'transactions_export.csv' in response['Content-Disposition']
    
    def test_export_csv_requires_admin(self, api_client, customer_user):
        """Test that CSV export requires admin role."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(customer_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        response = api_client.get('/api/v1/admin/export/csv/?export_type=users')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_export_csv_invalid_type(self, api_client, admin_user):
        """Test exporting with invalid export type."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        response = api_client.get('/api/v1/admin/export/csv/?export_type=invalid')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
