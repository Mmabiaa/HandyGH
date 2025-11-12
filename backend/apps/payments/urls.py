"""
URL configuration for payments app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'transactions', views.TransactionViewSet, basename='transaction')

urlpatterns = [
    # MoMo endpoints
    path('momo/charge/', views.momo_charge, name='momo-charge'),
    path('webhook/momo/', views.momo_webhook, name='momo-webhook'),
    
    # Manual payment
    path('manual/confirm/', views.manual_payment_confirm, name='manual-payment-confirm'),
    
    # Router URLs
    path('', include(router.urls)),
]
