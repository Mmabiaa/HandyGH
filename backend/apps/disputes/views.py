"""
API views for disputes app.

Design Decisions:
- ViewSet for CRUD operations
- Custom actions for resolve and add evidence
- Permission classes for role-based access
- Filtering and pagination support

SOLID Principles:
- Single Responsibility: Each view handles specific endpoint
- Dependency Inversion: Views depend on service abstractions
"""

from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.exceptions import HandyGHException
from core.permissions import IsAdmin

from .models import Dispute
from .serializers import (
    AddEvidenceSerializer,
    DisputeCreateSerializer,
    DisputeDetailSerializer,
    DisputeListSerializer,
    DisputeResolveSerializer,
    DisputeUpdateSerializer,
)
from .services import DisputeResolutionService, DisputeService


class DisputeViewSet(viewsets.GenericViewSet):
    """
    ViewSet for dispute management.

    Endpoints:
    - POST /api/v1/disputes/ - Create dispute
    - GET /api/v1/disputes/ - List disputes
    - GET /api/v1/disputes/{id}/ - Get dispute details
    - PATCH /api/v1/disputes/{id}/ - Update dispute (admin)
    - POST /api/v1/disputes/{id}/resolve/ - Resolve dispute (admin)
    - POST /api/v1/disputes/{id}/close/ - Close dispute (admin)
    - POST /api/v1/disputes/{id}/add-evidence/ - Add evidence
    """

    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["status", "raised_by"]
    ordering_fields = ["created_at", "updated_at", "resolved_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """
        Get queryset based on user role.

        - Admins see all disputes
        - Customers/Providers see only their disputes
        """
        user = self.request.user

        if user.is_admin:
            return Dispute.objects.select_related("booking", "raised_by", "resolved_by").all()

        # Get disputes where user is customer or provider
        return Dispute.objects.select_related("booking", "raised_by", "resolved_by").filter(
            booking__customer=user
        ) | Dispute.objects.select_related("booking", "raised_by", "resolved_by").filter(
            booking__provider__user=user
        )

    def get_serializer_class(self):
        """Return appropriate serializer class based on action."""
        if self.action == "create":
            return DisputeCreateSerializer
        elif self.action == "list":
            return DisputeListSerializer
        elif self.action == "retrieve":
            return DisputeDetailSerializer
        elif self.action == "partial_update":
            return DisputeUpdateSerializer
        elif self.action == "resolve":
            return DisputeResolveSerializer
        elif self.action == "add_evidence":
            return AddEvidenceSerializer
        return DisputeDetailSerializer

    @swagger_auto_schema(
        operation_description="Create a new dispute for a booking",
        request_body=DisputeCreateSerializer,
        responses={
            201: DisputeDetailSerializer,
            400: "Bad Request - Validation error or dispute window expired",
            403: "Forbidden - Not a booking participant",
            404: "Not Found - Booking not found",
        },
        tags=["Disputes"],
    )
    def create(self, request):
        """
        Create a new dispute.

        POST /api/v1/disputes/
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            dispute = DisputeService.create_dispute(
                booking_id=serializer.validated_data["booking_id"],
                raised_by_user=request.user,
                reason=serializer.validated_data["reason"],
                description=serializer.validated_data["description"],
                evidence=serializer.validated_data.get("evidence", []),
            )

            response_serializer = DisputeDetailSerializer(dispute)
            return Response(
                {
                    "success": True,
                    "data": response_serializer.data,
                    "message": "Dispute created successfully",
                },
                status=status.HTTP_201_CREATED,
            )
        except HandyGHException as e:
            return Response(
                {"success": False, "errors": {"message": e.message, "code": e.error_code}},
                status=e.status_code,
            )

    @swagger_auto_schema(
        operation_description="List disputes with filtering and ordering",
        manual_parameters=[
            openapi.Parameter(
                "status",
                openapi.IN_QUERY,
                description="Filter by dispute status",
                type=openapi.TYPE_STRING,
                enum=["OPEN", "INVESTIGATING", "RESOLVED", "CLOSED"],
            ),
            openapi.Parameter(
                "raised_by",
                openapi.IN_QUERY,
                description="Filter by user ID who raised the dispute",
                type=openapi.TYPE_STRING,
            ),
            openapi.Parameter(
                "ordering",
                openapi.IN_QUERY,
                description="Order by field (prefix with - for descending)",
                type=openapi.TYPE_STRING,
                enum=[
                    "created_at",
                    "-created_at",
                    "updated_at",
                    "-updated_at",
                    "resolved_at",
                    "-resolved_at",
                ],
            ),
        ],
        responses={200: DisputeListSerializer(many=True), 403: "Forbidden - Not authorized"},
        tags=["Disputes"],
    )
    def list(self, request):
        """
        List disputes.

        GET /api/v1/disputes/

        Query params:
        - status: Filter by status
        - raised_by: Filter by user who raised dispute
        - ordering: Order by field (e.g., -created_at)
        """
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)

        return Response({"success": True, "data": serializer.data})

    @swagger_auto_schema(
        operation_description="Get dispute details by ID",
        responses={
            200: DisputeDetailSerializer,
            403: "Forbidden - Not authorized to view this dispute",
            404: "Not Found - Dispute not found",
        },
        tags=["Disputes"],
    )
    def retrieve(self, request, pk=None):
        """
        Get dispute details.

        GET /api/v1/disputes/{id}/
        """
        try:
            dispute = DisputeService.get_dispute(dispute_id=pk, user=request.user)

            serializer = self.get_serializer(dispute)
            return Response({"success": True, "data": serializer.data})
        except HandyGHException as e:
            return Response(
                {"success": False, "errors": {"message": e.message, "code": e.error_code}},
                status=e.status_code,
            )

    @swagger_auto_schema(
        operation_description="Update dispute status (admin only)",
        request_body=DisputeUpdateSerializer,
        responses={
            200: DisputeDetailSerializer,
            400: "Bad Request - Invalid status transition",
            403: "Forbidden - Admin access required",
            404: "Not Found - Dispute not found",
        },
        tags=["Disputes"],
    )
    def partial_update(self, request, pk=None):
        """
        Update dispute status (admin only).

        PATCH /api/v1/disputes/{id}/
        """
        # Check admin permission
        if not request.user.is_admin:
            return Response(
                {
                    "success": False,
                    "errors": {
                        "message": "Only administrators can update dispute status",
                        "code": "PERMISSION_DENIED",
                    },
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            dispute = DisputeResolutionService.update_dispute_status(
                dispute_id=pk,
                admin_user=request.user,
                new_status=serializer.validated_data["status"],
                notes=serializer.validated_data.get("notes"),
            )

            response_serializer = DisputeDetailSerializer(dispute)
            return Response(
                {
                    "success": True,
                    "data": response_serializer.data,
                    "message": "Dispute status updated successfully",
                }
            )
        except HandyGHException as e:
            return Response(
                {"success": False, "errors": {"message": e.message, "code": e.error_code}},
                status=e.status_code,
            )

    @swagger_auto_schema(
        operation_description="Resolve a dispute with resolution text (admin only)",
        request_body=DisputeResolveSerializer,
        responses={
            200: DisputeDetailSerializer,
            400: "Bad Request - Dispute already resolved",
            403: "Forbidden - Admin access required",
            404: "Not Found - Dispute not found",
        },
        tags=["Disputes"],
    )
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsAdmin])
    def resolve(self, request, pk=None):
        """
        Resolve a dispute (admin only).

        POST /api/v1/disputes/{id}/resolve/
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            dispute = DisputeResolutionService.resolve_dispute(
                dispute_id=pk,
                admin_user=request.user,
                resolution=serializer.validated_data["resolution"],
            )

            response_serializer = DisputeDetailSerializer(dispute)
            return Response(
                {
                    "success": True,
                    "data": response_serializer.data,
                    "message": "Dispute resolved successfully",
                }
            )
        except HandyGHException as e:
            return Response(
                {"success": False, "errors": {"message": e.message, "code": e.error_code}},
                status=e.status_code,
            )

    @swagger_auto_schema(
        operation_description="Close a resolved dispute (admin only)",
        responses={
            200: DisputeDetailSerializer,
            400: "Bad Request - Dispute not resolved yet",
            403: "Forbidden - Admin access required",
            404: "Not Found - Dispute not found",
        },
        tags=["Disputes"],
    )
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsAdmin])
    def close(self, request, pk=None):
        """
        Close a resolved dispute (admin only).

        POST /api/v1/disputes/{id}/close/
        """
        try:
            dispute = DisputeResolutionService.close_dispute(dispute_id=pk, admin_user=request.user)

            response_serializer = DisputeDetailSerializer(dispute)
            return Response(
                {
                    "success": True,
                    "data": response_serializer.data,
                    "message": "Dispute closed successfully",
                }
            )
        except HandyGHException as e:
            return Response(
                {"success": False, "errors": {"message": e.message, "code": e.error_code}},
                status=e.status_code,
            )

    @swagger_auto_schema(
        operation_description="Add evidence to an open dispute",
        request_body=AddEvidenceSerializer,
        responses={
            200: DisputeDetailSerializer,
            400: "Bad Request - Dispute is closed or invalid evidence",
            403: "Forbidden - Not a dispute participant",
            404: "Not Found - Dispute not found",
        },
        tags=["Disputes"],
    )
    @action(detail=True, methods=["post"], url_path="add-evidence")
    def add_evidence(self, request, pk=None):
        """
        Add evidence to a dispute.

        POST /api/v1/disputes/{id}/add-evidence/
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            dispute = DisputeService.add_evidence(
                dispute_id=pk, user=request.user, evidence_item=serializer.validated_data
            )

            response_serializer = DisputeDetailSerializer(dispute)
            return Response(
                {
                    "success": True,
                    "data": response_serializer.data,
                    "message": "Evidence added successfully",
                }
            )
        except HandyGHException as e:
            return Response(
                {"success": False, "errors": {"message": e.message, "code": e.error_code}},
                status=e.status_code,
            )
