"""
Views for users app.

Placeholder for now - will be implemented in later tasks.
"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User model.
    
    Provides CRUD operations for users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
