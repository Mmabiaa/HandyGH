"""
URL configuration for disputes app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DisputeViewSet

app_name = 'disputes'

router = DefaultRouter()
router.register(r'disputes', DisputeViewSet, basename='dispute')

urlpatterns = [
    path('', include(router.urls)),
]
