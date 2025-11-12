"""
Test script for provider API endpoints.

This script tests the provider API endpoints to ensure they are working correctly.
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'handygh.settings.development')
django.setup()

from django.test import Client
from apps.users.models import User
from apps.providers.models import Provider, ServiceCategory
from apps.authentication.services import JWTService
import json


def test_provider_endpoints():
    """Test provider API endpoints."""
    
    print("=" * 80)
    print("Testing Provider API Endpoints")
    print("=" * 80)
    
    client = Client()
    
    # Create test users
    print("\n1. Creating test users...")
    try:
        # Create provider user
        provider_user = User.objects.create_user(
            phone='+233501234567',
            name='Test Provider',
            role='PROVIDER'
        )
        print(f"   ✓ Created provider user: {provider_user.phone}")
        
        # Create customer user
        customer_user = User.objects.create_user(
            phone='+233501234568',
            name='Test Customer',
            role='CUSTOMER'
        )
        print(f"   ✓ Created customer user: {customer_user.phone}")
        
    except Exception as e:
        print(f"   ✗ Error creating users: {e}")
        return
    
    # Generate JWT tokens
    print("\n2. Generating JWT tokens...")
    try:
        provider_tokens = JWTService.create_tokens(provider_user)
        provider_token = provider_tokens['access_token']
        print(f"   ✓ Generated provider token")
        
        customer_tokens = JWTService.create_tokens(customer_user)
        customer_token = customer_tokens['access_token']
        print(f"   ✓ Generated customer token")
        
    except Exception as e:
        print(f"   ✗ Error generating tokens: {e}")
        return
    
    # Create service category
    print("\n3. Creating service category...")
    try:
        category = ServiceCategory.objects.create(
            name='Plumbing',
            slug='plumbing',
            description='Plumbing services',
            is_active=True
        )
        print(f"   ✓ Created category: {category.name}")
    except Exception as e:
        print(f"   ✗ Error creating category: {e}")
        return
    
    # Test: List categories (public endpoint)
    print("\n4. Testing GET /api/v1/providers/categories/")
    response = client.get('/api/v1/providers/categories/')
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Success: Found {len(data.get('data', []))} categories")
    else:
        print(f"   ✗ Failed: {response.content}")
    
    # Test: Create provider profile
    print("\n5. Testing POST /api/v1/providers/")
    provider_data = {
        'business_name': 'Test Plumbing Services',
        'categories': ['plumbing'],
        'latitude': '5.6037',
        'longitude': '-0.1870',
        'address': '123 Test Street, Accra'
    }
    response = client.post(
        '/api/v1/providers/',
        data=json.dumps(provider_data),
        content_type='application/json',
        HTTP_AUTHORIZATION=f'Bearer {provider_token}'
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        provider_id = data['data']['id']
        print(f"   ✓ Success: Created provider with ID {provider_id}")
    else:
        print(f"   ✗ Failed: {response.content}")
        return
    
    # Test: Get provider details
    print(f"\n6. Testing GET /api/v1/providers/{provider_id}/")
    response = client.get(f'/api/v1/providers/{provider_id}/')
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Success: Retrieved provider {data['data']['display_name']}")
    else:
        print(f"   ✗ Failed: {response.content}")
    
    # Test: Add service to provider
    print(f"\n7. Testing POST /api/v1/providers/{provider_id}/services/")
    service_data = {
        'category_id': str(category.id),
        'title': 'Emergency Plumbing Repair',
        'description': 'Fast emergency plumbing repairs',
        'price_type': 'HOURLY',
        'price_amount': '50.00',
        'duration_estimate_min': 120
    }
    response = client.post(
        f'/api/v1/providers/{provider_id}/services/',
        data=json.dumps(service_data),
        content_type='application/json',
        HTTP_AUTHORIZATION=f'Bearer {provider_token}'
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        service_id = data['data']['id']
        print(f"   ✓ Success: Created service with ID {service_id}")
    else:
        print(f"   ✗ Failed: {response.content}")
        return
    
    # Test: List provider services
    print(f"\n8. Testing GET /api/v1/providers/{provider_id}/services/")
    response = client.get(f'/api/v1/providers/{provider_id}/services/')
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Success: Found {data['meta']['count']} services")
    else:
        print(f"   ✗ Failed: {response.content}")
    
    # Test: Search providers (public endpoint)
    print("\n9. Testing GET /api/v1/providers/ (search)")
    response = client.get('/api/v1/providers/?category=plumbing')
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Success: Found {data['meta']['count']} providers")
    else:
        print(f"   ✗ Failed: {response.content}")
    
    # Test: Search with location
    print("\n10. Testing GET /api/v1/providers/ (with location)")
    response = client.get(
        '/api/v1/providers/?latitude=5.6037&longitude=-0.1870&radius_km=10'
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Success: Found {data['meta']['count']} providers within 10km")
        if data['data']:
            first_result = data['data'][0]
            if first_result['distance_km'] is not None:
                print(f"   Distance to first provider: {first_result['distance_km']:.2f} km")
    else:
        print(f"   ✗ Failed: {response.content}")
    
    # Test: Update provider
    print(f"\n11. Testing PATCH /api/v1/providers/{provider_id}/")
    update_data = {
        'business_name': 'Updated Plumbing Services'
    }
    response = client.patch(
        f'/api/v1/providers/{provider_id}/',
        data=json.dumps(update_data),
        content_type='application/json',
        HTTP_AUTHORIZATION=f'Bearer {provider_token}'
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Success: Updated provider name to {data['data']['business_name']}")
    else:
        print(f"   ✗ Failed: {response.content}")
    
    # Test: Get service details
    print(f"\n12. Testing GET /api/v1/providers/services/{service_id}/")
    response = client.get(f'/api/v1/providers/services/{service_id}/')
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Success: Retrieved service {data['data']['title']}")
    else:
        print(f"   ✗ Failed: {response.content}")
    
    # Test: Update service
    print(f"\n13. Testing PATCH /api/v1/providers/services/{service_id}/")
    service_update = {
        'price_amount': '60.00'
    }
    response = client.patch(
        f'/api/v1/providers/services/{service_id}/',
        data=json.dumps(service_update),
        content_type='application/json',
        HTTP_AUTHORIZATION=f'Bearer {provider_token}'
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Success: Updated service price to {data['data']['price_amount']}")
    else:
        print(f"   ✗ Failed: {response.content}")
    
    # Test: Deactivate service
    print(f"\n14. Testing POST /api/v1/providers/services/{service_id}/deactivate/")
    response = client.post(
        f'/api/v1/providers/services/{service_id}/deactivate/',
        HTTP_AUTHORIZATION=f'Bearer {provider_token}'
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Success: Service is_active = {data['data']['is_active']}")
    else:
        print(f"   ✗ Failed: {response.content}")
    
    # Test: Activate service
    print(f"\n15. Testing POST /api/v1/providers/services/{service_id}/activate/")
    response = client.post(
        f'/api/v1/providers/services/{service_id}/activate/',
        HTTP_AUTHORIZATION=f'Bearer {provider_token}'
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Success: Service is_active = {data['data']['is_active']}")
    else:
        print(f"   ✗ Failed: {response.content}")
    
    # Cleanup
    print("\n16. Cleaning up test data...")
    try:
        provider_user.delete()
        customer_user.delete()
        category.delete()
        print("   ✓ Cleanup complete")
    except Exception as e:
        print(f"   ✗ Error during cleanup: {e}")
    
    print("\n" + "=" * 80)
    print("Provider API Tests Complete!")
    print("=" * 80)


if __name__ == '__main__':
    test_provider_endpoints()
