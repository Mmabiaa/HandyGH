"""
API tests for dispute endpoints.
"""

from django.utils import timezone

import pytest
from rest_framework import status

from apps.disputes.models import Dispute


@pytest.mark.django_db
class TestDisputeEndpoints:
    """Test dispute API endpoints."""

    def test_create_dispute_success(self, api_client, customer_token, customer, booking):
        """Test successful dispute creation."""
        booking.status = "COMPLETED"
        booking.save()

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")

        data = {
            "booking_id": str(booking.id),
            "reason": "Service not completed properly",
            "description": "The plumbing work was not done according to specifications.",
            "evidence": [{"url": "https://example.com/photo1.jpg", "type": "photo"}],
        }

        response = api_client.post("/api/v1/disputes/", data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["success"] is True
        assert "data" in response.data
        assert response.data["data"]["reason"] == data["reason"]
        assert response.data["data"]["status"] == "OPEN"

    def test_create_dispute_unauthenticated(self, api_client, booking):
        """Test dispute creation without authentication."""
        booking.status = "COMPLETED"
        booking.save()

        data = {
            "booking_id": str(booking.id),
            "reason": "Test reason",
            "description": "Test description that is long enough",
        }

        response = api_client.post("/api/v1/disputes/", data, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_dispute_invalid_booking(self, api_client, customer_token):
        """Test dispute creation with invalid booking ID."""
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")

        data = {
            "booking_id": "00000000-0000-0000-0000-000000000000",
            "reason": "Test reason",
            "description": "Test description that is long enough",
        }

        response = api_client.post("/api/v1/disputes/", data, format="json")

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["success"] is False

    def test_create_dispute_short_reason(self, api_client, customer_token, booking):
        """Test dispute creation with too short reason."""
        booking.status = "COMPLETED"
        booking.save()

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")

        data = {
            "booking_id": str(booking.id),
            "reason": "Bad",
            "description": "Test description that is long enough",
        }

        response = api_client.post("/api/v1/disputes/", data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_list_disputes_customer(self, api_client, customer_token, customer, booking):
        """Test listing disputes as customer."""
        booking.status = "COMPLETED"
        booking.save()

        # Create dispute
        Dispute.objects.create(
            booking=booking,
            raised_by=customer,
            reason="Test reason",
            description="Test description that is long enough",
            status="OPEN",
        )

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")
        response = api_client.get("/api/v1/disputes/")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True
        assert len(response.data["data"]) == 1

    def test_list_disputes_admin(self, api_client, admin_user, customer, booking):
        """Test listing disputes as admin."""
        from apps.authentication.services import JWTService

        booking.status = "COMPLETED"
        booking.save()

        # Create dispute
        Dispute.objects.create(
            booking=booking,
            raised_by=customer,
            reason="Test reason",
            description="Test description that is long enough",
            status="OPEN",
        )

        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")

        response = api_client.get("/api/v1/disputes/")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True
        assert len(response.data["data"]) >= 1

    def test_list_disputes_filter_by_status(self, api_client, customer_token, customer, booking):
        """Test filtering disputes by status."""
        booking.status = "COMPLETED"
        booking.save()

        # Create disputes with different statuses
        Dispute.objects.create(
            booking=booking,
            raised_by=customer,
            reason="Test reason 1",
            description="Test description that is long enough",
            status="OPEN",
        )

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")
        response = api_client.get("/api/v1/disputes/?status=OPEN")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["data"]) == 1
        assert response.data["data"][0]["status"] == "OPEN"

    def test_get_dispute_details(self, api_client, customer_token, customer, booking):
        """Test getting dispute details."""
        booking.status = "COMPLETED"
        booking.save()

        dispute = Dispute.objects.create(
            booking=booking,
            raised_by=customer,
            reason="Test reason",
            description="Test description that is long enough",
            status="OPEN",
        )

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")
        response = api_client.get(f"/api/v1/disputes/{dispute.id}/")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True
        assert response.data["data"]["id"] == str(dispute.id)
        assert response.data["data"]["reason"] == dispute.reason

    def test_get_dispute_unauthorized(self, api_client, customer_user_token, customer, booking):
        """Test getting dispute details by unauthorized user."""
        booking.status = "COMPLETED"
        booking.save()

        dispute = Dispute.objects.create(
            booking=booking,
            raised_by=customer,
            reason="Test reason",
            description="Test description that is long enough",
            status="OPEN",
        )

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_user_token}")
        response = api_client.get(f"/api/v1/disputes/{dispute.id}/")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_update_dispute_status_admin(self, api_client, admin_user, customer, booking):
        """Test updating dispute status as admin."""
        from apps.authentication.services import JWTService

        booking.status = "COMPLETED"
        booking.save()

        dispute = Dispute.objects.create(
            booking=booking,
            raised_by=customer,
            reason="Test reason",
            description="Test description that is long enough",
            status="OPEN",
        )

        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")

        data = {"status": "INVESTIGATING"}
        response = api_client.patch(f"/api/v1/disputes/{dispute.id}/", data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True
        assert response.data["data"]["status"] == "INVESTIGATING"

    def test_update_dispute_status_non_admin(self, api_client, customer_token, customer, booking):
        """Test updating dispute status as non-admin."""
        booking.status = "COMPLETED"
        booking.save()

        dispute = Dispute.objects.create(
            booking=booking,
            raised_by=customer,
            reason="Test reason",
            description="Test description that is long enough",
            status="OPEN",
        )

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")

        data = {"status": "INVESTIGATING"}
        response = api_client.patch(f"/api/v1/disputes/{dispute.id}/", data, format="json")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_resolve_dispute_admin(self, api_client, admin_user, customer, booking):
        """Test resolving dispute as admin."""
        from apps.authentication.services import JWTService

        booking.status = "COMPLETED"
        booking.save()

        dispute = Dispute.objects.create(
            booking=booking,
            raised_by=customer,
            reason="Test reason",
            description="Test description that is long enough",
            status="OPEN",
        )

        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")

        data = {"resolution": "After reviewing the evidence, we have determined a resolution."}
        response = api_client.post(f"/api/v1/disputes/{dispute.id}/resolve/", data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True
        assert response.data["data"]["status"] == "RESOLVED"
        assert response.data["data"]["resolution"] == data["resolution"]

    def test_resolve_dispute_non_admin(self, api_client, customer_token, customer, booking):
        """Test resolving dispute as non-admin."""
        booking.status = "COMPLETED"
        booking.save()

        dispute = Dispute.objects.create(
            booking=booking,
            raised_by=customer,
            reason="Test reason",
            description="Test description that is long enough",
            status="OPEN",
        )

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")

        data = {"resolution": "After reviewing the evidence, we have determined a resolution."}
        response = api_client.post(f"/api/v1/disputes/{dispute.id}/resolve/", data, format="json")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_close_dispute_admin(self, api_client, admin_user, customer, booking):
        """Test closing dispute as admin."""
        from apps.authentication.services import JWTService

        booking.status = "COMPLETED"
        booking.save()

        dispute = Dispute.objects.create(
            booking=booking,
            raised_by=customer,
            reason="Test reason",
            description="Test description that is long enough",
            status="RESOLVED",
            resolution="Test resolution",
            resolved_by=admin_user,
            resolved_at=timezone.now(),
        )

        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")

        response = api_client.post(f"/api/v1/disputes/{dispute.id}/close/")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True
        assert response.data["data"]["status"] == "CLOSED"

    def test_add_evidence_success(self, api_client, customer_token, customer, booking):
        """Test adding evidence to dispute."""
        booking.status = "COMPLETED"
        booking.save()

        dispute = Dispute.objects.create(
            booking=booking,
            raised_by=customer,
            reason="Test reason",
            description="Test description that is long enough",
            status="OPEN",
        )

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")

        data = {
            "url": "https://example.com/evidence.jpg",
            "type": "photo",
            "description": "Additional evidence",
        }
        response = api_client.post(
            f"/api/v1/disputes/{dispute.id}/add-evidence/", data, format="json"
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True
        assert len(response.data["data"]["evidence"]) == 1

    def test_add_evidence_unauthorized(self, api_client, customer_user_token, customer, booking):
        """Test adding evidence by unauthorized user."""
        booking.status = "COMPLETED"
        booking.save()

        dispute = Dispute.objects.create(
            booking=booking,
            raised_by=customer,
            reason="Test reason",
            description="Test description that is long enough",
            status="OPEN",
        )

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_user_token}")

        data = {"url": "https://example.com/evidence.jpg", "type": "photo"}
        response = api_client.post(
            f"/api/v1/disputes/{dispute.id}/add-evidence/", data, format="json"
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN
