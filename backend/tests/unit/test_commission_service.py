"""
Unit tests for CommissionService.
"""

from decimal import Decimal

import pytest

from apps.bookings.models import Booking
from apps.payments.models import Commission
from apps.payments.services import CommissionService
from apps.providers.models import Provider


@pytest.mark.django_db
class TestCommissionService:
    """Test CommissionService methods."""

    def test_calculate_commission_with_default_rate(self, sample_booking):
        """Test commission calculation with default rate."""
        commission = CommissionService.calculate_commission(
            amount=Decimal("100.00"), booking=sample_booking
        )

        # Default rate is 10% (0.10)
        assert commission == Decimal("10.00")

    def test_calculate_commission_with_provider_specific_rate(
        self, sample_booking, sample_provider
    ):
        """Test commission calculation with provider-specific rate."""
        # Create provider-specific commission
        Commission.objects.create(
            name="Provider Commission",
            rate=Decimal("0.15"),
            applies_to="PROVIDER",
            provider=sample_provider,
            is_active=True,
        )

        commission = CommissionService.calculate_commission(
            amount=Decimal("100.00"), booking=sample_booking, provider_id=sample_provider.id
        )

        # Provider-specific rate is 15%
        assert commission == Decimal("15.00")

    def test_calculate_commission_with_category_rate(self, sample_booking):
        """Test commission calculation with category-specific rate."""
        # Create category-specific commission
        Commission.objects.create(
            name="Plumbing Commission",
            rate=Decimal("0.12"),
            applies_to="CATEGORY",
            category="plumbing",
            is_active=True,
        )

        commission = CommissionService.calculate_commission(
            amount=Decimal("100.00"), booking=sample_booking, category="plumbing"
        )

        # Category-specific rate is 12%
        assert commission == Decimal("12.00")

    def test_calculate_commission_with_all_rate(self, sample_booking):
        """Test commission calculation with 'ALL' rate."""
        # Create 'ALL' commission
        Commission.objects.create(
            name="Default Commission", rate=Decimal("0.08"), applies_to="ALL", is_active=True
        )

        commission = CommissionService.calculate_commission(
            amount=Decimal("100.00"), booking=sample_booking
        )

        # 'ALL' rate is 8%
        assert commission == Decimal("8.00")

    def test_calculate_commission_priority_order(self, sample_booking, sample_provider):
        """Test that provider-specific rate takes priority over category and default."""
        # Create all types of commissions
        Commission.objects.create(
            name="Default Commission", rate=Decimal("0.08"), applies_to="ALL", is_active=True
        )
        Commission.objects.create(
            name="Category Commission",
            rate=Decimal("0.12"),
            applies_to="CATEGORY",
            category="plumbing",
            is_active=True,
        )
        Commission.objects.create(
            name="Provider Commission",
            rate=Decimal("0.15"),
            applies_to="PROVIDER",
            provider=sample_provider,
            is_active=True,
        )

        commission = CommissionService.calculate_commission(
            amount=Decimal("100.00"),
            booking=sample_booking,
            provider_id=sample_provider.id,
            category="plumbing",
        )

        # Provider-specific rate (15%) should take priority
        assert commission == Decimal("15.00")

    def test_calculate_commission_rounds_correctly(self, sample_booking):
        """Test that commission is rounded to 2 decimal places."""
        commission = CommissionService.calculate_commission(
            amount=Decimal("33.33"), booking=sample_booking
        )

        # 33.33 * 0.10 = 3.333, should round to 3.33
        assert commission == Decimal("3.33")

    def test_calculate_commission_invalid_amount(self, sample_booking):
        """Test that invalid amount raises ValidationError."""
        from core.exceptions import ValidationError

        with pytest.raises(ValidationError, match="Amount must be greater than zero"):
            CommissionService.calculate_commission(amount=Decimal("0.00"), booking=sample_booking)

    def test_get_provider_amount(self):
        """Test provider amount calculation."""
        amount = Decimal("100.00")
        commission = Decimal("10.00")

        provider_amount = CommissionService.get_provider_amount(amount, commission)

        assert provider_amount == Decimal("90.00")

    def test_get_commission_rate_inactive_commission(self, sample_booking, sample_provider):
        """Test that inactive commissions are not used."""
        # Create inactive provider-specific commission
        Commission.objects.create(
            name="Inactive Provider Commission",
            rate=Decimal("0.20"),
            applies_to="PROVIDER",
            provider=sample_provider,
            is_active=False,
        )

        # Create active default commission
        Commission.objects.create(
            name="Default Commission", rate=Decimal("0.08"), applies_to="ALL", is_active=True
        )

        rate = CommissionService.get_commission_rate(
            booking=sample_booking, provider_id=sample_provider.id
        )

        # Should use default rate since provider rate is inactive
        assert rate == Decimal("0.08")
