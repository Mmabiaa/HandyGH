"""
Custom exception classes and exception handler for HandyGH.

Design Decisions:
- Centralized exception handling for consistent API responses
- Custom exception classes for domain-specific errors
- Standardized error response format
- Proper HTTP status codes for different error types

SOLID Principles Applied:
- Single Responsibility: Each exception class handles one type of error
- Open/Closed: Easy to extend with new exception types
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import uuid


class HandyGHException(Exception):
    """
    Base exception class for all HandyGH custom exceptions.
    
    Attributes:
        message: Human-readable error message
        status_code: HTTP status code for the error
        error_code: Application-specific error code
    """
    default_message = "An error occurred"
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code = "INTERNAL_ERROR"
    
    def __init__(self, message=None, status_code=None, error_code=None):
        self.message = message or self.default_message
        if status_code:
            self.status_code = status_code
        if error_code:
            self.error_code = error_code
        super().__init__(self.message)


class ValidationError(HandyGHException):
    """Raised when input validation fails."""
    default_message = "Validation error"
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "VALIDATION_ERROR"


class AuthenticationError(HandyGHException):
    """Raised when authentication fails."""
    default_message = "Authentication failed"
    status_code = status.HTTP_401_UNAUTHORIZED
    error_code = "AUTHENTICATION_ERROR"


class PermissionDeniedError(HandyGHException):
    """Raised when user lacks required permissions."""
    default_message = "Permission denied"
    status_code = status.HTTP_403_FORBIDDEN
    error_code = "PERMISSION_DENIED"


class NotFoundError(HandyGHException):
    """Raised when a requested resource is not found."""
    default_message = "Resource not found"
    status_code = status.HTTP_404_NOT_FOUND
    error_code = "NOT_FOUND"


class ConflictError(HandyGHException):
    """Raised when there's a conflict with existing data."""
    default_message = "Resource conflict"
    status_code = status.HTTP_409_CONFLICT
    error_code = "CONFLICT"


class RateLimitError(HandyGHException):
    """Raised when rate limit is exceeded."""
    default_message = "Rate limit exceeded"
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    error_code = "RATE_LIMIT_EXCEEDED"


class ServiceUnavailableError(HandyGHException):
    """Raised when a service is temporarily unavailable."""
    default_message = "Service temporarily unavailable"
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    error_code = "SERVICE_UNAVAILABLE"


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF.
    
    Provides consistent error response format:
    {
        "success": false,
        "errors": {
            "message": "Error message",
            "code": "ERROR_CODE",
            "details": {...}
        },
        "meta": {
            "timestamp": "2025-01-15T10:30:00Z",
            "request_id": "uuid"
        }
    }
    
    Args:
        exc: The exception instance
        context: Context dictionary with request and view information
        
    Returns:
        Response object with standardized error format
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Generate request ID for tracking
    request_id = str(uuid.uuid4())
    
    # Handle custom HandyGH exceptions
    if isinstance(exc, HandyGHException):
        error_response = {
            'success': False,
            'errors': {
                'message': exc.message,
                'code': exc.error_code,
            },
            'meta': {
                'timestamp': timezone.now().isoformat(),
                'request_id': request_id,
            }
        }
        return Response(error_response, status=exc.status_code)
    
    # Handle DRF exceptions
    if response is not None:
        error_response = {
            'success': False,
            'errors': response.data,
            'meta': {
                'timestamp': timezone.now().isoformat(),
                'request_id': request_id,
            }
        }
        response.data = error_response
        return response
    
    # Handle unexpected exceptions
    error_response = {
        'success': False,
        'errors': {
            'message': 'An unexpected error occurred',
            'code': 'INTERNAL_ERROR',
        },
        'meta': {
            'timestamp': timezone.now().isoformat(),
            'request_id': request_id,
        }
    }
    return Response(error_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
