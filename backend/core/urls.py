"""
URL configuration for core utilities.

Includes health check endpoint for monitoring.
"""

from django.urls import path

from . import views

app_name = "core"

urlpatterns = [
    path("", views.health_check, name="health-check"),
]
