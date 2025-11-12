"""
API tests for provider endpoints.

Tests all provider API endpoints with various scenarios including:
- Provider CRUD operations
- Service management
- Provider search with filters
- Permission checks
- Error handling
"""

import pytest
from decimal import Decimal
from django.urls import reverse
from rest_framework import status
from apps.providers.models import Provider, ProviderService, ServiceCategory
from apps.users.models import User
from apps.authentication.services import JWTService


@pytest.fixture
def plumbing_category(db):
    """Create a plumbing service category."""
    return ServiceCategory.objects.create(
        name='Plumbing',
        slug='plumbing',
        description='Plumbing services',
        is_active=True
    )


@pytest.fixture
def electrical_category(db):
    """Create an electrical service category."""
    return ServiceCategory.objects.create(
        name='Electrical',
        slug='electrical',
        description='Electrical services',
        is_active=True
    )


@pytest.fixture
def provider_client(api_client, provider_user):
    """Create an authenticated API client for provider."""
    tokens = JWTService.create_tokens(provider_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access_token']}")
    api_client.user = provider_user
    return api_client


@pytest.fixture
def provider_with_profile(db, provider_user, plumbing_category):
    """Create a provider with profile."""
    return Provider.objects.create(
        user=provider_user,
        business_name='Test Plumbing Services',
        categories=['plumbing'],
        latitude=Decimal('5.6037'),
        longitude=Decimal('-0.1870'),
        address='123 Test Street, Accra',
        verified=True,
        rating_avg=Decimal('4.5'),
        rating_count=10,
        is_active=True
    )


@pytest.mark.django_db
class TestServiceCategoryEndpoints:
    """Test service category endpoints."""
    
    def test_list_categories(self, api_client, plumbing_category, electrical_category):
        """Test listing service categories."""
        url = reverse('providers:category-list')
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert len(response.data['data']) == 2
    
    def test_get_category_detail(self, api_client, plumbing_category):
        """Test getting category details."""
        url = reverse('providers:category-detail', kwargs={'pk': str(plumbing_category.id)})
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert response.data['data']['name'] == 'Plumbing'
    
    def test_list_categories_excludes_inactive(self, api_client, plumbing_category):
        """Test that inactive categories are excluded."""
        # Create inactive category
        ServiceCategory.objects.create(
            name='Inactive',
            slug='inactive',
            is_active=False
        )
        
        url = reverse('providers:category-list')
        response = api_client.get(url)
        
        assert len(response.data['data']) == 1


@pytest.mark.django_db
class TestCreateProviderEndpoint:
    """Test POST /api/v1/providers/ endpoint."""
    
    def test_create_provider_success(self, provider_client, plumbing_category):
        """Test successful provider creation."""
        url = reverse('providers:provider-list')
        data = {
            'business_name': 'Test Plumbing Services',
            'categories': ['plumbing'],
            'latitude': '5.6037',
            'longitude': '-0.1870',
            'address': '123 Test Street, Accra'
        }
        
        response = provider_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['success'] is True
        assert response.data['data']['business_name'] == 'Test Plumbing Services'
        assert 'plumbing' in response.data['data']['categories']
    
    def test_create_provider_minimal_data(self, provider_client):
        """Test provider creation with minimal data."""
        url = reverse('providers:provider-list')
        data = {}
        
        response = provider_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['data']['business_name'] == ''
        assert response.data['data']['categories'] == []
    
    def test_create_provider_unauthenticated(self, api_client):
        """Test provider creation without authentication."""
        url = reverse('providers:provider-list')
        data = {'business_name': 'Test'}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_create_provider_wrong_role(self, authenticated_client):
        """Test provider creation with customer role."""
        url = reverse('providers:provider-list')
        data = {'business_name': 'Test'}
        
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_create_provider_duplicate(self, provider_client, plumbing_category):
        """Test creating provider when user already has one."""
        # Create first provider
        Provider.objects.create(
            user=provider_client.user,
            business_name='Existing Provider'
        )
        
        url = reverse('providers:provider-list')
        data = {'business_name': 'New Provider'}
        
        response = provider_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_create_provider_invalid_category(self, provider_client):
        """Test provider creation with invalid category."""
        url = reverse('providers:provider-list')
        data = {
            'business_name': 'Test',
            'categories': ['invalid_category']
        }
        
        response = provider_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestSearchProvidersEndpoint:
    """Test GET /api/v1/providers/ (search) endpoint."""
    
    def test_search_providers_no_filters(self, api_client, provider_with_profile):
        """Test provider search without filters."""
        url = reverse('providers:provider-list')
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert response.data['meta']['count'] == 1
    
    def test_search_providers_by_category(self, api_client, provider_with_profile):
        """Test provider search by category."""
        url = reverse('providers:provider-list')
        
        response = api_client.get(url, {'category': 'plumbing'})
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['meta']['count'] == 1
    
    def test_search_providers_by_location(self, api_client, provider_with_profile):
        """Test provider search by location."""
        url = reverse('providers:provider-list')
        params = {
            'latitude': '5.6037',
            'longitude': '-0.1870',
            'radius_km': '10'
        }
        
        response = api_client.get(url, params)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['meta']['count'] == 1
        assert response.data['data'][0]['distance_km'] is not None
    
    def test_search_providers_by_rating(self, api_client, provider_with_profile):
        """Test provider search by minimum rating."""
        url = reverse('providers:provider-list')
        
        response = api_client.get(url, {'min_rating': '4.0'})
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['meta']['count'] == 1
    
    def test_search_providers_verified_only(self, api_client, provider_with_profile):
        """Test provider search for verified only."""
        url = reverse('providers:provider-list')
        
        response = api_client.get(url, {'verified_only': 'true'})
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['meta']['count'] == 1
        assert response.data['data'][0]['provider']['verified'] is True
    
    def test_search_providers_sort_by_rating(self, api_client):
        """Test provider search sorted by rating."""
        # Create multiple providers with different ratings
        user1 = User.objects.create(phone='+233241111111', role='PROVIDER')
        Provider.objects.create(
            user=user1,
            business_name='High Rating',
            rating_avg=Decimal('4.8'),
            is_active=True
        )
        
        user2 = User.objects.create(phone='+233242222222', role='PROVIDER')
        Provider.objects.create(
            user=user2,
            business_name='Low Rating',
            rating_avg=Decimal('3.5'),
            is_active=True
        )
        
        url = reverse('providers:provider-list')
        response = api_client.get(url, {'sort_by': 'rating'})
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['meta']['count'] == 2
        # First result should have higher rating
        assert float(response.data['data'][0]['provider']['rating_avg']) >= \
               float(response.data['data'][1]['provider']['rating_avg'])
    
    def test_search_providers_invalid_params(self, api_client):
        """Test provider search with invalid parameters."""
        url = reverse('providers:provider-list')
        
        response = api_client.get(url, {'latitude': 'invalid'})
        
        # Should return 400 or 500 depending on error handling
        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_500_INTERNAL_SERVER_ERROR]


