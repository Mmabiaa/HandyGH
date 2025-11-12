"""
Payment services for HandyGH.

Design Decisions:
- CommissionService handles commission calculation logic
- PaymentService manages payment lifecycle
- MoMoService provides payment provider integration
- Separation of concerns for maintainability

SOLID Principles:
- Single Responsibility: Each service handles specific payment domain
- Dependency Inversion: Services depend on abstractions
"""

import logging
import hashlib
import uuid
from decimal import Decimal
from typing import Optional, Dict, Any
from django.db import transaction
from django.conf import settings
from django.utils import timezone
from .models import Transaction, Commission
from apps.bookings.models import Booking
from core.exceptions import ValidationError, NotFoundError, ConflictError

logger = logging.getLogger(__name__)


class CommissionService:
    """
    Service for calculating platform commissions.
    
    Handles commission calculation based on configurable rates,
    supporting different rates for categories and providers.
    """
    
    @staticmethod
    def get_commission_rate(
        booking: Booking,
        provider_id: Optional[uuid.UUID] = None,
        category: Optional[str] = None
    ) -> Decimal:
        """
        Get applicable commission rate for a booking.
        
        Priority order:
        1. Provider-specific commission
        2. Category-specific commission
        3. Default commission rate
        
        Args:
            booking: Booking instance
            provider_id: Optional provider ID
            category: Optional service category
            
        Returns:
            Decimal: Commission rate (0.0 to 1.0)
        """
        # Try provider-specific commission
        if provider_id:
            provider_commission = Commission.objects.filter(
                provider_id=provider_id,
                applies_to='PROVIDER',
                is_active=True
            ).first()
            if provider_commission:
                logger.info(f"Using provider-specific commission: {provider_commission.rate}")
                return provider_commission.rate
        
        # Try category-specific commission
        if category:
            category_commission = Commission.objects.filter(
                category=category,
                applies_to='CATEGORY',
                is_active=True
            ).first()
            if category_commission:
                logger.info(f"Using category-specific commission: {category_commission.rate}")
                return category_commission.rate
        
        # Try default commission
        default_commission = Commission.objects.filter(
            applies_to='ALL',
            is_active=True
        ).first()
        if default_commission:
            logger.info(f"Using default commission: {default_commission.rate}")
            return default_commission.rate
        
        # Fallback to settings
        default_rate = Decimal(str(settings.DEFAULT_COMMISSION_RATE))
        logger.info(f"Using fallback commission from settings: {default_rate}")
        return default_rate
    
    @staticmethod
    def calculate_commission(
        amount: Decimal,
        booking: Booking,
        provider_id: Optional[uuid.UUID] = None,
        category: Optional[str] = None
    ) -> Decimal:
        """
        Calculate commission amount for a booking.
        
        Args:
            amount: Booking amount
            booking: Booking instance
            provider_id: Optional provider ID
            category: Optional service category
            
        Returns:
            Decimal: Commission amount
            
        Raises:
            ValidationError: If amount is invalid
        """
        if amount <= 0:
            raise ValidationError("Amount must be greater than zero")
        
        # Get applicable commission rate
        rate = CommissionService.get_commission_rate(booking, provider_id, category)
        
        # Calculate commission
        commission = amount * rate
        
        # Round to 2 decimal places
        commission = commission.quantize(Decimal('0.01'))
        
        logger.info(
            f"Calculated commission for booking {booking.booking_ref}: "
            f"{amount} * {rate} = {commission}"
        )
        
        return commission
    
    @staticmethod
    def get_provider_amount(amount: Decimal, commission: Decimal) -> Decimal:
        """
        Calculate amount provider receives after commission.
        
        Args:
            amount: Total booking amount
            commission: Commission amount
            
        Returns:
            Decimal: Provider's net amount
        """
        provider_amount = amount - commission
        return provider_amount.quantize(Decimal('0.01'))


