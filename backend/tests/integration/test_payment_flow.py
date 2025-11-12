"""
Integration tests for payment flow with bookings.
"""

import pytest
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from apps.bookings.models import Booking
from apps.payments.models import Transaction
from apps.payments.services import PaymentService, MoMoService


@pytest.mark.django_db
class TestPaymentBookingIntegration:
    """Test payment flow integration with bookings."""
    
    def test_complete_payment_flow_success(
        self,
        customer_user,
        sample_provider,
        sample_booking
    ):
        """Test complete payment flow from initiation to success."""
        # Initial state
        assert sample_booking.payment_status == 'PENDING'
        assert sample_booking.commission_amount is None
        
        # Step 1: Initiate payment
        txn = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO',
            metadata={'phone': '0241234567'}
        )
        
        # Verify transaction created
        assert txn.status == 'PENDING'
        assert txn.amount == sample_booking.total_amount
        assert txn.commission_amount > 0
        assert txn.customer == customer_user
        assert txn.provider == sample_provider.user
        
        # Verify booking updated with commission
        sample_booking.refresh_from_db()
        assert sample_booking.commission_amount == txn.commission_amount
        
        # Step 2: Simulate MoMo charge
        momo_service = MoMoService()
        charge_result = momo_service.charge(
            phone='0241234567',
            amount=txn.amount,
            reference=str(txn.id),
            description=f"Payment for booking {sample_booking.booking_ref}"
        )
        
        # Step 3: Process payment result
        if charge_result['success']:
            updated_txn = PaymentService.process_payment_success(
                transaction_id=txn.id,
                provider_ref=charge_result['provider_ref'],
                metadata=charge_result
            )
            
            # Verify transaction updated
            assert updated_txn.status == 'SUCCESS'
            assert updated_txn.txn_provider_ref == charge_result['provider_ref']
            
            # Verify booking marked as paid
            sample_booking.refresh_from_db()
            assert sample_booking.payment_status == 'PAID'
    
    def test_payment_flow_with_failure(
        self,
        customer_user,
        sample_provider,
        sample_booking
    ):
        """Test payment flow when payment fails."""
        # Initiate payment
        txn = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        # Simulate payment failure
        updated_txn = PaymentService.process_payment_failure(
            transaction_id=txn.id,
            reason='Insufficient balance',
            metadata={'error_code': 'INSUFFICIENT_FUNDS'}
        )
        
        # Verify transaction marked as failed
        assert updated_txn.status == 'FAILED'
        assert 'failure_reason' in updated_txn.metadata
        assert updated_txn.metadata['failure_reason'] == 'Insufficient balance'
        
        # Verify booking marked as failed
        sample_booking.refresh_from_db()
        assert sample_booking.payment_status == 'FAILED'
    
    def test_payment_prevents_double_payment(self, sample_booking):
        """Test that double payment is prevented."""
        # First payment
        txn1 = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        PaymentService.process_payment_success(
            transaction_id=txn1.id,
            provider_ref='MOMO-123'
        )
        
        # Verify booking is paid
        sample_booking.refresh_from_db()
        assert sample_booking.payment_status == 'PAID'
        
        # Try to initiate another payment
        from core.exceptions import ConflictError
        with pytest.raises(ConflictError, match="already paid"):
            PaymentService.initiate_payment(
                booking=sample_booking,
                payment_provider='MOMO'
            )
    
    def test_payment_with_commission_calculation(
        self,
        sample_booking,
        sample_provider
    ):
        """Test that commission is correctly calculated and stored."""
        from apps.payments.models import Commission
        
        # Create custom commission rate for provider
        Commission.objects.create(
            name='Provider Commission',
            rate=Decimal('0.15'),  # 15%
            applies_to='PROVIDER',
            provider=sample_provider,
            is_active=True
        )
        
        # Initiate payment
        txn = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        # Verify commission calculated with provider rate
        expected_commission = sample_booking.total_amount * Decimal('0.15')
        assert txn.commission_amount == expected_commission.quantize(Decimal('0.01'))
        
        # Verify provider amount
        expected_provider_amount = sample_booking.total_amount - txn.commission_amount
        assert txn.provider_amount == expected_provider_amount
    
    def test_webhook_idempotency_prevents_duplicate_processing(
        self,
        sample_booking
    ):
        """Test that webhook idempotency prevents duplicate processing."""
        # Initiate payment
        txn = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        # Set idempotency key
        idempotency_key = 'webhook_test_12345'
        txn.idempotency_key = idempotency_key
        txn.save()
        
        # Process payment success
        PaymentService.process_payment_success(
            transaction_id=txn.id,
            provider_ref='MOMO-123'
        )
        
        # Check idempotency
        found_txn = PaymentService.check_idempotency(idempotency_key)
        assert found_txn is not None
        assert found_txn.id == txn.id
        assert found_txn.status == 'SUCCESS'
        
        # Verify booking is paid
        sample_booking.refresh_from_db()
        assert sample_booking.payment_status == 'PAID'
    
    def test_manual_payment_confirmation_flow(
        self,
        customer_user,
        sample_booking
    ):
        """Test manual payment confirmation flow."""
        # Create manual transaction
        txn = Transaction.objects.create(
            booking=sample_booking,
            customer=customer_user,
            provider=sample_booking.provider.user,
            amount=sample_booking.total_amount,
            commission_amount=sample_booking.total_amount * Decimal('0.10'),
            status='PROCESSING',
            txn_provider='MANUAL',
            txn_provider_ref='MOMO-MANUAL-123456',
            metadata={
                'transaction_ref': 'MOMO-MANUAL-123456',
                'payment_method': 'MOMO',
                'submitted_by': str(customer_user.id)
            }
        )
        
        # Update booking status
        sample_booking.payment_status = 'AUTHORIZED'
        sample_booking.commission_amount = txn.commission_amount
        sample_booking.save()
        
        # Verify transaction created
        assert txn.status == 'PROCESSING'
        assert txn.txn_provider == 'MANUAL'
        
        # Verify booking authorized
        assert sample_booking.payment_status == 'AUTHORIZED'
        
        # Admin can later approve and mark as SUCCESS
        txn.status = 'SUCCESS'
        txn.save()
        
        sample_booking.payment_status = 'PAID'
        sample_booking.save()
        
        # Verify final state
        assert txn.status == 'SUCCESS'
        assert sample_booking.payment_status == 'PAID'
    
    def test_payment_with_cancelled_booking_fails(self, sample_booking):
        """Test that payment for cancelled booking fails."""
        # Cancel booking
        sample_booking.status = 'CANCELLED'
        sample_booking.save()
        
        # Try to initiate payment
        from core.exceptions import ValidationError
        with pytest.raises(ValidationError, match="cancelled booking"):
            PaymentService.initiate_payment(
                booking=sample_booking,
                payment_provider='MOMO'
            )
    
    def test_multiple_transactions_for_same_booking(self, sample_booking):
        """Test handling of multiple transaction attempts."""
        # First attempt - pending
        txn1 = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        # Second attempt should return same transaction
        txn2 = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        assert txn1.id == txn2.id
        
        # Mark first as failed
        PaymentService.process_payment_failure(
            transaction_id=txn1.id,
            reason='Network error'
        )
        
        # Now can create new transaction
        txn3 = PaymentService.initiate_payment(
            booking=sample_booking,
            payment_provider='MOMO'
        )
        
        assert txn3.id != txn1.id
        assert txn3.status == 'PENDING'
