"""
Custom permission classes for HandyGH.

Design Decisions:
- Role-based access control (RBAC) for different user types
- Granular permissions for resource ownership
- Reusable permission classes following DRY principle

SOLID Principles Applied:
- Single Responsibility: Each permission class checks one specific condition
- Open/Closed: Easy to add new permission classes without modifying existing ones
"""

from rest_framework import permissions


class IsCustomer(permissions.BasePermission):
    """
    Permission class to check if user has CUSTOMER role.

    Usage:
        permission_classes = [IsAuthenticated, IsCustomer]
    """

    message = "Only customers can perform this action"

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == "CUSTOMER"


class IsProvider(permissions.BasePermission):
    """
    Permission class to check if user has PROVIDER role.

    Usage:
        permission_classes = [IsAuthenticated, IsProvider]
    """

    message = "Only providers can perform this action"

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == "PROVIDER"


class IsAdmin(permissions.BasePermission):
    """
    Permission class to check if user has ADMIN role.

    Usage:
        permission_classes = [IsAuthenticated, IsAdmin]
    """

    message = "Only administrators can perform this action"

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == "ADMIN"


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission class to check if user owns the resource or is an admin.

    This permission checks object-level permissions.
    The object must have a 'user' or 'owner' attribute.

    Usage:
        permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    """

    message = "You must be the owner or an administrator to perform this action"

    def has_object_permission(self, request, view, obj):
        # Admin users have full access
        if request.user.role == "ADMIN":
            return True

        # Check if object has 'user' attribute
        if hasattr(obj, "user"):
            return obj.user == request.user

        # Check if object has 'owner' attribute
        if hasattr(obj, "owner"):
            return obj.owner == request.user

        # Check if object is the user itself
        if obj == request.user:
            return True

        return False


class IsBookingParticipant(permissions.BasePermission):
    """
    Permission class to check if user is involved in a booking.

    User must be either the customer or the provider of the booking.

    Usage:
        permission_classes = [IsAuthenticated, IsBookingParticipant]
    """

    message = "You must be involved in this booking to perform this action"

    def has_object_permission(self, request, view, obj):
        # Admin users have full access
        if request.user.role == "ADMIN":
            return True

        # Check if user is the customer
        if hasattr(obj, "customer") and obj.customer == request.user:
            return True

        # Check if user is the provider
        if hasattr(obj, "provider") and hasattr(obj.provider, "user"):
            return obj.provider.user == request.user

        return False


class ReadOnly(permissions.BasePermission):
    """
    Permission class that only allows read operations (GET, HEAD, OPTIONS).

    Usage:
        permission_classes = [ReadOnly]
    """

    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS
