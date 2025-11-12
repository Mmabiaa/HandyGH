"""
API views for messaging app.

Design Decisions:
- RESTful API design with proper HTTP methods
- Permission-based access control (booking participants only)
- Pagination for message lists
- Comprehensive error handling

SOLID Principles:
- Single Responsibility: Each view handles specific endpoint
- Dependency Inversion: Views depend on service abstractions
"""

import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError, PermissionDenied
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import Message
from .serializers import (
    MessageSerializer,
    CreateMessageSerializer,
    MessageListSerializer
)
from .services import MessagingService

logger = logging.getLogger(__name__)


class BookingMessagesView(APIView):
    """
    Send and retrieve messages for a booking.
    
    GET /api/v1/bookings/{booking_id}/messages/ - Get messages
    POST /api/v1/bookings/{booking_id}/messages/ - Send message
    """
    
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_description="Get messages for a booking",
        manual_parameters=[
            openapi.Parameter(
                'limit',
                openapi.IN_QUERY,
                description="Number of messages to return",
                type=openapi.TYPE_INTEGER,
                required=False
            ),
            openapi.Parameter(
                'offset',
                openapi.IN_QUERY,
                description="Number of messages to skip",
                type=openapi.TYPE_INTEGER,
                required=False
            ),
        ],
        responses={
            200: MessageListSerializer(many=True),
            400: 'Bad Request - Invalid parameters',
            403: 'Forbidden - Not a booking participant',
            404: 'Not Found - Booking not found',
        },
        tags=['Messaging']
    )
    def get(self, request, booking_id):
        """Get messages for a booking."""
        try:
            # Get pagination parameters
            limit = request.query_params.get('limit')
            offset = request.query_params.get('offset')
            
            # Convert to integers if provided
            if limit is not None:
                try:
                    limit = int(limit)
                    if limit < 1:
                        raise ValueError
                except (ValueError, TypeError):
                    return Response(
                        {
                            'success': False,
                            'errors': {'limit': 'Must be a positive integer'},
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            if offset is not None:
                try:
                    offset = int(offset)
                    if offset < 0:
                        raise ValueError
                except (ValueError, TypeError):
                    return Response(
                        {
                            'success': False,
                            'errors': {'offset': 'Must be a non-negative integer'},
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Get messages
            messages = MessagingService.get_booking_messages(
                booking_id=booking_id,
                user=request.user,
                limit=limit,
                offset=offset
            )
            
            serializer = MessageListSerializer(messages, many=True)
            
            return Response(
                {
                    'success': True,
                    'data': serializer.data,
                    'meta': {
                        'count': len(serializer.data),
                        'limit': limit,
                        'offset': offset or 0,
                    }
                },
                status=status.HTTP_200_OK
            )
            
        except ValidationError as e:
            return Response(
                {
                    'success': False,
                    'errors': {'detail': str(e)},
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionDenied as e:
            return Response(
                {
                    'success': False,
                    'errors': {'detail': str(e)},
                },
                status=status.HTTP_403_FORBIDDEN
            )
        except Exception as e:
            logger.error(f"Error retrieving messages: {str(e)}", exc_info=True)
            return Response(
                {
                    'success': False,
                    'errors': {'detail': 'Failed to retrieve messages'},
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @swagger_auto_schema(
        operation_description="Send a message in a booking conversation",
        request_body=CreateMessageSerializer,
        responses={
            201: MessageSerializer,
            400: 'Bad Request - Validation error',
            403: 'Forbidden - Not a booking participant',
            404: 'Not Found - Booking not found',
        },
        tags=['Messaging']
    )
    def post(self, request, booking_id):
        """Send a message in a booking conversation."""
        serializer = CreateMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            message = MessagingService.send_message(
                booking_id=booking_id,
                sender=request.user,
                content=serializer.validated_data['content'],
                attachments=serializer.validated_data.get('attachments', [])
            )
            
            response_serializer = MessageSerializer(message)
            
            return Response(
                {
                    'success': True,
                    'data': response_serializer.data,
                    'message': 'Message sent successfully'
                },
                status=status.HTTP_201_CREATED
            )
            
        except ValidationError as e:
            return Response(
                {
                    'success': False,
                    'errors': {'detail': str(e)},
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionDenied as e:
            return Response(
                {
                    'success': False,
                    'errors': {'detail': str(e)},
                },
                status=status.HTTP_403_FORBIDDEN
            )
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}", exc_info=True)
            return Response(
                {
                    'success': False,
                    'errors': {'detail': 'Failed to send message'},
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
