"""
URL configuration for authentication app.
"""

from django.conf import settings
from django.urls import path

from . import views

app_name = "authentication"

urlpatterns = [
    # OTP Authentication
    path("otp/request/", views.OTPRequestView.as_view(), name="otp-request"),
    path("otp/verify/", views.OTPVerifyView.as_view(), name="otp-verify"),
    # Token Management
    path("token/refresh/", views.TokenRefreshView.as_view(), name="token-refresh"),
    # Logout
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("logout/all/", views.LogoutAllView.as_view(), name="logout-all"),
    # Password Reset
    path(
        "password/reset/request/",
        views.PasswordResetRequestView.as_view(),
        name="password-reset-request",
    ),
    path(
        "password/reset/verify/",
        views.PasswordResetVerifyView.as_view(),
        name="password-reset-verify",
    ),
    path(
        "password/reset/confirm/",
        views.PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
]

# Development-only endpoints
if settings.DEBUG:
    from . import test_views

    urlpatterns += [
        path("test/get-otp/", test_views.GetLastOTPView.as_view(), name="test-get-otp"),
    ]
