"""
Unit tests for PaymentService.
"""

import pytest
import uuid
from decimal import Decimal
from apps.payments.services import PaymentService
from apps.payments.models import Transaction
from core.exceptions import ValidationError, NotFoundError, ConflictError


@pytest.mark.django_db
class TestPaymentService:
    """Test PaymentService methods."""
    
    def test_initiate_payment_success(self, sample_booking):
        """Test successful payment initiation."""
        txn = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        assert txn is not None
        assert txn.booking == sample_booking
        assert txn.customer == sample_booking.customer
        assert txn.provider == sample_booking.provider.user
        assert txn.amount == sample_booking.total_amount
        assert txn.commission_amount > 0
        assert txn.status == 'PENDING'
        assert txn.txn_provider == 'MOMO'
    
    def test_initiate_payment_calculates_commission(self, sample_booking):
        """Test that payment initiation calculates commission."""
        txn = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        # Default commission rate is 10%
        expected_commission = sample_booking.total_amount * Decimal('0.10')
        assert txn.commission_amount == expected_commission.quantize(Decimal('0.01'))
        
        # Booking should also have commission updated
        sample_booking.refresh_from_db()
        assert sample_booking.commission_amount == txn.commission_amount
    
    def test_initiate_payment_already_paid(self, sample_booking):
        """Test that initiating payment for paid booking raises error."""
        sample_booking.payment_status = 'PAID'
        sample_booking.save()
        
        with pytest.raises(ConflictError, match="already paid"):
            PaymentService.initiate_payment(
                booking=sample_booking,
                payment_provider='MOMO'
            )
    
    def test_initiate_payment_cancelled_booking(self, sample_booking):
        """Test that initiating payment for cancelled booking raises error."""
        sample_booking.status = 'CANCELLED'
        sample_booking.save()
        
        with pytest.raises(ValidationError, match="cancelled booking"):
            PaymentService.initiate_payment(
                booking=sample_booking,
                payment_provider='MOMO'
            )
    
    def test_initiate_payment_returns_existing_pending(self, sample_booking):
        """Test that existing pending transaction is returned."""
        # Create first transaction
        txn1 = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        # Try to create another
        txn2 = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        # Should return the same transaction
        assert txn1.id == txn2.id
    
    def test_initiate_payment_with_metadata(self, sample_booking):
        """Test payment initiation with metadata."""
        metadata = {'phone': '0241234567', 'note': 'Test payment'}
        
        txn = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO',
            metadata=metadata
        )
        
        assert txn.metadata == metadata
    
    def test_process_payment_success(self, sample_booking):
        """Test processing successful payment."""
        # Create transaction
        txn = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        # Process success
        provider_ref = 'MOMO-123456'
        updated_txn = PaymentService.process_payment_success(
            transaction_id=txn.id,
            provider_ref=provider_ref
        )
        
        assert updated_txn.status == 'SUCCESS'
        assert updated_txn.txn_provider_ref == provider_ref
        
        # Booking should be marked as paid
        sample_booking.refresh_from_db()
        assert sample_booking.payment_status == 'PAID'
    
    def test_process_payment_success_with_metadata(self, sample_booking):
        """Test processing successful payment with metadata."""
        txn = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        metadata = {'momo_txn_id': '12345', 'timestamp': '2025-01-15T10:00:00Z'}
        updated_txn = PaymentService.process_payment_success(
            transaction_id=txn.id,
            provider_ref='MOMO-123456',
            metadata=metadata
        )
        
        assert 'momo_txn_id' in updated_txn.metadata
        assert updated_txn.metadata['momo_txn_id'] == '12345'
    
    def test_process_payment_success_not_found(self):
        """Test processing success for non-existent transaction."""
        fake_id = uuid.uuid4()
        
        with pytest.raises(NotFoundError, match="not found"):
            PaymentService.process_payment_success(
                transaction_id=fake_id,
                provider_ref='MOMO-123456'
            )
    
    def test_process_payment_failure(self, sample_booking):
        """Test processing failed payment."""
        txn = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        reason = 'Insufficient balance'
        updated_txn = PaymentService.process_payment_failure(
            transaction_id=txn.id,
            reason=reason
        )
        
        assert updated_txn.status == 'FAILED'
        assert updated_txn.metadata['failure_reason'] == reason
        
        # Booking should be marked as failed
        sample_booking.refresh_from_db()
        assert sample_booking.payment_status == 'FAILED'
    
    def test_process_payment_failure_with_metadata(self, sample_booking):
        """Test processing failed payment with metadata."""
        txn = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        metadata = {'error_code': 'INSUFFICIENT_FUNDS', 'timestamp': '2025-01-15T10:00:00Z'}
        updated_txn = PaymentService.process_payment_failure(
            transaction_id=txn.id,
            reason='Payment declined',
            metadata=metadata
        )
        
        assert 'error_code' in updated_txn.metadata
        assert updated_txn.metadata['error_code'] == 'INSUFFICIENT_FUNDS'
    
    def test_process_payment_failure_not_found(self):
        """Test processing failure for non-existent transaction."""
        fake_id = uuid.uuid4()
        
        with pytest.raises(NotFoundError, match="not found"):
            PaymentService.process_payment_failure(
                transaction_id=fake_id,
                reason='Test failure'
            )
    
    def test_check_idempotency_exists(self, sample_booking):
        """Test idempotency check when transaction exists."""
        txn = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        # Set idempotency key
        idempotency_key = 'webhook_test_12345'
        txn.idempotency_key = idempotency_key
        txn.save()
        
        # Check idempotency
        found_txn = PaymentService.check_idempotency(idempotency_key)
        
        assert found_txn is not None
        assert found_txn.id == txn.id
    
    def test_check_idempotency_not_exists(self):
        """Test idempotency check when transaction doesn't exist."""
        found_txn = PaymentService.check_idempotency('nonexistent_key')
        
        assert found_txn is None
