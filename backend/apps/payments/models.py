"""
Payment models for HandyGH.

Design Decisions:
- Transaction model tracks all payment transactions
- Commission model stores configurable commission rates
- Support for multiple payment providers (MoMo, manual, etc.)
- Idempotency key for webhook deduplication
- Comprehensive status tracking for payment lifecycle

SOLID Principles:
- Single Responsibility: Each model handles specific payment domain
- Open/Closed: Easy to extend with new payment providers
"""

import uuid
from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from apps.bookings.models import Booking
from apps.users.models import User


class Transaction(models.Model):
    """
    Transaction model for payment records.
    
    Tracks all payment transactions including successful, failed, and refunded payments.
    
    Attributes:
        id: UUID primary key
        booking: Associated booking
        customer: User making the payment
        provider: User receiving the payment
        amount: Transaction amount
        commission_amount: Platform commission
        currency: Currency code (default GHS)
        status: Transaction status
        txn_provider: Payment provider (MOMO, MANUAL, etc.)
        txn_provider_ref: External transaction reference
        idempotency_key: Key for webhook deduplication
        metadata: Additional transaction data
        created_at: Transaction creation timestamp
        updated_at: Last update timestamp
    """
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    PROVIDER_CHOICES = [
        ('MOMO', 'MTN Mobile Money'),
        ('MANUAL', 'Manual Payment'),
        ('CARD', 'Card Payment'),
        ('BANK', 'Bank Transfer'),
    ]
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text='Unique identifier for the transaction'
    )
    
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='transactions',
        help_text='Associated booking'
    )
    
    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='customer_transactions',
        help_text='User making the payment'
    )
    
    provider = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='provider_transactions',
        help_text='User receiving the payment'
    )
    
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text='Transaction amount'
    )
    
    commission_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        default=Decimal('0.00'),
        help_text='Platform commission amount'
    )
    
    currency = models.CharField(
        max_length=3,
        default='GHS',
        help_text='Currency code (ISO 4217)'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING',
        help_text='Transaction status'
    )
    
    txn_provider = models.CharField(
        max_length=20,
        choices=PROVIDER_CHOICES,
        help_text='Payment provider'
    )
    
    txn_provider_ref = models.CharField(
        max_length=255,
        blank=True,
        help_text='External transaction reference from payment provider'
    )
    
    idempotency_key = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        help_text='Key for webhook deduplication'
    )
    
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text='Additional transaction metadata'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='Transaction creation timestamp'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text='Last update timestamp'
    )
    
    class Meta:
        db_table = 'transactions'
        verbose_name = 'Transaction'
        verbose_name_plural = 'Transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['booking']),
            models.Index(fields=['customer']),
            models.Index(fields=['provider']),
            models.Index(fields=['status']),
            models.Index(fields=['txn_provider']),
            models.Index(fields=['txn_provider_ref']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Transaction {self.id} - {self.status} - {self.amount} {self.currency}"
    
    @property
    def is_successful(self):
        """Check if transaction was successful."""
        return self.status == 'SUCCESS'
    
    @property
    def provider_amount(self):
        """Calculate amount provider receives after commission."""
        return self.amount - self.commission_amount


class Commission(models.Model):
    """
    Commission configuration model.
    
    Stores configurable commission rates for different service categories or providers.
    
    Attributes:
        id: UUID primary key
        name: Commission configuration name
        rate: Commission rate (0.0 to 1.0)
        flat_fee: Optional flat fee amount
        is_active: Whether this configuration is active
        applies_to: What this commission applies to (ALL, CATEGORY, PROVIDER)
        category: Optional service category
        provider: Optional specific provider
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """
    
    APPLIES_TO_CHOICES = [
        ('ALL', 'All Bookings'),
        ('CATEGORY', 'Specific Category'),
        ('PROVIDER', 'Specific Provider'),
    ]
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text='Unique identifier for the commission configuration'
    )
    
    name = models.CharField(
        max_length=255,
        help_text='Commission configuration name'
    )
    
    rate = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        validators=[MinValueValidator(Decimal('0.0000')), MaxValueValidator(Decimal('1.0000'))],
        help_text='Commission rate (0.0 to 1.0, e.g., 0.10 for 10%)'
    )
    
    flat_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        default=Decimal('0.00'),
        help_text='Optional flat fee amount'
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text='Whether this configuration is active'
    )
    
    applies_to = models.CharField(
        max_length=20,
        choices=APPLIES_TO_CHOICES,
        default='ALL',
        help_text='What this commission applies to'
    )
    
    category = models.CharField(
        max_length=100,
        blank=True,
        help_text='Service category (if applies_to is CATEGORY)'
    )
    
    provider = models.ForeignKey(
        'providers.Provider',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='commission_configs',
        help_text='Specific provider (if applies_to is PROVIDER)'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='Creation timestamp'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text='Last update timestamp'
    )
    
    class Meta:
        db_table = 'commissions'
        verbose_name = 'Commission'
        verbose_name_plural = 'Commissions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['applies_to']),
            models.Index(fields=['category']),
            models.Index(fields=['provider']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.rate * 100}%"
    
    def calculate_commission(self, amount):
        """
        Calculate commission for a given amount.
        
        Args:
            amount: Booking amount
            
        Returns:
            Decimal: Commission amount
        """
        commission = (amount * self.rate) + self.flat_fee
        return commission.quantize(Decimal('0.01'))