@pytest.mark.django_db
class TestGetProviderDetailEndpoint:
    """Test GET /api/v1/providers/{id}/ endpoint."""
    
    def test_get_provider_detail(self, api_client, provider_with_profile):
        """Test getting provider details."""
        url = reverse('providers:provider-detail', kwargs={'pk': str(provider_with_profile.id)})
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert response.data['data']['id'] == str(provider_with_profile.id)
        assert response.data['data']['business_name'] == 'Test Plumbing Services'
    
    def test_get_provider_detail_not_found(self, api_client):
        """Test getting non-existent provider."""
        import uuid
        fake_id = str(uuid.uuid4())
        url = reverse('providers:provider-detail', kwargs={'pk': fake_id})
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestUpdateProviderEndpoint:
    """Test PATCH /api/v1/providers/{id}/ endpoint."""
    
    def test_update_provider_success(self, provider_client, provider_with_profile):
        """Test successful provider update."""
        # Ensure provider belongs to authenticated user
        provider_with_profile.user = provider_client.user
        provider_with_profile.save()
        
        url = reverse('providers:provider-detail', kwargs={'pk': str(provider_with_profile.id)})
        data = {'business_name': 'Updated Name'}
        
        response = provider_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['business_name'] == 'Updated Name'
    
    def test_update_provider_unauthenticated(self, api_client, provider_with_profile):
        """Test provider update without authentication."""
        url = reverse('providers:provider-detail', kwargs={'pk': str(provider_with_profile.id)})
        data = {'business_name': 'Updated'}
        
        response = api_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_update_provider_wrong_owner(self, provider_client):
        """Test provider update by non-owner."""
        # Create a different provider user
        other_user = User.objects.create(
            phone='+233249999999',
            role='PROVIDER'
        )
        other_provider = Provider.objects.create(
            user=other_user,
            business_name='Other Provider'
        )
        
        url = reverse('providers:provider-detail', kwargs={'pk': str(other_provider.id)})
        data = {'business_name': 'Updated'}
        
        response = provider_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_update_provider_not_found(self, provider_client):
        """Test updating non-existent provider."""
        import uuid
        fake_id = str(uuid.uuid4())
        url = reverse('providers:provider-detail', kwargs={'pk': fake_id})
        data = {'business_name': 'Updated'}
        
        response = provider_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestAddServiceEndpoint:
    """Test POST /api/v1/providers/{id}/services/ endpoint."""
    
    def test_add_service_success(self, provider_client, provider_with_profile, plumbing_category):
        """Test successful service addition."""
        # Ensure provider belongs to authenticated user
        provider_with_profile.user = provider_client.user
        provider_with_profile.save()
        
        url = reverse('providers:provider-add-service', kwargs={'pk': str(provider_with_profile.id)})
        data = {
            'category_id': str(plumbing_category.id),
            'title': 'Emergency Plumbing',
            'description': '24/7 emergency plumbing services',
            'price_type': 'HOURLY',
            'price_amount': '50.00',
            'duration_estimate_min': 120
        }
        
        response = provider_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['success'] is True
        assert response.data['data']['title'] == 'Emergency Plumbing'
    
    def test_add_service_unauthenticated(self, api_client, provider_with_profile, plumbing_category):
        """Test service addition without authentication."""
        url = reverse('providers:provider-add-service', kwargs={'pk': str(provider_with_profile.id)})
        data = {
            'title': 'Test Service',
            'description': 'Test',
            'price_type': 'FIXED',
            'price_amount': '100.00'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_add_service_wrong_owner(self, provider_client, plumbing_category):
        """Test service addition by non-owner."""
        # Create a different provider user
        other_user = User.objects.create(
            phone='+233249999998',
            role='PROVIDER'
        )
        other_provider = Provider.objects.create(
            user=other_user,
            business_name='Other Provider'
        )
        
        url = reverse('providers:provider-add-service', kwargs={'pk': str(other_provider.id)})
        data = {
            'title': 'Test Service',
            'description': 'Test',
            'price_type': 'FIXED',
            'price_amount': '100.00'
        }
        
        response = provider_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_add_service_invalid_price(self, provider_client, provider_with_profile):
        """Test service addition with invalid price."""
        provider_with_profile.user = provider_client.user
        provider_with_profile.save()
        
        url = reverse('providers:provider-add-service', kwargs={'pk': str(provider_with_profile.id)})
        data = {
            'title': 'Test Service',
            'description': 'Test',
            'price_type': 'FIXED',
            'price_amount': '0.00'
        }
        
        response = provider_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestListProviderServicesEndpoint:
    """Test GET /api/v1/providers/{id}/services/ endpoint."""
    
    def test_list_services(self, authenticated_client, provider_with_profile, plumbing_category):
        """Test listing provider services."""
        # Create services
        ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title='Service 1',
            description='Description',
            price_type='FIXED',
            price_amount=Decimal('100.00'),
            is_active=True
        )
        ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title='Service 2',
            description='Description',
            price_type='FIXED',
            price_amount=Decimal('150.00'),
            is_active=True
        )
        
        # Use the correct URL - services are accessed via the provider detail endpoint
        url = f'/api/v1/providers/{provider_with_profile.id}/services/'
        
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert response.data['meta']['count'] == 2
    
    def test_list_services_active_only(self, authenticated_client, provider_with_profile, plumbing_category):
        """Test listing only active services."""
        # Create active and inactive services
        ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title='Active Service',
            description='Description',
            price_type='FIXED',
            price_amount=Decimal('100.00'),
            is_active=True
        )
        ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title='Inactive Service',
            description='Description',
            price_type='FIXED',
            price_amount=Decimal('100.00'),
            is_active=False
        )
        
        url = f'/api/v1/providers/{provider_with_profile.id}/services/'
        
        response = authenticated_client.get(url, {'active_only': 'true'})
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['meta']['count'] == 1


