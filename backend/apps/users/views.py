"""
Views for users app.

Implements user management endpoints with role-based access control.

Design Decisions:
- Use ViewSets for RESTful API design
- Integrate UserService for business logic
- Role-based permissions for security
- Separate endpoints for current user vs admin operations
"""

from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.exceptions import NotFoundError
from core.exceptions import ValidationError as CustomValidationError
from core.permissions import IsAdmin, IsOwnerOrAdmin

from .models import User
from .serializers import (
    ChangePasswordSerializer,
    UserCreateSerializer,
    UserDetailSerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from .services import ProfileService, UserService


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User model.

    Provides endpoints:
    - GET /api/v1/users/me/ - Get current user profile
    - PATCH /api/v1/users/me/ - Update current user profile
    - GET /api/v1/users/{id}/ - Get user by ID (admin only)
    - POST /api/v1/users/ - Create user (admin only)
    - GET /api/v1/users/ - List users (admin only)
    """

    queryset = User.objects.select_related("profile").all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "create":
            return UserCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return UserUpdateSerializer
        elif self.action == "retrieve":
            return UserDetailSerializer
        return UserSerializer

    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ["create", "list", "destroy"]:
            # Only admins can create, list all users, or delete
            return [IsAuthenticated(), IsAdmin()]
        elif self.action in ["retrieve", "update", "partial_update"]:
            # Owner or admin can view/update
            return [IsAuthenticated(), IsOwnerOrAdmin()]
        return [IsAuthenticated()]

    @swagger_auto_schema(
        operation_description="Get current user profile",
        responses={200: UserDetailSerializer, 401: "Unauthorized"},
    )
    @action(detail=False, methods=["get"], url_path="me")
    def get_current_user(self, request):
        """
        Get current authenticated user's profile.

        Returns complete user information including profile.
        """
        try:
            user = UserService.get_user(str(request.user.id))
            serializer = UserDetailSerializer(user)
            return Response({"success": True, "data": serializer.data, "meta": {}})
        except NotFoundError as e:
            return Response(
                {"success": False, "errors": {"message": str(e)}, "meta": {}},
                status=status.HTTP_404_NOT_FOUND,
            )

    @swagger_auto_schema(
        operation_description="Update current user profile",
        request_body=UserUpdateSerializer,
        responses={200: UserDetailSerializer, 400: "Bad Request", 401: "Unauthorized"},
    )
    @action(detail=False, methods=["patch"], url_path="me")
    def update_current_user(self, request):
        """
        Update current authenticated user's profile.

        Allows updating name, email, and profile information.
        """
        try:
            serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()

            # Refresh from DB to get updated profile
            user = UserService.get_user(str(user.id))

            response_serializer = UserDetailSerializer(user)
            return Response({"success": True, "data": response_serializer.data, "meta": {}})
        except CustomValidationError as e:
            return Response(
                {"success": False, "errors": {"message": str(e)}, "meta": {}},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @swagger_auto_schema(
        operation_description="Get user by ID (admin only)",
        responses={200: UserDetailSerializer, 403: "Forbidden", 404: "Not Found"},
    )
    def retrieve(self, request, pk=None):
        """
        Get user by ID.

        Admin only or user retrieving their own profile.
        """
        try:
            user = UserService.get_user(pk)
            serializer = UserDetailSerializer(user)
            return Response({"success": True, "data": serializer.data, "meta": {}})
        except NotFoundError as e:
            return Response(
                {"success": False, "errors": {"message": str(e)}, "meta": {}},
                status=status.HTTP_404_NOT_FOUND,
            )

    @swagger_auto_schema(
        operation_description="Create new user (admin only)",
        request_body=UserCreateSerializer,
        responses={201: UserDetailSerializer, 400: "Bad Request", 403: "Forbidden"},
    )
    def create(self, request):
        """
        Create a new user.

        Admin only. Creates user with optional password.
        """
        try:
            serializer = UserCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            user = UserService.create_user(
                phone=serializer.validated_data["phone"],
                role=serializer.validated_data.get("role", "CUSTOMER"),
                name=serializer.validated_data.get("name", ""),
                email=serializer.validated_data.get("email"),
            )

            # Set password if provided
            password = serializer.validated_data.get("password")
            if password:
                user.set_password(password)
                user.save()

            response_serializer = UserDetailSerializer(user)
            return Response(
                {"success": True, "data": response_serializer.data, "meta": {}},
                status=status.HTTP_201_CREATED,
            )
        except CustomValidationError as e:
            return Response(
                {"success": False, "errors": {"message": str(e)}, "meta": {}},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @swagger_auto_schema(
        operation_description="List all users (admin only)",
        responses={200: UserSerializer(many=True), 403: "Forbidden"},
    )
    def list(self, request):
        """
        List all users.

        Admin only. Supports filtering and pagination.
        """
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = UserSerializer(page, many=True)
            return self.get_paginated_response(
                {"success": True, "data": serializer.data, "meta": {}}
            )

        serializer = UserSerializer(queryset, many=True)
        return Response({"success": True, "data": serializer.data, "meta": {}})

    @swagger_auto_schema(
        operation_description="Change password",
        request_body=ChangePasswordSerializer,
        responses={200: "Password changed successfully", 400: "Bad Request"},
    )
    @action(detail=False, methods=["post"], url_path="change-password")
    def change_password(self, request):
        """
        Change current user's password.

        Requires old password for verification.
        """
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"success": True, "data": {"message": "Password changed successfully"}, "meta": {}}
        )
