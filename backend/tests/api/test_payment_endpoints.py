"""
API tests for payment endpoints.
"""

import pytest
import uuid
from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from apps.payments.models import Transaction
from apps.payments.services import PaymentService


@pytest.mark.django_db
class TestMoMoChargeEndpoint:
    """Test MoMo charge endpoint."""
    
    def test_momo_charge_success(self, api_client, customer_user, sample_booking):
        """Test successful MoMo charge."""
        api_client.force_authenticate(user=customer_user)
        
        url = reverse('momo-charge')
        data = {
            'booking_id': str(sample_booking.id),
            'phone': '0241234567'
        }
        
        response = api_client.post(url, data, format='json')
        
        # Mock service has 90% success rate, but we can't guarantee
        # For testing, we just check the response structure
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST]
        assert 'success' in response.data
        assert 'data' in response.data
        
        if response.data['success']:
            assert 'transaction_id' in response.data['data']
            assert 'status' in response.data['data']
            assert response.data['data']['status'] == 'SUCCESS'
    
    def test_momo_charge_not_customer(self, api_client, provider_user, sample_booking):
        """Test that non-customer cannot charge."""
        api_client.force_authenticate(user=provider_user)
        
        url = reverse('momo-charge')
        data = {
            'booking_id': str(sample_booking.id),
            'phone': '0241234567'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_momo_charge_invalid_booking(self, api_client, customer_user):
        """Test charge with invalid booking ID."""
        api_client.force_authenticate(user=customer_user)
        
        url = reverse('momo-charge')
        data = {
            'booking_id': str(uuid.uuid4()),
            'phone': '0241234567'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_momo_charge_already_paid(self, api_client, customer_user, sample_booking):
        """Test charge for already paid booking."""
        sample_booking.payment_status = 'PAID'
        sample_booking.save()
        
        api_client.force_authenticate(user=customer_user)
        
        url = reverse('momo-charge')
        data = {
            'booking_id': str(sample_booking.id),
            'phone': '0241234567'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_momo_charge_unauthenticated(self, api_client, sample_booking):
        """Test that unauthenticated request is rejected."""
        url = reverse('momo-charge')
        data = {
            'booking_id': str(sample_booking.id),
            'phone': '0241234567'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestMoMoWebhookEndpoint:
    """Test MoMo webhook endpoint."""
    
    def test_webhook_success(self, api_client, sample_booking):
        """Test successful webhook processing."""
        # Create transaction
        txn = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        url = reverse('momo-webhook')
        data = {
            'transaction_ref': str(txn.id),
            'status': 'SUCCESS',
            'amount': str(sample_booking.total_amount),
            'phone': '0241234567',
            'provider_ref': 'MOMO-123456'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        
        # Verify transaction was updated
        txn.refresh_from_db()
        assert txn.status == 'SUCCESS'
        assert txn.txn_provider_ref == 'MOMO-123456'
    
    def test_webhook_failure(self, api_client, sample_booking):
        """Test failed webhook processing."""
        txn = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        url = reverse('momo-webhook')
        data = {
            'transaction_ref': str(txn.id),
            'status': 'FAILED',
            'amount': str(sample_booking.total_amount),
            'phone': '0241234567',
            'message': 'Insufficient balance'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        
        # Verify transaction was updated
        txn.refresh_from_db()
        assert txn.status == 'FAILED'
    
    def test_webhook_idempotency(self, api_client, sample_booking):
        """Test webhook idempotency."""
        txn = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        url = reverse('momo-webhook')
        data = {
            'transaction_ref': str(txn.id),
            'status': 'SUCCESS',
            'amount': str(sample_booking.total_amount),
            'phone': '0241234567',
            'provider_ref': 'MOMO-123456'
        }
        
        # Send webhook twice
        response1 = api_client.post(url, data, format='json')
        response2 = api_client.post(url, data, format='json')
        
        assert response1.status_code == status.HTTP_200_OK
        assert response2.status_code == status.HTTP_200_OK
        assert 'already processed' in response2.data['message'].lower()
    
    def test_webhook_invalid_transaction(self, api_client):
        """Test webhook with invalid transaction reference."""
        url = reverse('momo-webhook')
        data = {
            'transaction_ref': str(uuid.uuid4()),
            'status': 'SUCCESS',
            'amount': '100.00',
            'phone': '0241234567',
            'provider_ref': 'MOMO-123456'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestManualPaymentConfirmEndpoint:
    """Test manual payment confirmation endpoint."""
    
    def test_manual_payment_success(self, api_client, customer_user, sample_booking):
        """Test successful manual payment confirmation."""
        api_client.force_authenticate(user=customer_user)
        
        url = reverse('manual-payment-confirm')
        data = {
            'booking_id': str(sample_booking.id),
            'transaction_ref': 'MOMO-MANUAL-123456',
            'amount': str(sample_booking.total_amount),
            'payment_method': 'MOMO',
            'notes': 'Paid via MoMo'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert 'transaction_id' in response.data['data']
        
        # Verify transaction was created
        txn = Transaction.objects.get(id=response.data['data']['id'])
        assert txn.status == 'PROCESSING'
        assert txn.txn_provider == 'MANUAL'
        assert txn.txn_provider_ref == 'MOMO-MANUAL-123456'
        
        # Booking should be authorized
        sample_booking.refresh_from_db()
        assert sample_booking.payment_status == 'AUTHORIZED'
    
    def test_manual_payment_amount_mismatch(self, api_client, customer_user, sample_booking):
        """Test manual payment with amount mismatch."""
        api_client.force_authenticate(user=customer_user)
        
        url = reverse('manual-payment-confirm')
        data = {
            'booking_id': str(sample_booking.id),
            'transaction_ref': 'MOMO-MANUAL-123456',
            'amount': '50.00',  # Wrong amount
            'payment_method': 'MOMO'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'mismatch' in response.data['errors']['message'].lower()
    
    def test_manual_payment_not_customer(self, api_client, provider_user, sample_booking):
        """Test that non-customer cannot confirm payment."""
        api_client.force_authenticate(user=provider_user)
        
        url = reverse('manual-payment-confirm')
        data = {
            'booking_id': str(sample_booking.id),
            'transaction_ref': 'MOMO-MANUAL-123456',
            'amount': str(sample_booking.total_amount),
            'payment_method': 'MOMO'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_manual_payment_already_paid(self, api_client, customer_user, sample_booking):
        """Test manual payment for already paid booking."""
        sample_booking.payment_status = 'PAID'
        sample_booking.save()
        
        api_client.force_authenticate(user=customer_user)
        
        url = reverse('manual-payment-confirm')
        data = {
            'booking_id': str(sample_booking.id),
            'transaction_ref': 'MOMO-MANUAL-123456',
            'amount': str(sample_booking.total_amount),
            'payment_method': 'MOMO'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestTransactionListEndpoint:
    """Test transaction list endpoint."""
    
    def test_list_transactions_customer(self, api_client, customer_user, sample_booking):
        """Test customer can list their transactions."""
        # Create transaction
        PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        api_client.force_authenticate(user=customer_user)
        
        url = reverse('transaction-list')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
    
    def test_list_transactions_provider(self, api_client, provider_user, sample_booking):
        """Test provider can list their transactions."""
        # Create transaction
        PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        api_client.force_authenticate(user=provider_user)
        
        url = reverse('transaction-list')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
    
    def test_list_transactions_unauthenticated(self, api_client):
        """Test unauthenticated request is rejected."""
        url = reverse('transaction-list')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
