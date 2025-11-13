"""
API tests for user endpoints.
"""

from django.urls import reverse

import pytest
from rest_framework import status


@pytest.mark.django_db
class TestUserMeEndpoint:
    """Test /api/v1/users/me/ endpoint."""

    def test_get_current_user_authenticated(self, authenticated_client):
        """Test getting current user profile when authenticated."""
        url = reverse("users:user-get-current-user")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert "data" in response.data
        data = response.data["data"]
        assert "id" in data
        assert "phone" in data
        assert "name" in data
        assert "role" in data
        assert "profile" in data
        assert data["id"] == str(authenticated_client.user.id)

    def test_get_current_user_unauthenticated(self, api_client):
        """Test getting current user profile when not authenticated."""
        url = reverse("users:user-get-current-user")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestUserDetailEndpoint:
    """Test /api/v1/users/{id}/ endpoint."""

    def test_get_user_by_id_as_admin(self, api_client, admin_user, customer_user):
        """Test getting user by ID as admin."""
        from apps.authentication.services import JWTService

        # Authenticate as admin
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")

        url = reverse("users:user-detail", kwargs={"pk": str(customer_user.id)})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["id"] == str(customer_user.id)

    def test_get_user_by_id_as_customer(self, authenticated_client, provider_user):
        """Test getting user by ID as customer (should succeed - can view other users)."""
        url = reverse("users:user-detail", kwargs={"pk": str(provider_user.id)})
        response = authenticated_client.get(url)

        # Based on IsOwnerOrAdmin permission, users can view other profiles
        assert response.status_code == status.HTTP_200_OK

    def test_get_user_by_id_unauthenticated(self, api_client, customer_user):
        """Test getting user by ID when not authenticated."""
        url = reverse("users:user-detail", kwargs={"pk": str(customer_user.id)})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestUserPermissions:
    """Test user endpoint permissions."""

    def test_customer_can_access_own_profile(self, authenticated_client):
        """Test that customer can access their own profile."""
        url = reverse("users:user-get-current-user")
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["role"] == "CUSTOMER"

    def test_provider_can_access_own_profile(self, api_client, provider_user):
        """Test that provider can access their own profile."""
        from apps.authentication.services import JWTService

        tokens = JWTService.create_tokens(provider_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")

        url = reverse("users:user-get-current-user")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["role"] == "PROVIDER"

    def test_admin_can_access_own_profile(self, api_client, admin_user):
        """Test that admin can access their own profile."""
        from apps.authentication.services import JWTService

        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")

        url = reverse("users:user-get-current-user")
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["role"] == "ADMIN"

    def test_admin_can_view_other_users(self, api_client, admin_user, customer_user):
        """Test that admin can view other users."""
        from apps.authentication.services import JWTService

        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")

        url = reverse("users:user-detail", kwargs={"pk": str(customer_user.id)})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK

    def test_customer_can_view_other_users(self, authenticated_client, provider_user):
        """Test that customer can view other users (public profiles)."""
        url = reverse("users:user-detail", kwargs={"pk": str(provider_user.id)})
        response = authenticated_client.get(url)

        # Users can view other user profiles (public information)
        assert response.status_code == status.HTTP_200_OK
