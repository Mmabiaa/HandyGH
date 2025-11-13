"""
URL configuration for HandyGH project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/

Design Decisions:
- API versioning with /api/v1/ prefix for future compatibility
- Swagger/ReDoc documentation at /api/docs/ and /api/redoc/
- Admin panel URL configurable via environment variable for security
- Separate URL includes for each app for modularity
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

# Swagger/OpenAPI Schema
schema_view = get_schema_view(
    openapi.Info(
        title="HandyGH API",
        default_version="v1",
        description="""
        HandyGH Local Services Marketplace API

        A comprehensive REST API for connecting customers with local service providers.

        ## Features
        - OTP-based authentication with JWT tokens
        - Provider search and discovery
        - Booking management with status tracking
        - Payment processing (MTN MoMo integration)
        - Reviews and ratings system
        - In-app messaging
        - Dispute resolution
        - Admin dashboard operations

        ## Authentication
        Most endpoints require authentication using JWT tokens.
        1. Request OTP: POST /api/v1/auth/otp/request/
        2. Verify OTP: POST /api/v1/auth/otp/verify/
        3. Use the returned access token in the Authorization header: `Bearer {token}`
        """,
        terms_of_service="https://handygh.com/terms/",
        contact=openapi.Contact(email="support@handygh.com"),
        license=openapi.License(name="Proprietary"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

# API URL patterns
api_v1_patterns = [
    path("auth/", include("apps.authentication.urls")),
    path("users/", include("apps.users.urls")),
    path("providers/", include("apps.providers.urls")),
    path("bookings/", include("apps.bookings.urls")),
    path("payments/", include("apps.payments.urls")),
    path("reviews/", include("apps.reviews.urls")),
    path("", include("apps.messaging.urls")),  # Messaging URLs are nested under bookings
    path("", include("apps.disputes.urls")),  # Disputes URLs
    path("admin/", include("apps.admin_dashboard.urls")),
]

urlpatterns = [
    # Admin panel
    path(settings.ADMIN_URL if hasattr(settings, "ADMIN_URL") else "admin/", admin.site.urls),
    # API Documentation
    path("api/docs/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    path("api/redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    path("api/schema/", schema_view.without_ui(cache_timeout=0), name="schema-json"),
    # API v1
    path("api/v1/", include(api_v1_patterns)),
    # Health check endpoint
    path("health/", include("core.urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
