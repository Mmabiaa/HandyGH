"""
API tests for messaging endpoints.

Tests message sending and retrieval endpoints.
"""

import pytest
from rest_framework import status

from apps.messaging.models import Message


@pytest.mark.django_db
class TestBookingMessagesEndpoint:
    """Test GET/POST /api/v1/bookings/{booking_id}/messages/"""

    def test_send_message_success(self, api_client, customer, customer_token, booking):
        """Test successful message sending."""
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")

        url = f"/api/v1/bookings/{booking.id}/messages/"
        data = {"content": "Hello, when can you start the work?", "attachments": []}

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["success"] is True
        assert response.data["data"]["content"] == "Hello, when can you start the work?"
        assert response.data["data"]["sender"]["id"] == str(customer.id)

        # Verify message was created
        assert Message.objects.filter(booking=booking, sender=customer).exists()

    def test_send_message_with_attachments(self, api_client, customer, customer_token, booking):
        """Test sending message with attachments."""
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")

        url = f"/api/v1/bookings/{booking.id}/messages/"
        data = {
            "content": "Here are some photos of the issue",
            "attachments": ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert len(response.data["data"]["attachments"]) == 2
        assert response.data["data"]["has_attachments"] is True

    def test_send_message_empty_content(self, api_client, customer, customer_token, booking):
        """Test sending message with empty content fails."""
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")

        url = f"/api/v1/bookings/{booking.id}/messages/"
        data = {"content": "   ", "attachments": []}

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["success"] is False

    def test_send_message_unauthenticated(self, api_client, booking):
        """Test sending message without authentication."""
        url = f"/api/v1/bookings/{booking.id}/messages/"
        data = {"content": "Test message", "attachments": []}

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_send_message_not_participant(
        self, api_client, customer_user, customer_user_token, booking
    ):
        """Test sending message by non-participant fails."""
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_user_token}")

        url = f"/api/v1/bookings/{booking.id}/messages/"
        data = {"content": "Test message", "attachments": []}

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert response.data["success"] is False

    def test_send_message_too_many_attachments(self, api_client, customer, customer_token, booking):
        """Test sending message with too many attachments fails."""
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")

        url = f"/api/v1/bookings/{booking.id}/messages/"
        data = {
            "content": "Too many attachments",
            "attachments": [f"https://example.com/photo{i}.jpg" for i in range(6)],
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["success"] is False

    def test_send_message_invalid_attachment_url(
        self, api_client, customer, customer_token, booking
    ):
        """Test sending message with invalid attachment URL fails."""
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")

        url = f"/api/v1/bookings/{booking.id}/messages/"
        data = {"content": "Invalid attachment", "attachments": ["not-a-valid-url"]}

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["success"] is False

    def test_get_messages_success(
        self, api_client, customer, customer_token, provider_user, booking
    ):
        """Test retrieving booking messages."""
        # Create some messages
        Message.objects.create(
            booking=booking, sender=customer, content="First message from customer"
        )
        Message.objects.create(
            booking=booking, sender=provider_user, content="Response from provider"
        )

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")

        url = f"/api/v1/bookings/{booking.id}/messages/"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True
        assert len(response.data["data"]) == 2
        assert response.data["meta"]["count"] == 2

    def test_get_messages_with_pagination(self, api_client, customer, customer_token, booking):
        """Test retrieving messages with pagination."""
        # Create multiple messages
        for i in range(10):
            Message.objects.create(booking=booking, sender=customer, content=f"Message {i}")

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")

        # Get first 5 messages
        url = f"/api/v1/bookings/{booking.id}/messages/?limit=5&offset=0"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["data"]) == 5
        assert response.data["meta"]["limit"] == 5
        assert response.data["meta"]["offset"] == 0

        # Get next 5 messages
        url = f"/api/v1/bookings/{booking.id}/messages/?limit=5&offset=5"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["data"]) == 5
        assert response.data["meta"]["offset"] == 5

    def test_get_messages_invalid_pagination_params(
        self, api_client, customer, customer_token, booking
    ):
        """Test retrieving messages with invalid pagination parameters."""
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")

        # Invalid limit
        url = f"/api/v1/bookings/{booking.id}/messages/?limit=-1"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["success"] is False

        # Invalid offset
        url = f"/api/v1/bookings/{booking.id}/messages/?offset=-1"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["success"] is False

    def test_get_messages_unauthenticated(self, api_client, booking):
        """Test retrieving messages without authentication."""
        url = f"/api/v1/bookings/{booking.id}/messages/"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_messages_not_participant(
        self, api_client, customer_user, customer_user_token, booking
    ):
        """Test retrieving messages by non-participant fails."""
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_user_token}")

        url = f"/api/v1/bookings/{booking.id}/messages/"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert response.data["success"] is False

    def test_get_messages_invalid_booking(self, api_client, customer, customer_token):
        """Test retrieving messages for non-existent booking."""
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")

        url = "/api/v1/bookings/00000000-0000-0000-0000-000000000000/messages/"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["success"] is False

    def test_message_ordering(self, api_client, customer, customer_token, provider_user, booking):
        """Test messages are returned in chronological order."""
        # Create messages in sequence
        msg1 = Message.objects.create(booking=booking, sender=customer, content="First message")
        msg2 = Message.objects.create(
            booking=booking, sender=provider_user, content="Second message"
        )
        msg3 = Message.objects.create(booking=booking, sender=customer, content="Third message")

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {customer_token}")

        url = f"/api/v1/bookings/{booking.id}/messages/"
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        messages = response.data["data"]

        # Verify chronological order
        assert messages[0]["id"] == str(msg1.id)
        assert messages[1]["id"] == str(msg2.id)
        assert messages[2]["id"] == str(msg3.id)

    def test_provider_can_send_and_receive_messages(
        self, api_client, provider_user, provider_token, customer, booking
    ):
        """Test provider can send and receive messages."""
        # Provider sends a message
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {provider_token}")

        url = f"/api/v1/bookings/{booking.id}/messages/"
        data = {"content": "I can start tomorrow at 9 AM", "attachments": []}

        response = api_client.post(url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["data"]["sender"]["id"] == str(provider_user.id)

        # Provider retrieves messages
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["data"]) == 1