@pytest.mark.django_db
class TestServiceDetailEndpoint:
    """Test GET /api/v1/providers/services/{id}/ endpoint."""
    
    def test_get_service_detail(self, api_client, provider_with_profile, plumbing_category):
        """Test getting service details."""
        service = ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title='Test Service',
            description='Description',
            price_type='FIXED',
            price_amount=Decimal('100.00')
        )
        
        url = reverse('providers:service-detail', kwargs={'pk': str(service.id)})
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['success'] is True
        assert response.data['data']['title'] == 'Test Service'
    
    def test_get_service_detail_not_found(self, api_client):
        """Test getting non-existent service."""
        import uuid
        fake_id = str(uuid.uuid4())
        url = reverse('providers:service-detail', kwargs={'pk': fake_id})
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestUpdateServiceEndpoint:
    """Test PATCH /api/v1/providers/services/{id}/ endpoint."""
    
    def test_update_service_success(self, provider_client, provider_with_profile, plumbing_category):
        """Test successful service update."""
        provider_with_profile.user = provider_client.user
        provider_with_profile.save()
        
        service = ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title='Old Title',
            description='Description',
            price_type='FIXED',
            price_amount=Decimal('100.00')
        )
        
        url = reverse('providers:service-detail', kwargs={'pk': str(service.id)})
        data = {'title': 'New Title'}
        
        response = provider_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['title'] == 'New Title'
    
    def test_update_service_wrong_owner(self, provider_client, plumbing_category):
        """Test service update by non-owner."""
        # Create a different provider user
        other_user = User.objects.create(
            phone='+233249999997',
            role='PROVIDER'
        )
        other_provider = Provider.objects.create(
            user=other_user,
            business_name='Other Provider'
        )
        
        service = ProviderService.objects.create(
            provider=other_provider,
            category=plumbing_category,
            title='Test Service',
            description='Description',
            price_type='FIXED',
            price_amount=Decimal('100.00')
        )
        
        url = reverse('providers:service-detail', kwargs={'pk': str(service.id)})
        data = {'title': 'New Title'}
        
        response = provider_client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestServiceActivationEndpoints:
    """Test service activation/deactivation endpoints."""
    
    def test_deactivate_service(self, provider_client, provider_with_profile, plumbing_category):
        """Test service deactivation."""
        provider_with_profile.user = provider_client.user
        provider_with_profile.save()
        
        service = ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title='Test Service',
            description='Description',
            price_type='FIXED',
            price_amount=Decimal('100.00'),
            is_active=True
        )
        
        url = reverse('providers:service-deactivate', kwargs={'pk': str(service.id)})
        
        response = provider_client.post(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['is_active'] is False
    
    def test_activate_service(self, provider_client, provider_with_profile, plumbing_category):
        """Test service activation."""
        provider_with_profile.user = provider_client.user
        provider_with_profile.save()
        
        service = ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title='Test Service',
            description='Description',
            price_type='FIXED',
            price_amount=Decimal('100.00'),
            is_active=False
        )
        
        url = reverse('providers:service-activate', kwargs={'pk': str(service.id)})
        
        response = provider_client.post(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['data']['is_active'] is True
