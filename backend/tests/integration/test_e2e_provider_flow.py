"""
End-to-end integration tests for provider user flows.
Tests: registration → service creation → booking acceptance → completion
"""

from datetime import timedelta
from decimal import Decimal

from django.utils import timezone

import pytest
from rest_framework.test import APIClient


@pytest.mark.integration
@pytest.mark.django_db
class TestProviderE2EFlow:
    """Test complete provider journey from registration to service delivery."""

    def test_complete_provider_journey(self):
        """
        Test complete provider flow:
        1. Provider signs up
        2. Creates provider profile
        3. Adds services
        4. Receives and accepts booking
        5. Completes service
        """
        client = APIClient()

        # Step 1: Provider signup
        phone = "+233243333333"

        response = client.post("/api/v1/auth/otp/request/", {"phone": phone})
        assert response.status_code == 200

        # Get OTP and verify
        from apps.authentication.models import OTPToken
        from core.utils import generate_otp, hash_value

        test_otp = generate_otp(length=6)
        otp_token = OTPToken.objects.filter(phone=phone).latest("created_at")
        otp_token.code_hash = hash_value(test_otp)
        otp_token.save()

        response = client.post(
            "/api/v1/auth/otp/verify/",
            {
                "phone": phone,
                "otp": test_otp,
                "name": "John the Plumber",
                "email": "john@plumbing.com",
                "role": "PROVIDER",
            },
        )
        assert response.status_code == 200
        access_token = response.data["data"]["access_token"]
        provider_user_id = response.data["data"]["user"]["id"]

        client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        # Step 2: Create provider profile
        response = client.post(
            "/api/v1/providers/",
            {
                "business_name": "John's Plumbing Services",
                "categories": ["plumbing"],
                "latitude": 5.6037,
                "longitude": -0.1870,
                "address": "123 Main St, Accra, Ghana",
                "description": "Professional plumbing services with 10 years experience",
            },
        )
        assert response.status_code == 201
        provider_id = response.data["data"]["id"]

        # Step 3: Add services
        from apps.providers.models import ServiceCategory

        category = ServiceCategory.objects.create(
            name="Plumbing", slug="plumbing", description="Plumbing services", is_active=True
        )

        response = client.post(
            f"/api/v1/providers/{provider_id}/services/",
            {
                "category_id": str(category.id),
                "title": "Emergency Pipe Repair",
                "description": "Fast emergency pipe repair service available 24/7",
                "price_type": "HOURLY",
                "price_amount": "60.00",
                "duration_estimate_min": 90,
            },
        )
        assert response.status_code == 201
        service_id = response.data["data"]["id"]

        # Step 4: Customer creates a booking
        from django.contrib.auth import get_user_model

        from apps.authentication.services import JWTService

        User = get_user_model()
        customer = User.objects.create(
            phone="+233244444444", email="customer@test.com", name="Test Customer", role="CUSTOMER"
        )

        customer_tokens = JWTService.create_tokens(customer)
        customer_client = APIClient()
        customer_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_tokens['access_token']}")

        scheduled_start = timezone.now() + timedelta(hours=2)
        scheduled_end = scheduled_start + timedelta(hours=1, minutes=30)

        response = customer_client.post(
            "/api/v1/bookings/",
            {
                "provider_service_id": service_id,
                "scheduled_start": scheduled_start.isoformat(),
                "scheduled_end": scheduled_end.isoformat(),
                "address": "456 Customer St, Accra",
                "notes": "Leaking pipe in kitchen",
            },
        )
        assert response.status_code == 201
        booking_id = response.data["data"]["id"]

        # Step 5: Provider views and accepts booking
        response = client.get("/api/v1/bookings/")
        assert response.status_code == 200
        assert len(response.data["data"]) > 0

        response = client.patch(f"/api/v1/bookings/{booking_id}/accept/")
        assert response.status_code == 200
        assert response.data["data"]["status"] == "CONFIRMED"

        # Step 6: Provider marks booking as in progress
        response = client.patch(f"/api/v1/bookings/{booking_id}/status/", {"status": "IN_PROGRESS"})
        assert response.status_code == 200
        assert response.data["data"]["status"] == "IN_PROGRESS"

        # Step 7: Provider completes the booking
        response = client.patch(f"/api/v1/bookings/{booking_id}/status/", {"status": "COMPLETED"})
        assert response.status_code == 200
        assert response.data["data"]["status"] == "COMPLETED"

        # Step 8: Verify provider can view their bookings
        response = client.get("/api/v1/bookings/")
        assert response.status_code == 200
        bookings = response.data["data"]
        assert any(b["id"] == booking_id for b in bookings)

    def test_provider_decline_and_counter_offer(self):
        """Test provider declining a booking."""
        from django.contrib.auth import get_user_model

        from apps.authentication.services import JWTService
        from apps.bookings.models import Booking
        from apps.providers.models import Provider, ProviderService, ServiceCategory

        User = get_user_model()

        # Create provider
        provider_user = User.objects.create(
            phone="+233245555555", name="Provider User", role="PROVIDER"
        )

        provider = Provider.objects.create(
            user=provider_user,
            business_name="Test Services",
            categories=["electrical"],
            latitude=5.6037,
            longitude=-0.1870,
            verified=True,
            is_active=True,
        )

        category = ServiceCategory.objects.create(
            name="Electrical", slug="electrical", is_active=True
        )

        service = ProviderService.objects.create(
            provider=provider,
            category=category,
            title="Electrical Repair",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
            is_active=True,
        )

        # Create customer and booking
        customer = User.objects.create(phone="+233246666666", name="Customer", role="CUSTOMER")

        scheduled_start = timezone.now() + timedelta(hours=1)
        booking = Booking.objects.create(
            booking_ref="BK-DECLINE-TEST",
            customer=customer,
            provider=provider,
            provider_service=service,
            status="REQUESTED",
            scheduled_start=scheduled_start,
            scheduled_end=scheduled_start + timedelta(hours=2),
            address="Test Address",
            total_amount=Decimal("100.00"),
            payment_status="PENDING",
        )

        # Provider declines
        tokens = JWTService.create_tokens(provider_user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")

        response = client.patch(f"/api/v1/bookings/{booking.id}/decline/")
        assert response.status_code == 200
        assert response.data["data"]["status"] == "CANCELLED"

    def test_provider_manages_multiple_services(self):
        """Test provider adding and managing multiple services."""
        from django.contrib.auth import get_user_model

        from apps.authentication.services import JWTService
        from apps.providers.models import Provider, ServiceCategory

        User = get_user_model()

        provider_user = User.objects.create(
            phone="+233247777777", name="Multi Service Provider", role="PROVIDER"
        )

        provider = Provider.objects.create(
            user=provider_user,
            business_name="All-in-One Services",
            categories=["plumbing", "electrical"],
            latitude=5.6037,
            longitude=-0.1870,
            verified=True,
            is_active=True,
        )

        plumbing_cat = ServiceCategory.objects.create(
            name="Plumbing", slug="plumbing", is_active=True
        )

        electrical_cat = ServiceCategory.objects.create(
            name="Electrical", slug="electrical", is_active=True
        )

        tokens = JWTService.create_tokens(provider_user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")

        # Add plumbing service
        response = client.post(
            f"/api/v1/providers/{provider.id}/services/",
            {
                "category_id": str(plumbing_cat.id),
                "title": "Pipe Installation",
                "description": "Professional pipe installation",
                "price_type": "FIXED",
                "price_amount": "150.00",
            },
        )
        assert response.status_code == 201

        # Add electrical service
        response = client.post(
            f"/api/v1/providers/{provider.id}/services/",
            {
                "category_id": str(electrical_cat.id),
                "title": "Wiring Installation",
                "description": "Complete wiring solutions",
                "price_type": "HOURLY",
                "price_amount": "80.00",
                "duration_estimate_min": 180,
            },
        )
        assert response.status_code == 201

        # List all services
        response = client.get(f"/api/v1/providers/{provider.id}/services/")
        assert response.status_code == 200
        assert len(response.data["data"]) == 2
