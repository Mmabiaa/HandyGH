"""
Unit tests for ProviderSearchService.

Tests cover:
- Distance calculation using Haversine formula
- Provider search with various filters
- Sorting by rating, distance, and price
- Query optimization
"""

import pytest
from decimal import Decimal
from apps.providers.services import ProviderSearchService
from apps.providers.models import Provider, ProviderService, ServiceCategory
from apps.users.models import User
from core.exceptions import ValidationError as CustomValidationError


@pytest.fixture
def service_category(db):
    """Create a test service category."""
    return ServiceCategory.objects.create(
        name='Plumbing',
        slug='plumbing',
        description='Plumbing services',
        is_active=True
    )


@pytest.fixture
def provider_with_location(db, provider_user, service_category):
    """Create a provider with location in Accra."""
    provider = Provider.objects.create(
        user=provider_user,
        business_name='Test Plumbing Services',
        categories=['plumbing'],
        latitude=Decimal('5.6037'),
        longitude=Decimal('-0.1870'),
        address='Accra, Ghana',
        verified=True,
        rating_avg=Decimal('4.5'),
        rating_count=10,
        is_active=True
    )
    
    # Add a service
    ProviderService.objects.create(
        provider=provider,
        category=service_category,
        title='Emergency Plumbing',
        description='24/7 emergency plumbing services',
        price_type='FIXED',
        price_amount=Decimal('150.00'),
        is_active=True
    )
    
    return provider


@pytest.fixture
def multiple_providers(db, service_category):
    """Create multiple providers with different locations and ratings."""
    providers = []
    
    # Provider 1: Close, high rating, medium price
    user1 = User.objects.create(
        phone='+233241111111',
        email='provider1@example.com',
        name='Provider One',
        role='PROVIDER'
    )
    provider1 = Provider.objects.create(
        user=user1,
        business_name='Best Plumbing',
        categories=['plumbing'],
        latitude=Decimal('5.6037'),
        longitude=Decimal('-0.1870'),
        address='Accra Central',
        verified=True,
        rating_avg=Decimal('4.8'),
        rating_count=50,
        is_active=True
    )
    ProviderService.objects.create(
        provider=provider1,
        category=service_category,
        title='Standard Plumbing',
        description='Standard plumbing services',
        price_type='FIXED',
        price_amount=Decimal('100.00'),
        is_active=True
    )
    providers.append(provider1)
    
    # Provider 2: Far, medium rating, low price
    user2 = User.objects.create(
        phone='+233242222222',
        email='provider2@example.com',
        name='Provider Two',
        role='PROVIDER'
    )
    provider2 = Provider.objects.create(
        user=user2,
        business_name='Budget Plumbing',
        categories=['plumbing'],
        latitude=Decimal('5.6500'),
        longitude=Decimal('-0.2500'),
        address='Accra West',
        verified=False,
        rating_avg=Decimal('3.5'),
        rating_count=20,
        is_active=True
    )
    ProviderService.objects.create(
        provider=provider2,
        category=service_category,
        title='Budget Plumbing',
        description='Affordable plumbing services',
        price_type='FIXED',
        price_amount=Decimal('50.00'),
        is_active=True
    )
    providers.append(provider2)
    
    # Provider 3: Medium distance, low rating, high price
    user3 = User.objects.create(
        phone='+233243333333',
        email='provider3@example.com',
        name='Provider Three',
        role='PROVIDER'
    )
    provider3 = Provider.objects.create(
        user=user3,
        business_name='Premium Plumbing',
        categories=['plumbing'],
        latitude=Decimal('5.6200'),
        longitude=Decimal('-0.2000'),
        address='Accra East',
        verified=True,
        rating_avg=Decimal('3.0'),
        rating_count=5,
        is_active=True
    )
    ProviderService.objects.create(
        provider=provider3,
        category=service_category,
        title='Premium Plumbing',
        description='Premium plumbing services',
        price_type='FIXED',
        price_amount=Decimal('200.00'),
        is_active=True
    )
    providers.append(provider3)
    
    return providers


