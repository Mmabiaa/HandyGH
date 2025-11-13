"""
End-to-end integration tests for customer user flows.
Tests the complete journey: signup → search → booking → payment → review
"""

from datetime import timedelta
from decimal import Decimal

from django.utils import timezone

import pytest
from rest_framework.test import APIClient


@pytest.mark.integration
@pytest.mark.django_db
class TestCustomerE2EFlow:
    """Test complete customer journey from signup to review."""

    def test_complete_customer_journey(self):
        """
        Test complete customer flow:
        1. Customer signs up with OTP
        2. Searches for providers
        3. Creates a booking
        4. Makes payment
        5. Leaves a review
        """
        client = APIClient()

        # Step 1: Customer signup with OTP
        phone = "+233241234567"

        # Request OTP
        response = client.post("/api/v1/auth/otp/request/", {"phone": phone})
        assert response.status_code == 200
        assert response.data["success"] is True

        # Get the OTP from database (in real scenario, user receives via SMS)
        from apps.authentication.models import OTPToken

        otp_token = OTPToken.objects.filter(phone=phone).latest("created_at")

        # Verify OTP and get tokens
        from core.utils import generate_otp

        test_otp = generate_otp(length=6)

        # Update the OTP token with a known value for testing
        from core.utils import hash_value

        otp_token.code_hash = hash_value(test_otp)
        otp_token.save()

        response = client.post(
            "/api/v1/auth/otp/verify/",
            {"phone": phone, "otp": test_otp, "name": "Test Customer", "role": "CUSTOMER"},
        )
        assert response.status_code == 200
        assert "access_token" in response.data["data"]

        access_token = response.data["data"]["access_token"]
        customer_id = response.data["data"]["user"]["id"]

        # Set authentication for subsequent requests
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        # Step 2: Create a provider and service for testing
        from django.contrib.auth import get_user_model

        from apps.providers.models import Provider, ProviderService, ServiceCategory

        User = get_user_model()
        provider_user = User.objects.create(
            phone="+233241234568", email="provider@test.com", name="Test Provider", role="PROVIDER"
        )

        provider = Provider.objects.create(
            user=provider_user,
            business_name="Best Plumbing Services",
            categories=["plumbing"],
            latitude=5.6037,
            longitude=-0.1870,
            address="Accra, Ghana",
            verified=True,
            is_active=True,
            rating_avg=Decimal("4.5"),
            rating_count=10,
        )

        category = ServiceCategory.objects.create(
            name="Plumbing", slug="plumbing", description="Plumbing services", is_active=True
        )

        service = ProviderService.objects.create(
            provider=provider,
            category=category,
            title="Emergency Plumbing",
            description="24/7 emergency plumbing services",
            price_type="HOURLY",
            price_amount=Decimal("50.00"),
            duration_estimate_min=120,
            is_active=True,
        )

        # Step 3: Search for providers
        response = client.get(
            "/api/v1/providers/",
            {"category": "plumbing", "latitude": 5.6037, "longitude": -0.1870, "radius": 10},
        )
        assert response.status_code == 200
        assert len(response.data["data"]) > 0
        assert response.data["data"][0]["business_name"] == "Best Plumbing Services"

        # Step 4: Create a booking
        scheduled_start = timezone.now() + timedelta(days=1)
        scheduled_end = scheduled_start + timedelta(hours=2)

        response = client.post(
            "/api/v1/bookings/",
            {
                "provider_service_id": str(service.id),
                "scheduled_start": scheduled_start.isoformat(),
                "scheduled_end": scheduled_end.isoformat(),
                "address": "123 Test Street, Accra",
                "notes": "Need urgent plumbing repair",
            },
        )
        assert response.status_code == 201
        assert response.data["data"]["status"] == "REQUESTED"

        booking_id = response.data["data"]["id"]

        # Step 5: Provider accepts booking
        from apps.authentication.services import JWTService

        provider_tokens = JWTService.create_tokens(provider_user)

        provider_client = APIClient()
        provider_client.credentials(HTTP_AUTHORIZATION=f"Bearer {provider_tokens['access_token']}")

        response = provider_client.patch(f"/api/v1/bookings/{booking_id}/accept/")
        assert response.status_code == 200
        assert response.data["data"]["status"] == "CONFIRMED"

        # Step 6: Make payment
        response = client.post(
            "/api/v1/payments/momo/charge/",
            {"booking_id": booking_id, "phone": phone, "amount": "100.00"},
        )
        assert response.status_code == 200
        assert response.data["success"] is True

        # Step 7: Complete the booking
        from apps.bookings.models import Booking

        booking = Booking.objects.get(id=booking_id)
        booking.status = "COMPLETED"
        booking.save()

        # Step 8: Leave a review
        response = client.post(
            f"/api/v1/bookings/{booking_id}/reviews/",
            {"rating": 5, "comment": "Excellent service! Very professional and quick."},
        )
        assert response.status_code == 201
        assert response.data["data"]["rating"] == 5

        # Verify provider rating was updated
        provider.refresh_from_db()
        assert provider.rating_count == 11

    def test_customer_booking_cancellation_flow(self):
        """Test customer cancelling a booking."""
        client = APIClient()

        # Create customer and authenticate
        from django.contrib.auth import get_user_model

        from apps.authentication.services import JWTService

        User = get_user_model()
        customer = User.objects.create(
            phone="+233241111111", email="customer@test.com", name="Test Customer", role="CUSTOMER"
        )

        tokens = JWTService.create_tokens(customer)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")

        # Create provider and booking
        from apps.bookings.models import Booking
        from apps.providers.models import Provider, ProviderService, ServiceCategory

        provider_user = User.objects.create(phone="+233242222222", name="Provider", role="PROVIDER")

        provider = Provider.objects.create(
            user=provider_user,
            business_name="Test Provider",
            categories=["cleaning"],
            latitude=5.6037,
            longitude=-0.1870,
            verified=True,
            is_active=True,
        )

        category = ServiceCategory.objects.create(name="Cleaning", slug="cleaning", is_active=True)

        service = ProviderService.objects.create(
            provider=provider,
            category=category,
            title="House Cleaning",
            price_type="FIXED",
            price_amount=Decimal("80.00"),
            is_active=True,
        )

        scheduled_start = timezone.now() + timedelta(days=2)
        booking = Booking.objects.create(
            booking_ref="BK-CANCEL-TEST",
            customer=customer,
            provider=provider,
            provider_service=service,
            status="CONFIRMED",
            scheduled_start=scheduled_start,
            scheduled_end=scheduled_start + timedelta(hours=3),
            address="Test Address",
            total_amount=Decimal("80.00"),
            payment_status="PENDING",
        )

        # Cancel the booking
        response = client.patch(f"/api/v1/bookings/{booking.id}/status/", {"status": "CANCELLED"})
        assert response.status_code == 200
        assert response.data["data"]["status"] == "CANCELLED"
