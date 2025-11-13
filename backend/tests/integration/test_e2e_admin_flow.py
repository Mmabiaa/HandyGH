"""
End-to-end integration tests for admin user flows.
Tests: user moderation → dispute resolution → reporting
"""

from datetime import timedelta
from decimal import Decimal

from django.utils import timezone

import pytest
from rest_framework.test import APIClient


@pytest.mark.integration
@pytest.mark.django_db
class TestAdminE2EFlow:
    """Test complete admin journey for platform management."""

    def test_complete_admin_moderation_flow(self):
        """
        Test complete admin flow:
        1. Admin views dashboard stats
        2. Moderates users (suspend/activate)
        3. Handles disputes
        4. Generates reports
        """
        from django.contrib.auth import get_user_model

        from apps.authentication.services import JWTService

        User = get_user_model()

        # Create admin user
        admin = User.objects.create(
            phone="+233248888888",
            email="admin@handygh.com",
            name="Admin User",
            role="ADMIN",
            is_staff=True,
            is_superuser=True,
        )

        tokens = JWTService.create_tokens(admin)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")

        # Step 1: View dashboard statistics
        response = client.get("/api/v1/admin/dashboard/stats/")
        assert response.status_code == 200
        assert "total_users" in response.data["data"]
        assert "total_bookings" in response.data["data"]
        assert "total_revenue" in response.data["data"]

        # Step 2: Create test users for moderation
        problem_user = User.objects.create(
            phone="+233249999999",
            email="problem@test.com",
            name="Problem User",
            role="CUSTOMER",
            is_active=True,
        )

        # Step 3: Suspend problematic user
        response = client.patch(f"/api/v1/admin/users/{problem_user.id}/suspend/")
        assert response.status_code == 200

        problem_user.refresh_from_db()
        assert problem_user.is_active is False

        # Step 4: Reactivate user
        response = client.patch(f"/api/v1/admin/users/{problem_user.id}/activate/")
        assert response.status_code == 200

        problem_user.refresh_from_db()
        assert problem_user.is_active is True

        # Step 5: Create a dispute scenario
        from apps.bookings.models import Booking
        from apps.disputes.models import Dispute
        from apps.providers.models import Provider, ProviderService, ServiceCategory

        provider_user = User.objects.create(phone="+233240000001", name="Provider", role="PROVIDER")

        provider = Provider.objects.create(
            user=provider_user,
            business_name="Test Provider",
            categories=["cleaning"],
            latitude=5.6037,
            longitude=-0.1870,
            verified=True,
            is_active=True,
        )

        customer = User.objects.create(phone="+233240000002", name="Customer", role="CUSTOMER")

        category = ServiceCategory.objects.create(name="Cleaning", slug="cleaning", is_active=True)

        service = ProviderService.objects.create(
            provider=provider,
            category=category,
            title="House Cleaning",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
            is_active=True,
        )

        booking = Booking.objects.create(
            booking_ref="BK-DISPUTE-TEST",
            customer=customer,
            provider=provider,
            provider_service=service,
            status="COMPLETED",
            scheduled_start=timezone.now() - timedelta(days=2),
            scheduled_end=timezone.now() - timedelta(days=2, hours=-2),
            address="Test Address",
            total_amount=Decimal("100.00"),
            payment_status="PAID",
        )

        dispute = Dispute.objects.create(
            booking=booking,
            raised_by=customer,
            reason="QUALITY",
            description="Service was not completed properly",
            evidence={"photos": ["photo1.jpg"]},
            status="OPEN",
        )

        # Step 6: Admin views disputes
        response = client.get("/api/v1/disputes/")
        assert response.status_code == 200
        assert len(response.data["data"]) > 0

        # Step 7: Admin resolves dispute
        response = client.post(
            f"/api/v1/disputes/{dispute.id}/resolve/",
            {"resolution": "Partial refund issued to customer", "status": "RESOLVED"},
        )
        assert response.status_code == 200
        assert response.data["data"]["status"] == "RESOLVED"

        # Step 8: Generate transaction report
        response = client.get("/api/v1/admin/reports/transactions/")
        assert response.status_code == 200

        # Step 9: Generate booking report
        response = client.get("/api/v1/admin/reports/bookings/")
        assert response.status_code == 200

    def test_admin_export_data(self):
        """Test admin exporting data to CSV."""
        from django.contrib.auth import get_user_model

        from apps.authentication.services import JWTService

        User = get_user_model()

        admin = User.objects.create(
            phone="+233240000003",
            email="admin2@handygh.com",
            name="Admin User 2",
            role="ADMIN",
            is_staff=True,
            is_superuser=True,
        )

        tokens = JWTService.create_tokens(admin)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")

        # Export transactions
        response = client.get("/api/v1/admin/export/csv/", {"export_type": "transactions"})
        assert response.status_code == 200
        assert response["Content-Type"] == "text/csv"

        # Export bookings
        response = client.get("/api/v1/admin/export/csv/", {"export_type": "bookings"})
        assert response.status_code == 200
        assert response["Content-Type"] == "text/csv"

        # Export users
        response = client.get("/api/v1/admin/export/csv/", {"export_type": "users"})
        assert response.status_code == 200
        assert response["Content-Type"] == "text/csv"

    def test_admin_user_management(self):
        """Test admin managing all users."""
        from django.contrib.auth import get_user_model

        from apps.authentication.services import JWTService

        User = get_user_model()

        admin = User.objects.create(
            phone="+233240000004",
            email="admin3@handygh.com",
            name="Admin User 3",
            role="ADMIN",
            is_staff=True,
            is_superuser=True,
        )

        # Create some test users
        for i in range(5):
            User.objects.create(
                phone=f"+23324000010{i}",
                email=f"user{i}@test.com",
                name=f"Test User {i}",
                role="CUSTOMER" if i % 2 == 0 else "PROVIDER",
            )

        tokens = JWTService.create_tokens(admin)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")

        # List all users
        response = client.get("/api/v1/admin/users/")
        assert response.status_code == 200
        assert len(response.data["data"]) >= 5

        # Filter by role
        response = client.get("/api/v1/admin/users/", {"role": "CUSTOMER"})
        assert response.status_code == 200
        customers = response.data["data"]
        assert all(user["role"] == "CUSTOMER" for user in customers)

    def test_admin_provider_verification(self):
        """Test admin verifying provider accounts."""
        from django.contrib.auth import get_user_model

        from apps.authentication.services import JWTService
        from apps.providers.models import Provider

        User = get_user_model()

        admin = User.objects.create(
            phone="+233240000005",
            email="admin4@handygh.com",
            name="Admin User 4",
            role="ADMIN",
            is_staff=True,
            is_superuser=True,
        )

        provider_user = User.objects.create(
            phone="+233240000006", name="Unverified Provider", role="PROVIDER"
        )

        provider = Provider.objects.create(
            user=provider_user,
            business_name="New Business",
            categories=["plumbing"],
            latitude=5.6037,
            longitude=-0.1870,
            verified=False,
            is_active=True,
        )

        tokens = JWTService.create_tokens(admin)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")

        # Admin verifies provider (in real scenario, this would be through admin panel or dedicated endpoint)
        # For now, we verify the admin can access provider details
        response = client.get(f"/api/v1/providers/{provider.id}/")
        assert response.status_code == 200
        assert response.data["data"]["verified"] is False

        # Admin performs verification (simulated via direct model update)
        provider.verified = True
        provider.save()

        provider.refresh_from_db()
        assert provider.verified is True

        # Verify the change is reflected in API
        response = client.get(f"/api/v1/providers/{provider.id}/")
        assert response.status_code == 200
        assert response.data["data"]["verified"] is True

    def test_admin_dispute_workflow(self):
        """Test complete dispute handling workflow."""
        from django.contrib.auth import get_user_model

        from apps.authentication.services import JWTService
        from apps.bookings.models import Booking
        from apps.disputes.models import Dispute
        from apps.providers.models import Provider, ProviderService, ServiceCategory

        User = get_user_model()

        admin = User.objects.create(
            phone="+233240000007",
            email="admin5@handygh.com",
            name="Admin User 5",
            role="ADMIN",
            is_staff=True,
            is_superuser=True,
        )

        # Create dispute scenario
        provider_user = User.objects.create(phone="+233240000008", name="Provider", role="PROVIDER")

        provider = Provider.objects.create(
            user=provider_user,
            business_name="Provider Business",
            categories=["electrical"],
            latitude=5.6037,
            longitude=-0.1870,
            verified=True,
            is_active=True,
        )

        customer = User.objects.create(phone="+233240000009", name="Customer", role="CUSTOMER")

        category = ServiceCategory.objects.create(
            name="Electrical", slug="electrical", is_active=True
        )

        service = ProviderService.objects.create(
            provider=provider,
            category=category,
            title="Electrical Work",
            price_type="FIXED",
            price_amount=Decimal("200.00"),
            is_active=True,
        )

        booking = Booking.objects.create(
            booking_ref="BK-DISPUTE-WORKFLOW",
            customer=customer,
            provider=provider,
            provider_service=service,
            status="COMPLETED",
            scheduled_start=timezone.now() - timedelta(days=1),
            scheduled_end=timezone.now() - timedelta(hours=22),
            address="Test Address",
            total_amount=Decimal("200.00"),
            payment_status="PAID",
        )

        dispute = Dispute.objects.create(
            booking=booking,
            raised_by=customer,
            reason="INCOMPLETE",
            description="Work was not completed",
            evidence={"photos": ["evidence.jpg"]},
            status="OPEN",
        )

        tokens = JWTService.create_tokens(admin)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")

        # Update dispute status to investigating
        response = client.patch(f"/api/v1/disputes/{dispute.id}/", {"status": "INVESTIGATING"})
        assert response.status_code == 200
        assert response.data["data"]["status"] == "INVESTIGATING"

        # Resolve dispute
        response = client.post(
            f"/api/v1/disputes/{dispute.id}/resolve/",
            {
                "resolution": "Provider will complete remaining work within 48 hours",
                "status": "RESOLVED",
            },
        )
        assert response.status_code == 200
        assert response.data["data"]["status"] == "RESOLVED"

        # Close dispute
        dispute.refresh_from_db()
        dispute.status = "CLOSED"
        dispute.save()

        response = client.get(f"/api/v1/disputes/{dispute.id}/")
        assert response.status_code == 200
        assert response.data["data"]["status"] == "CLOSED"
