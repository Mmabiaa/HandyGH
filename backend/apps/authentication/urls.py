"""
URL configuration for authentication app.
"""

from django.urls import path
from . import views

app_name = 'authentication'

urlpatterns = [
    path('otp/request/', views.OTPRequestView.as_view(), name='otp-request'),
    path('otp/verify/', views.OTPVerifyView.as_view(), name='otp-verify'),
    path('token/refresh/', views.TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('logout/all/', views.LogoutAllView.as_view(), name='logout-all'),
]
