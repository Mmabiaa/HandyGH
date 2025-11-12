"""
API tests for booking endpoints.

Tests all booking API endpoints with various scenarios.
"""

import pytest
from datetime import timedelta
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.bookings.models import Booking


@pytest.mark.django_db
class TestBookingEndpoints:
    """Test suite for booking API endpoints."""
    
    def test_create_booking_success(
        self, api_client, customer_token, customer, provider_service
    ):
        """Test successful booking creation."""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        scheduled_start = timezone.now() + timedelta(days=1)
        
        data = {
            'provider_service_id': str(provider_service.id),
            'scheduled_start': scheduled_start.isoformat(),
            'duration_hours': 2.0,
            'address': '123 Test Street, Accra',
            'notes': 'Please call before arriving'
        }
        
        response = api_client.post('/api/v1/bookings/bookings/', data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'booking_ref' in response.data
        assert response.data['status'] == 'REQUESTED'
        assert response.data['payment_status'] == 'PENDING'
    
    def test_create_booking_provider_cannot_book(
        self, api_client, provider_token, provider_service
    ):
        """Test that providers cannot create bookings."""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {provider_token}')
        
        scheduled_start = timezone.now() + timedelta(days=1)
        
        data = {
            'provider_service_id': str(provider_service.id),
            'scheduled_start': scheduled_start.isoformat(),
            'duration_hours': 2.0,
            'address': '123 Test Street, Accra'
        }
        
        response = api_client.post('/api/v1/bookings/bookings/', data, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_create_booking_unauthenticated_fails(self, api_client, provider_service):
        """Test that unauthenticated users cannot create bookings."""
        scheduled_start = timezone.now() + timedelta(days=1)
        
        data = {
            'provider_service_id': str(provider_service.id),
            'scheduled_start': scheduled_start.isoformat(),
            'duration_hours': 2.0,
            'address': '123 Test Street, Accra'
        }
        
        response = api_client.post('/api/v1/bookings/bookings/', data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_list_bookings_customer(
        self, api_client, customer_token, booking
    ):
        """Test listing bookings as customer."""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        response = api_client.get('/api/v1/bookings/bookings/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1
    
    def test_list_bookings_provider(
        self, api_client, provider_token, booking
    ):
        """Test listing bookings as provider."""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {provider_token}')
        
        response = api_client.get('/api/v1/bookings/bookings/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1
    
    def test_list_bookings_filter_by_status(
        self, api_client, customer_token, booking
    ):
        """Test filtering bookings by status."""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        response = api_client.get('/api/v1/bookings/bookings/?status=REQUESTED')
        
        assert response.status_code == status.HTTP_200_OK
        for result in response.data['results']:
            assert result['status'] == 'REQUESTED'
    
    def test_retrieve_booking(
        self, api_client, customer_token, booking
    ):
        """Test retrieving booking details."""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        response = api_client.get(f'/api/v1/bookings/bookings/{booking.id}/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == str(booking.id)
        assert 'customer' in response.data
        assert 'provider' in response.data
    
    def test_accept_booking_success(
        self, api_client, provider_token, booking
    ):
        """Test provider accepting a booking."""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {provider_token}')
        
        booking.status = 'REQUESTED'
        booking.save()
        
        response = api_client.patch(f'/api/v1/bookings/bookings/{booking.id}/accept/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'CONFIRMED'
    
    def test_accept_booking_customer_cannot(
        self, api_client, customer_token, booking
    ):
        """Test that customers cannot accept bookings."""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        booking.status = 'REQUESTED'
        booking.save()
        
        response = api_client.patch(f'/api/v1/bookings/bookings/{booking.id}/accept/')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_decline_booking_success(
        self, api_client, provider_token, booking
    ):
        """Test provider declining a booking."""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {provider_token}')
        
        booking.status = 'REQUESTED'
        booking.save()
        
        data = {'reason': 'Not available at that time'}
        response = api_client.patch(
            f'/api/v1/bookings/bookings/{booking.id}/decline/',
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'CANCELLED'
    
    def test_update_status_to_in_progress(
        self, api_client, provider_token, booking
    ):
        """Test updating booking status to IN_PROGRESS."""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {provider_token}')
        
        booking.status = 'CONFIRMED'
        booking.save()
        
        data = {
            'status': 'IN_PROGRESS',
            'reason': 'Service started'
        }
        response = api_client.patch(
            f'/api/v1/bookings/bookings/{booking.id}/status/',
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'IN_PROGRESS'
    
    def test_update_status_to_completed(
        self, api_client, provider_token, booking
    ):
        """Test updating booking status to COMPLETED."""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {provider_token}')
        
        booking.status = 'IN_PROGRESS'
        booking.save()
        
        data = {
            'status': 'COMPLETED',
            'reason': 'Service completed successfully'
        }
        response = api_client.patch(
            f'/api/v1/bookings/bookings/{booking.id}/status/',
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'COMPLETED'
    
    def test_update_status_invalid_transition(
        self, api_client, provider_token, booking
    ):
        """Test that invalid status transitions are rejected."""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {provider_token}')
        
        booking.status = 'REQUESTED'
        booking.save()
        
        data = {
            'status': 'COMPLETED',
            'reason': 'Invalid transition'
        }
        response = api_client.patch(
            f'/api/v1/bookings/bookings/{booking.id}/status/',
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_cancel_booking_by_customer(
        self, api_client, customer_token, booking
    ):
        """Test customer cancelling their booking."""
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
        
        booking.status = 'REQUESTED'
        booking.save()
        
        data = {
            'status': 'CANCELLED',
            'reason': 'Changed my mind'
        }
        response = api_client.patch(
            f'/api/v1/bookings/bookings/{booking.id}/status/',
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'CANCELLED'
