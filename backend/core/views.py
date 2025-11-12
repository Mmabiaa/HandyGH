"""
Core views for HandyGH.

Includes health check endpoint for monitoring and load balancers.
"""

from django.http import JsonResponse
from django.db import connection
from django.utils import timezone


def health_check(request):
    """
    Health check endpoint for monitoring.
    
    Checks:
    - API is responding
    - Database connection is working
    - Current timestamp
    
    Returns:
        JSON response with health status
        
    Example response:
    {
        "status": "healthy",
        "timestamp": "2025-01-15T10:30:00Z",
        "database": "connected",
        "version": "1.0.0"
    }
    """
    # Check database connection
    try:
        connection.ensure_connection()
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    
    return JsonResponse({
        'status': 'healthy' if db_status == 'connected' else 'unhealthy',
        'timestamp': timezone.now().isoformat(),
        'database': db_status,
        'version': '1.0.0'
    })
