"""
API tests for user endpoints.
"""

import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db
class TestUserMeEndpoint:
    """Test /api/v1/users/me/ endpoint."""
    
    def test_get_current_user_authenticated(self, authenticated_client):
        """Test getting current user profile when authenticated."""
        url = reverse('users:user-get-current-user')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'id' in response.data
        assert 'phone' in response.data
        assert 'name' in response.data
        assert 'role' in response.data
        assert 'profile' in response.data
        assert response.data['id'] == str(authenticated_client.user.id)
    
    def test_get_current_user_unauthenticated(self, api_client):
        """Test getting current user profile when not authenticated."""
        url = reverse('users:user-get-current-user')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_update_current_user_name(self, authenticated_client):
        """Test updating current user name."""
        url = reverse('users:user-update-current-user')
        data = {'name': 'Updated Name'}
        
        response = authenticated_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Updated Name'
    
    def test_update_current_user_email(self, authenticated_client):
        """Test updating current user email."""
        url = reverse('users:user-update-current-user')
        data = {'email': 'newemail@example.com'}
        
        response = authenticated_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == 'newemail@example.com'
    
    def test_update_current_user_profile(self, authenticated_client):
        """Test updating current user profile."""
        url = reverse('users:user-update-current-user')
        data = {
            'profile': {
                'address': '123 Test Street',
                'preferences': {'language': 'en'}
            }
        }
        
        response = authenticated_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['profile']['address'] == '123 Test Street'
        assert response.data['profile']['preferences'] == {'language': 'en'}
    
    def test_cannot_update_role(self, authenticated_client):
        """Test that role cannot be updated."""
        url = reverse('users:user-update-current-user')
        original_role = authenticated_client.user.role
        data = {'role': 'ADMIN'}
        
        response = authenticated_client.patch(url, data, format='json')
        
        # Role should not be in the response or should remain unchanged
        authenticated_client.user.refresh_from_db()
        assert authenticated_client.user.role == original_role


@pytest.mark.django_db
class TestUserDetailEndpoint:
    """Test /api/v1/users/{id}/ endpoint."""
    
    def test_get_user_by_id_as_admin(self, api_client, admin_user, customer_user):
        """Test getting user by ID as admin."""
        from apps.authentication.services import JWTService
        
        # Authenticate as admin
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        url = reverse('users:user-detail', kwargs={'pk': str(customer_user.id)})
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['id'] == str(customer_user.id)
    
    def test_get_user_by_id_as_customer(self, authenticated_client, provider_user):
        """Test getting user by ID as customer (should fail)."""
        url = reverse('users:user-detail', kwargs={'pk': provider_user.id})
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_get_user_by_id_unauthenticated(self, api_client, customer_user):
        """Test getting user by ID when not authenticated."""
        url = reverse('users:user-detail', kwargs={'pk': customer_user.id})
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestUserPermissions:
    """Test user endpoint permissions."""
    
    def test_customer_can_access_own_profile(self, authenticated_client):
        """Test that customer can access their own profile."""
        url = reverse('users:me')
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['role'] == 'CUSTOMER'
    
    def test_provider_can_access_own_profile(self, api_client, provider_user):
        """Test that provider can access their own profile."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(provider_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        url = reverse('users:me')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['role'] == 'PROVIDER'
    
    def test_admin_can_access_own_profile(self, api_client, admin_user):
        """Test that admin can access their own profile."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        url = reverse('users:me')
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['role'] == 'ADMIN'
    
    def test_admin_can_view_other_users(self, api_client, admin_user, customer_user):
        """Test that admin can view other users."""
        from apps.authentication.services import JWTService
        
        tokens = JWTService.create_tokens(admin_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
        
        url = reverse('users:user-detail', kwargs={'pk': customer_user.id})
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_customer_cannot_view_other_users(self, authenticated_client, provider_user):
        """Test that customer cannot view other users."""
        url = reverse('users:user-detail', kwargs={'pk': provider_user.id})
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