class TestDistanceCalculation:
    """Test Haversine distance calculation."""
    
    def test_calculate_distance_same_point(self):
        """Test distance between same point is zero."""
        lat = Decimal('5.6037')
        lon = Decimal('-0.1870')
        
        distance = ProviderSearchService.calculate_distance(lat, lon, lat, lon)
        
        assert distance < 0.01  # Should be very close to 0
    
    def test_calculate_distance_known_points(self):
        """Test distance calculation between known points."""
        # Accra to nearby location (approximately 5-6 km)
        lat1 = Decimal('5.6037')
        lon1 = Decimal('-0.1870')
        lat2 = Decimal('5.6500')
        lon2 = Decimal('-0.2000')
        
        distance = ProviderSearchService.calculate_distance(lat1, lon1, lat2, lon2)
        
        # Distance should be approximately 5-6 km
        assert 5.0 <= distance <= 7.0
    
    def test_calculate_distance_symmetry(self):
        """Test that distance calculation is symmetric."""
        lat1 = Decimal('5.6037')
        lon1 = Decimal('-0.1870')
        lat2 = Decimal('5.6500')
        lon2 = Decimal('-0.2000')
        
        distance1 = ProviderSearchService.calculate_distance(lat1, lon1, lat2, lon2)
        distance2 = ProviderSearchService.calculate_distance(lat2, lon2, lat1, lon1)
        
        assert abs(distance1 - distance2) < 0.01


class TestProviderSearch:
    """Test provider search functionality."""
    
    def test_search_without_filters(self, multiple_providers):
        """Test basic search without filters."""
        results = ProviderSearchService.search()
        
        assert len(results) == 3
        # Default sort is by rating
        assert results[0]['provider'].rating_avg >= results[1]['provider'].rating_avg
    
    def test_search_by_category(self, multiple_providers, service_category):
        """Test search filtered by category."""
        results = ProviderSearchService.search(category='plumbing')
        
        assert len(results) == 3
        for result in results:
            assert 'plumbing' in result['provider'].categories
    
    def test_search_by_location_and_radius(self, multiple_providers):
        """Test search with location and radius filter."""
        # Search from Accra Central with 3km radius
        results = ProviderSearchService.search(
            latitude=Decimal('5.6037'),
            longitude=Decimal('-0.1870'),
            radius_km=3.0
        )
        
        # Should only return providers within 3km
        for result in results:
            assert result['distance_km'] is not None
            assert result['distance_km'] <= 3.0
    
    def test_search_by_min_rating(self, multiple_providers):
        """Test search filtered by minimum rating."""
        results = ProviderSearchService.search(min_rating=4.0)
        
        assert len(results) == 1
        assert float(results[0]['provider'].rating_avg) >= 4.0
    
    def test_search_verified_only(self, multiple_providers):
        """Test search for verified providers only."""
        results = ProviderSearchService.search(verified_only=True)
        
        assert len(results) == 2
        for result in results:
            assert result['provider'].verified is True
    
    def test_search_with_price_range(self, multiple_providers):
        """Test search with price filters."""
        results = ProviderSearchService.search(
            min_price=Decimal('75.00'),
            max_price=Decimal('150.00')
        )
        
        for result in results:
            if result['min_price'] is not None:
                assert Decimal('75.00') <= result['min_price'] <= Decimal('150.00')


class TestProviderSearchSorting:
    """Test provider search sorting functionality."""
    
    def test_sort_by_rating(self, multiple_providers):
        """Test sorting by rating (default)."""
        results = ProviderSearchService.search(sort_by='rating')
        
        # Should be sorted by rating descending
        for i in range(len(results) - 1):
            assert results[i]['provider'].rating_avg >= results[i + 1]['provider'].rating_avg
    
    def test_sort_by_distance(self, multiple_providers):
        """Test sorting by distance."""
        results = ProviderSearchService.search(
            latitude=Decimal('5.6037'),
            longitude=Decimal('-0.1870'),
            radius_km=10.0,
            sort_by='distance'
        )
        
        # Should be sorted by distance ascending
        for i in range(len(results) - 1):
            if results[i]['distance_km'] and results[i + 1]['distance_km']:
                assert results[i]['distance_km'] <= results[i + 1]['distance_km']
    
    def test_sort_by_price(self, multiple_providers):
        """Test sorting by price."""
        results = ProviderSearchService.search(sort_by='price')
        
        # Should be sorted by price ascending
        for i in range(len(results) - 1):
            if results[i]['min_price'] and results[i + 1]['min_price']:
                assert results[i]['min_price'] <= results[i + 1]['min_price']
    
    def test_invalid_sort_by(self, multiple_providers):
        """Test that invalid sort_by raises error."""
        with pytest.raises(CustomValidationError) as exc_info:
            ProviderSearchService.search(sort_by='invalid')
        
        assert 'Invalid sort_by value' in str(exc_info.value)