class PaymentService:
    """
    Service for managing payment transactions.
    
    Handles payment initiation, processing, and status updates.
    """
    
    @staticmethod
    @transaction.atomic
    def initiate_payment(
        booking: Booking,
        payment_provider: str = 'MOMO',
        metadata: Optional[Dict[str, Any]] = None
    ) -> Transaction:
        """
        Initiate a payment transaction for a booking.
        
        Args:
            booking: Booking to create payment for
            payment_provider: Payment provider (MOMO, MANUAL, etc.)
            metadata: Optional additional metadata
            
        Returns:
            Transaction: Created transaction instance
            
        Raises:
            ValidationError: If booking is invalid
            ConflictError: If payment already exists
        """
        # Validate booking
        if booking.payment_status == 'PAID':
            raise ConflictError(f"Booking {booking.booking_ref} is already paid")
        
        if booking.status == 'CANCELLED':
            raise ValidationError("Cannot initiate payment for cancelled booking")
        
        # Check for existing pending transaction
        existing_txn = Transaction.objects.filter(
            booking=booking,
            status__in=['PENDING', 'PROCESSING']
        ).first()
        
        if existing_txn:
            logger.info(f"Returning existing transaction {existing_txn.id}")
            return existing_txn
        
        # Calculate commission
        commission = CommissionService.calculate_commission(
            amount=booking.total_amount,
            booking=booking,
            provider_id=booking.provider.id
        )
        
        # Create transaction
        txn = Transaction.objects.create(
            booking=booking,
            customer=booking.customer,
            provider=booking.provider.user,
            amount=booking.total_amount,
            commission_amount=commission,
            currency='GHS',
            status='PENDING',
            txn_provider=payment_provider,
            metadata=metadata or {}
        )
        
        # Update booking commission
        booking.commission_amount = commission
        booking.save(update_fields=['commission_amount'])
        
        logger.info(
            f"Initiated payment transaction {txn.id} for booking {booking.booking_ref}"
        )
        
        return txn
    
    @staticmethod
    @transaction.atomic
    def process_payment_success(
        transaction_id: uuid.UUID,
        provider_ref: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Transaction:
        """
        Process successful payment.
        
        Args:
            transaction_id: Transaction ID
            provider_ref: External provider reference
            metadata: Optional additional metadata
            
        Returns:
            Transaction: Updated transaction
            
        Raises:
            NotFoundError: If transaction not found
        """
        try:
            txn = Transaction.objects.select_for_update().get(id=transaction_id)
        except Transaction.DoesNotExist:
            raise NotFoundError(f"Transaction {transaction_id} not found")
        
        # Update transaction
        txn.status = 'SUCCESS'
        txn.txn_provider_ref = provider_ref
        if metadata:
            # Convert Decimal values to strings for JSON serialization
            serializable_metadata = PaymentService._make_json_serializable(metadata)
            txn.metadata.update(serializable_metadata)
        txn.save()
        
        # Update booking payment status
        booking = txn.booking
        booking.payment_status = 'PAID'
        booking.save(update_fields=['payment_status'])
        
        logger.info(
            f"Payment successful for transaction {txn.id}, "
            f"booking {booking.booking_ref}"
        )
        
        return txn
    
    @staticmethod
    @transaction.atomic
    def process_payment_failure(
        transaction_id: uuid.UUID,
        reason: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Transaction:
        """
        Process failed payment.
        
        Args:
            transaction_id: Transaction ID
            reason: Failure reason
            metadata: Optional additional metadata
            
        Returns:
            Transaction: Updated transaction
            
        Raises:
            NotFoundError: If transaction not found
        """
        try:
            txn = Transaction.objects.select_for_update().get(id=transaction_id)
        except Transaction.DoesNotExist:
            raise NotFoundError(f"Transaction {transaction_id} not found")
        
        # Update transaction
        txn.status = 'FAILED'
        txn.metadata['failure_reason'] = reason
        if metadata:
            # Convert Decimal values to strings for JSON serialization
            serializable_metadata = PaymentService._make_json_serializable(metadata)
            txn.metadata.update(serializable_metadata)
        txn.save()
        
        # Update booking payment status
        booking = txn.booking
        booking.payment_status = 'FAILED'
        booking.save(update_fields=['payment_status'])
        
        logger.warning(
            f"Payment failed for transaction {txn.id}, "
            f"booking {booking.booking_ref}: {reason}"
        )
        
        return txn
    
    @staticmethod
    def check_idempotency(idempotency_key: str) -> Optional[Transaction]:
        """
        Check if transaction with idempotency key already exists.
        
        Args:
            idempotency_key: Idempotency key to check
            
        Returns:
            Transaction if exists, None otherwise
        """
        return Transaction.objects.filter(
            idempotency_key=idempotency_key
        ).first()
    
    @staticmethod
    def _make_json_serializable(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert non-JSON-serializable values (like Decimal) to strings.
        
        Args:
            data: Dictionary that may contain non-serializable values
            
        Returns:
            Dictionary with all values JSON-serializable
        """
        result = {}
        for key, value in data.items():
            if isinstance(value, Decimal):
                result[key] = str(value)
            elif isinstance(value, dict):
                result[key] = PaymentService._make_json_serializable(value)
            elif isinstance(value, list):
                result[key] = [
                    PaymentService._make_json_serializable(item) if isinstance(item, dict)
                    else str(item) if isinstance(item, Decimal)
                    else item
                    for item in value
                ]
            else:
                result[key] = value
        return result


class MoMoService:
    """
    Service for MTN Mobile Money integration.
    
    This is a mock implementation for development.
    In production, this should integrate with actual MTN MoMo API.
    """
    
    def __init__(self):
        """Initialize MoMo service."""
        self.api_key = settings.SMS_API_KEY  # Placeholder
        self.is_mock = settings.SMS_PROVIDER == 'mock'
    
    def charge(
        self,
        phone: str,
        amount: Decimal,
        reference: str,
        description: str = "HandyGH Service Payment"
    ) -> Dict[str, Any]:
        """
        Initiate MoMo charge.
        
        Args:
            phone: Customer phone number
            amount: Amount to charge
            reference: Transaction reference
            description: Payment description
            
        Returns:
            Dict with charge response
        """
        if self.is_mock:
            return self._mock_charge(phone, amount, reference, description)
        else:
            return self._real_charge(phone, amount, reference, description)
    
    def _mock_charge(
        self,
        phone: str,
        amount: Decimal,
        reference: str,
        description: str
    ) -> Dict[str, Any]:
        """
        Mock MoMo charge for development.
        
        Simulates successful payment 90% of the time.
        """
        import random
        
        # Simulate processing delay
        success = random.random() < 0.9  # 90% success rate
        
        if success:
            provider_ref = f"MOMO-{uuid.uuid4().hex[:12].upper()}"
            logger.info(
                f"Mock MoMo charge successful: {phone}, {amount}, ref: {provider_ref}"
            )
            return {
                'success': True,
                'provider_ref': provider_ref,
                'status': 'SUCCESS',
                'message': 'Payment successful',
                'amount': str(amount),
                'phone': phone,
            }
        else:
            logger.warning(f"Mock MoMo charge failed: {phone}, {amount}")
            return {
                'success': False,
                'provider_ref': None,
                'status': 'FAILED',
                'message': 'Insufficient balance or payment declined',
                'amount': str(amount),
                'phone': phone,
            }
    
    def _real_charge(
        self,
        phone: str,
        amount: Decimal,
        reference: str,
        description: str
    ) -> Dict[str, Any]:
        """
        Real MTN MoMo charge implementation.
        
        TODO: Implement actual MTN MoMo API integration
        - Request to pay API
        - Webhook handling
        - Status checking
        """
        raise NotImplementedError(
            "Real MTN MoMo integration not yet implemented. "
            "Set SMS_PROVIDER=mock in settings for development."
        )
    
    def verify_webhook_signature(
        self,
        payload: str,
        signature: str
    ) -> bool:
        """
        Verify webhook signature from MoMo.
        
        Args:
            payload: Webhook payload
            signature: Signature to verify
            
        Returns:
            bool: True if signature is valid
        """
        if self.is_mock:
            # In mock mode, accept all signatures
            return True
        
        # TODO: Implement real signature verification
        # expected_signature = hmac.new(
        #     self.api_key.encode(),
        #     payload.encode(),
        #     hashlib.sha256
        # ).hexdigest()
        # return hmac.compare_digest(expected_signature, signature)
        
        raise NotImplementedError("Real signature verification not yet implemented")
