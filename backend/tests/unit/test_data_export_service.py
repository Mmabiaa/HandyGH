"""
Unit tests for DataExportService.
"""

import csv
from datetime import timedelta
from decimal import Decimal
from io import StringIO

from django.utils import timezone

import pytest

from apps.admin_dashboard.services import DataExportService
from apps.bookings.models import Booking
from apps.payments.models import Transaction
from apps.users.models import User


@pytest.mark.django_db
class TestDataExportService:
    """Test DataExportService methods."""

    def test_export_users_csv(self, customer_user, provider_user):
        """Test exporting users to CSV."""
        csv_data = DataExportService.export_users_csv()

        assert csv_data is not None
        assert len(csv_data) > 0

        # Parse CSV
        reader = csv.reader(StringIO(csv_data))
        rows = list(reader)

        # Check header
        assert rows[0][0] == "User ID"
        assert rows[0][1] == "Phone"
        assert rows[0][2] == "Email"

        # Check data rows (at least 2 users)
        assert len(rows) >= 3  # Header + 2 users

    def test_export_users_csv_with_role_filter(self, customer_user, provider_user):
        """Test exporting users with role filter."""
        csv_data = DataExportService.export_users_csv(role="CUSTOMER")

        reader = csv.reader(StringIO(csv_data))
        rows = list(reader)

        # Check that only customers are included
        for row in rows[1:]:  # Skip header
            if len(row) > 4:  # Ensure row has role column
                assert row[4] == "CUSTOMER"

    def test_export_users_csv_with_active_filter(self, customer_user, provider_user):
        """Test exporting users with active status filter."""
        # Deactivate one user
        provider_user.deactivate()

        csv_data = DataExportService.export_users_csv(is_active=True)

        reader = csv.reader(StringIO(csv_data))
        rows = list(reader)

        # Check that only active users are included
        for row in rows[1:]:  # Skip header
            if len(row) > 5:  # Ensure row has is_active column
                assert row[5] == "Yes"

    def test_export_bookings_csv(self, booking):
        """Test exporting bookings to CSV."""
        csv_data = DataExportService.export_bookings_csv()

        assert csv_data is not None
        assert len(csv_data) > 0

        # Parse CSV
        reader = csv.reader(StringIO(csv_data))
        rows = list(reader)

        # Check header
        assert rows[0][0] == "Booking ID"
        assert rows[0][1] == "Booking Reference"
        assert rows[0][2] == "Customer Phone"

        # Check data rows
        assert len(rows) >= 2  # Header + 1 booking

    def test_export_bookings_csv_with_date_range(self, customer_user, provider, provider_service):
        """Test exporting bookings with date range filter."""
        scheduled_start = timezone.now() + timedelta(days=1)

        # Create booking
        Booking.objects.create(
            booking_ref="BK-EXPORT-TEST",
            customer=customer_user,
            provider=provider,
            provider_service=provider_service,
            status="CONFIRMED",
            scheduled_start=scheduled_start,
            scheduled_end=scheduled_start + timedelta(hours=2),
            address="Test Address",
            total_amount=Decimal("100.00"),
            payment_status="PENDING",
        )

        start_date = timezone.now() - timedelta(days=1)
        end_date = timezone.now() + timedelta(days=1)

        csv_data = DataExportService.export_bookings_csv(start_date=start_date, end_date=end_date)

        reader = csv.reader(StringIO(csv_data))
        rows = list(reader)

        assert len(rows) >= 2  # Header + at least 1 booking

    def test_export_transactions_csv(self, sample_booking, customer_user, provider_user):
        """Test exporting transactions to CSV."""
        # Create transaction
        Transaction.objects.create(
            booking=sample_booking,
            customer=customer_user,
            provider=provider_user,
            amount=Decimal("100.00"),
            commission_amount=Decimal("10.00"),
            status="SUCCESS",
            txn_provider="MOMO",
        )

        csv_data = DataExportService.export_transactions_csv()

        assert csv_data is not None
        assert len(csv_data) > 0

        # Parse CSV
        reader = csv.reader(StringIO(csv_data))
        rows = list(reader)

        # Check header
        assert rows[0][0] == "Transaction ID"
        assert rows[0][1] == "Booking Reference"
        assert rows[0][2] == "Customer Phone"

        # Check data rows
        assert len(rows) >= 2  # Header + 1 transaction

    def test_export_transactions_csv_with_date_range(
        self, sample_booking, customer_user, provider_user
    ):
        """Test exporting transactions with date range filter."""
        # Create transaction
        Transaction.objects.create(
            booking=sample_booking,
            customer=customer_user,
            provider=provider_user,
            amount=Decimal("100.00"),
            commission_amount=Decimal("10.00"),
            status="SUCCESS",
            txn_provider="MOMO",
        )

        start_date = timezone.now() - timedelta(days=1)
        end_date = timezone.now() + timedelta(days=1)

        csv_data = DataExportService.export_transactions_csv(
            start_date=start_date, end_date=end_date
        )

        reader = csv.reader(StringIO(csv_data))
        rows = list(reader)

        assert len(rows) >= 2  # Header + at least 1 transaction

    def test_export_csv_format_validation(self, customer_user):
        """Test that exported CSV has valid format."""
        csv_data = DataExportService.export_users_csv()

        # Parse CSV
        reader = csv.reader(StringIO(csv_data))
        rows = list(reader)

        # Check that all rows have same number of columns
        header_length = len(rows[0])
        for row in rows[1:]:
            assert len(row) == header_length

    def test_export_empty_data(self):
        """Test exporting when no data exists."""
        # Clear all users except superuser
        User.objects.filter(is_superuser=False).delete()

        csv_data = DataExportService.export_users_csv()

        reader = csv.reader(StringIO(csv_data))
        rows = list(reader)

        # Should still have header
        assert len(rows) >= 1
        assert rows[0][0] == "User ID"
