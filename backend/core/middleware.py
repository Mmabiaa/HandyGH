"""
Custom middleware for HandyGH.

Design Decisions:
- Request logging for audit trail and debugging
- Request ID generation for request tracking
- Performance monitoring
"""

import logging
import time
import uuid

from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger("apps")


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log all incoming requests and their responses.

    Logs include:
    - Request ID (generated UUID)
    - HTTP method and path
    - User information (if authenticated)
    - Response status code
    - Request processing time

    This is crucial for:
    - Debugging issues
    - Audit trail
    - Performance monitoring
    - Security monitoring
    """

    def process_request(self, request):
        """
        Process incoming request.

        Generates a unique request ID and records start time.
        """
        request.request_id = str(uuid.uuid4())
        request.start_time = time.time()

        # Log request details
        user_info = "Anonymous"
        if hasattr(request, "user") and request.user.is_authenticated:
            user_info = f"{request.user.id} ({request.user.role})"

        logger.info(
            f"Request started | ID: {request.request_id} | "
            f"Method: {request.method} | Path: {request.path} | "
            f"User: {user_info}"
        )

    def process_response(self, request, response):
        """
        Process outgoing response.

        Logs response details and processing time.
        """
        if hasattr(request, "start_time"):
            duration = time.time() - request.start_time

            logger.info(
                f"Request completed | ID: {getattr(request, 'request_id', 'N/A')} | "
                f"Status: {response.status_code} | "
                f"Duration: {duration:.3f}s"
            )

        # Add request ID to response headers for client-side tracking
        if hasattr(request, "request_id"):
            response["X-Request-ID"] = request.request_id

        return response

    def process_exception(self, request, exception):
        """
        Process exceptions that occur during request handling.

        Logs exception details for debugging.
        """
        logger.error(
            f"Request failed | ID: {getattr(request, 'request_id', 'N/A')} | "
            f"Exception: {type(exception).__name__} | "
            f"Message: {str(exception)}",
            exc_info=True,
        )
