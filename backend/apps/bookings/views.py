"""
Booking views for HandyGH API.

Design Decisions:
- ViewSets for RESTful API design
- Role-based filtering (customers see their bookings, providers see theirs)
- Custom actions for accept/decline operations
- Permission checks for each action

SOLID Principles:
- Single Responsibility: Each view handles specific endpoint
- Open/Closed: Easy to add new actions
"""

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q

from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.bookings.models import Booking
from apps.bookings.serializers import (
    BookingAcceptSerializer,
    BookingCreateSerializer,
    BookingDeclineSerializer,
    BookingDetailSerializer,
    BookingListSerializer,
    BookingUpdateStatusSerializer,
)
from apps.bookings.services import BookingService, BookingStateMachine
from core.permissions import IsCustomer, IsOwnerOrAdmin, IsProvider


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing bookings.

    Provides CRUD operations and custom actions for booking management.
    """

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter bookings based on user role.

        - Customers see their own bookings
        - Providers see bookings for their services
        - Admins see all bookings
        """
        user = self.request.user

        if user.is_admin:
            # Admins see all bookings
            queryset = Booking.objects.all()
        elif user.is_provider:
            # Providers see bookings for their services
            queryset = Booking.objects.filter(provider__user=user)
        else:
            # Customers see their own bookings
            queryset = Booking.objects.filter(customer=user)

        # Select related objects for performance
        queryset = queryset.select_related(
            "customer",
            "provider",
            "provider__user",
            "provider_service",
            "provider_service__category",
        ).prefetch_related("status_history")

        # Filter by status if provided
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by payment status if provided
        payment_status_filter = self.request.query_params.get("payment_status")
        if payment_status_filter:
            queryset = queryset.filter(payment_status=payment_status_filter)

        return queryset.order_by("-created_at")

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "list":
            return BookingListSerializer
        elif self.action == "create":
            return BookingCreateSerializer
        elif self.action in ["accept", "decline"]:
            return BookingDeclineSerializer if self.action == "decline" else BookingAcceptSerializer
        elif self.action == "update_status":
            return BookingUpdateStatusSerializer
        else:
            return BookingDetailSerializer

    @swagger_auto_schema(
        operation_description="List all bookings for the authenticated user",
        manual_parameters=[
            openapi.Parameter(
                "status",
                openapi.IN_QUERY,
                description="Filter by booking status",
                type=openapi.TYPE_STRING,
                enum=[
                    "REQUESTED",
                    "CONFIRMED",
                    "IN_PROGRESS",
                    "COMPLETED",
                    "CANCELLED",
                    "DISPUTED",
                ],
            ),
            openapi.Parameter(
                "payment_status",
                openapi.IN_QUERY,
                description="Filter by payment status",
                type=openapi.TYPE_STRING,
                enum=["PENDING", "AUTHORIZED", "PAID", "FAILED", "REFUNDED"],
            ),
        ],
        responses={200: BookingListSerializer(many=True)},
    )
    def list(self, request, *args, **kwargs):
        """List bookings with role-based filtering."""
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Create a new booking",
        request_body=BookingCreateSerializer,
        responses={
            201: BookingDetailSerializer,
            400: "Bad Request - Validation error or provider unavailable",
        },
    )
    def create(self, request, *args, **kwargs):
        """
        Create a new booking.

        Only customers can create bookings.
        """
        # Check if user is a customer
        if not request.user.is_customer:
            return Response(
                {"error": "Only customers can create bookings"}, status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Create booking using service
            booking = BookingService.create_booking(
                customer=request.user,
                provider_service_id=str(serializer.validated_data["provider_service_id"]),
                scheduled_start=serializer.validated_data["scheduled_start"],
                address=serializer.validated_data["address"],
                scheduled_end=serializer.validated_data.get("scheduled_end"),
                duration_hours=serializer.validated_data.get("duration_hours"),
                notes=serializer.validated_data.get("notes", ""),
            )

            # Return created booking
            output_serializer = BookingDetailSerializer(booking)
            return Response(output_serializer.data, status=status.HTTP_201_CREATED)

        except DjangoValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Get booking details",
        responses={200: BookingDetailSerializer, 404: "Not Found"},
    )
    def retrieve(self, request, *args, **kwargs):
        """Get booking details."""
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_description="Provider accepts a booking",
        request_body=BookingAcceptSerializer,
        responses={
            200: BookingDetailSerializer,
            400: "Bad Request - Invalid status transition",
            403: "Forbidden - Only provider can accept",
            404: "Not Found",
        },
    )
    @action(detail=True, methods=["patch"], url_path="accept")
    def accept(self, request, pk=None):
        """
        Provider accepts a booking.

        Only the provider associated with the booking can accept it.
        """
        booking = self.get_object()

        # Check if user is the provider for this booking
        if not request.user.is_provider or booking.provider.user != request.user:
            return Response(
                {"error": "Only the provider can accept this booking"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            # Accept booking using state machine
            booking = BookingStateMachine.accept_booking(
                booking=booking, provider_user=request.user
            )

            serializer = BookingDetailSerializer(booking)
            return Response(serializer.data)

        except DjangoValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Provider declines a booking",
        request_body=BookingDeclineSerializer,
        responses={
            200: BookingDetailSerializer,
            400: "Bad Request - Invalid status transition",
            403: "Forbidden - Only provider can decline",
            404: "Not Found",
        },
    )
    @action(detail=True, methods=["patch"], url_path="decline")
    def decline(self, request, pk=None):
        """
        Provider declines a booking.

        Only the provider associated with the booking can decline it.
        """
        booking = self.get_object()

        # Check if user is the provider for this booking
        if not request.user.is_provider or booking.provider.user != request.user:
            return Response(
                {"error": "Only the provider can decline this booking"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Decline booking using state machine
            booking = BookingStateMachine.decline_booking(
                booking=booking,
                provider_user=request.user,
                reason=serializer.validated_data.get("reason", ""),
            )

            output_serializer = BookingDetailSerializer(booking)
            return Response(output_serializer.data)

        except DjangoValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Update booking status",
        request_body=BookingUpdateStatusSerializer,
        responses={
            200: BookingDetailSerializer,
            400: "Bad Request - Invalid status transition",
            403: "Forbidden - Insufficient permissions",
            404: "Not Found",
        },
    )
    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        """
        Update booking status.

        Allows transitioning to various states based on user role.
        """
        booking = self.get_object()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data["status"]
        reason = serializer.validated_data.get("reason", "")

        # Check permissions based on status transition
        if new_status == "CANCELLED":
            # Customer or provider can cancel
            if booking.customer != request.user and booking.provider.user != request.user:
                return Response(
                    {"error": "Only customer or provider can cancel this booking"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        elif new_status in ["IN_PROGRESS", "COMPLETED"]:
            # Only provider can mark as in progress or completed
            if not request.user.is_provider or booking.provider.user != request.user:
                return Response(
                    {"error": "Only the provider can update to this status"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        elif new_status == "DISPUTED":
            # Customer or provider can dispute
            if booking.customer != request.user and booking.provider.user != request.user:
                return Response(
                    {"error": "Only customer or provider can dispute this booking"},
                    status=status.HTTP_403_FORBIDDEN,
                )

        try:
            # Update status using state machine
            booking = BookingStateMachine.transition_status(
                booking=booking, new_status=new_status, changed_by=request.user, reason=reason
            )

            output_serializer = BookingDetailSerializer(booking)
            return Response(output_serializer.data)

        except DjangoValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