class TestProviderSearchResults:
    """Test provider search result structure."""
    
    def test_result_structure(self, provider_with_location):
        """Test that search results have correct structure."""
        results = ProviderSearchService.search(
            latitude=Decimal('5.6037'),
            longitude=Decimal('-0.1870')
        )
        
        assert len(results) > 0
        result = results[0]
        
        # Check result structure
        assert 'provider' in result
        assert 'distance_km' in result
        assert 'min_price' in result
        assert 'services' in result
        assert 'service_count' in result
        
        # Check types
        assert isinstance(result['provider'], Provider)
        assert isinstance(result['distance_km'], (float, type(None)))
        assert isinstance(result['min_price'], (Decimal, type(None)))
        assert isinstance(result['services'], list)
        assert isinstance(result['service_count'], int)
    
    def test_result_includes_services(self, provider_with_location):
        """Test that results include provider services."""
        results = ProviderSearchService.search()
        
        assert len(results) > 0
        result = results[0]
        
        assert result['service_count'] > 0
        assert len(result['services']) > 0
        assert all(s.is_active for s in result['services'])
    
    def test_result_calculates_min_price(self, provider_with_location):
        """Test that minimum price is calculated correctly."""
        results = ProviderSearchService.search()
        
        assert len(results) > 0
        result = results[0]
        
        if result['services']:
            expected_min = min(s.price_amount for s in result['services'])
            assert result['min_price'] == expected_min


class TestProviderSearchOptimization:
    """Test query optimization with select_related and prefetch_related."""
    
    def test_search_uses_select_related(self, multiple_providers, django_assert_num_queries):
        """Test that search uses select_related to optimize queries."""
        # The search should use select_related('user') and prefetch_related('services')
        # This should result in a minimal number of queries
        with django_assert_num_queries(3):  # 1 for providers, 1 for users, 1 for services
            results = ProviderSearchService.search()
            
            # Access related objects to trigger queries if not optimized
            for result in results:
                _ = result['provider'].user.name
                _ = list(result['services'])


class TestProviderSearchEdgeCases:
    """Test edge cases in provider search."""
    
    def test_search_with_no_providers(self, db):
        """Test search when no providers exist."""
        results = ProviderSearchService.search()
        
        assert len(results) == 0
    
    def test_search_with_inactive_providers(self, multiple_providers):
        """Test that inactive providers are excluded by default."""
        # Deactivate all providers
        Provider.objects.all().update(is_active=False)
        
        results = ProviderSearchService.search(active_only=True)
        
        assert len(results) == 0
    
    def test_search_includes_inactive_when_specified(self, multiple_providers):
        """Test that inactive providers are included when active_only=False."""
        # Deactivate one provider
        provider = Provider.objects.first()
        provider.is_active = False
        provider.save()
        
        results_active_only = ProviderSearchService.search(active_only=True)
        results_all = ProviderSearchService.search(active_only=False)
        
        assert len(results_all) > len(results_active_only)
    
    def test_search_with_providers_without_location(self, provider_user, service_category):
        """Test search with providers that don't have location data."""
        # Create provider without location
        provider = Provider.objects.create(
            user=provider_user,
            business_name='No Location Plumbing',
            categories=['plumbing'],
            latitude=None,
            longitude=None,
            is_active=True
        )
        
        # Search with location should not include this provider
        results = ProviderSearchService.search(
            latitude=Decimal('5.6037'),
            longitude=Decimal('-0.1870'),
            radius_km=10.0
        )
        
        provider_ids = [r['provider'].id for r in results]
        assert provider.id not in provider_ids
    
    def test_search_with_providers_without_services(self, provider_user):
        """Test search with providers that have no services."""
        # Create provider without services
        provider = Provider.objects.create(
            user=provider_user,
            business_name='No Services Plumbing',
            categories=['plumbing'],
            is_active=True
        )
        
        results = ProviderSearchService.search()
        
        # Provider should be in results but with no services
        provider_result = next((r for r in results if r['provider'].id == provider.id), None)
        if provider_result:
            assert provider_result['service_count'] == 0
            assert provider_result['min_price'] is None
