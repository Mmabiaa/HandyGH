"""
Admin dashboard views for HandyGH.

Design Decisions:
- All endpoints require admin authentication
- Statistics endpoints provide aggregated data
- Export endpoints return CSV files
- User moderation endpoints for account management

SOLID Principles:
- Single Responsibility: Each view handles specific admin operation
- Dependency Inversion: Views depend on service abstractions
"""

from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from core.permissions import IsAdmin
from core.exceptions import ValidationError, NotFoundError
from apps.users.models import User
from .services import AdminReportService, UserModerationService, DataExportService
from .serializers import (
    DateRangeSerializer,
    UserModerationSerializer,
    ExportFilterSerializer,
    AdminUserListSerializer,
    DashboardStatsSerializer,
    UserStatisticsSerializer,
    BookingStatisticsSerializer,
    TransactionStatisticsSerializer
)


@swagger_auto_schema(
    method='get',
    operation_description="Get dashboard overview statistics including users, bookings, and revenue",
    responses={
        200: DashboardStatsSerializer,
        403: "Forbidden - Admin access required",
        500: "Internal Server Error"
    },
    tags=['Admin Dashboard']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def dashboard_stats(request):
    """
    Get dashboard statistics.
    
    Returns overview statistics including users, bookings, and revenue.
    
    Permissions:
        - User must be authenticated
        - User must be admin
    """
    try:
        stats = AdminReportService.get_dashboard_stats()
        serializer = DashboardStatsSerializer(stats)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'errors': {'detail': str(e)}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description="Get user statistics with optional date range filtering",
    manual_parameters=[
        openapi.Parameter(
            'start_date',
            openapi.IN_QUERY,
            description="Start date for filtering (ISO format: YYYY-MM-DD)",
            type=openapi.TYPE_STRING,
            format=openapi.FORMAT_DATE
        ),
        openapi.Parameter(
            'end_date',
            openapi.IN_QUERY,
            description="End date for filtering (ISO format: YYYY-MM-DD)",
            type=openapi.TYPE_STRING,
            format=openapi.FORMAT_DATE
        ),
    ],
    responses={
        200: UserStatisticsSerializer,
        400: "Bad Request - Invalid date format",
        403: "Forbidden - Admin access required",
        500: "Internal Server Error"
    },
    tags=['Admin Dashboard']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def user_statistics(request):
    """
    Get user statistics.
    
    Query Parameters:
        - start_date: Optional start date (ISO format)
        - end_date: Optional end date (ISO format)
    
    Permissions:
        - User must be authenticated
        - User must be admin
    """
    try:
        from rest_framework.exceptions import ValidationError as DRFValidationError
        
        # Create mutable copy of query params
        query_data = request.query_params.dict()
        serializer = DateRangeSerializer(data=query_data)
        serializer.is_valid(raise_exception=True)
        
        stats = AdminReportService.get_user_statistics(
            start_date=serializer.validated_data.get('start_date'),
            end_date=serializer.validated_data.get('end_date')
        )
        
        response_serializer = UserStatisticsSerializer(stats)
        
        return Response({
            'success': True,
            'data': response_serializer.data
        })
    except DRFValidationError as e:
        return Response({
            'success': False,
            'errors': e.detail if hasattr(e, 'detail') else {'detail': str(e)}
        }, status=status.HTTP_400_BAD_REQUEST)
    except ValidationError as e:
        return Response({
            'success': False,
            'errors': {'detail': str(e)}
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'errors': {'detail': str(e)}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description="Get booking statistics with optional date range filtering",
    manual_parameters=[
        openapi.Parameter(
            'start_date',
            openapi.IN_QUERY,
            description="Start date for filtering (ISO format: YYYY-MM-DD)",
            type=openapi.TYPE_STRING,
            format=openapi.FORMAT_DATE
        ),
        openapi.Parameter(
            'end_date',
            openapi.IN_QUERY,
            description="End date for filtering (ISO format: YYYY-MM-DD)",
            type=openapi.TYPE_STRING,
            format=openapi.FORMAT_DATE
        ),
    ],
    responses={
        200: BookingStatisticsSerializer,
        400: "Bad Request - Invalid date format",
        403: "Forbidden - Admin access required",
        500: "Internal Server Error"
    },
    tags=['Admin Dashboard']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def booking_statistics(request):
    """
    Get booking statistics.
    
    Query Parameters:
        - start_date: Optional start date (ISO format)
        - end_date: Optional end date (ISO format)
    
    Permissions:
        - User must be authenticated
        - User must be admin
    """
    try:
        serializer = DateRangeSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        
        stats = AdminReportService.get_booking_statistics(
            start_date=serializer.validated_data.get('start_date'),
            end_date=serializer.validated_data.get('end_date')
        )
        
        response_serializer = BookingStatisticsSerializer(stats)
        
        return Response({
            'success': True,
            'data': response_serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'errors': {'detail': str(e)}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description="Get transaction statistics with optional date range filtering",
    manual_parameters=[
        openapi.Parameter(
            'start_date',
            openapi.IN_QUERY,
            description="Start date for filtering (ISO format: YYYY-MM-DD)",
            type=openapi.TYPE_STRING,
            format=openapi.FORMAT_DATE
        ),
        openapi.Parameter(
            'end_date',
            openapi.IN_QUERY,
            description="End date for filtering (ISO format: YYYY-MM-DD)",
            type=openapi.TYPE_STRING,
            format=openapi.FORMAT_DATE
        ),
    ],
    responses={
        200: TransactionStatisticsSerializer,
        400: "Bad Request - Invalid date format",
        403: "Forbidden - Admin access required",
        500: "Internal Server Error"
    },
    tags=['Admin Dashboard']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def transaction_statistics(request):
    """
    Get transaction statistics.
    
    Query Parameters:
        - start_date: Optional start date (ISO format)
        - end_date: Optional end date (ISO format)
    
    Permissions:
        - User must be authenticated
        - User must be admin
    """
    try:
        serializer = DateRangeSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        
        stats = AdminReportService.get_transaction_statistics(
            start_date=serializer.validated_data.get('start_date'),
            end_date=serializer.validated_data.get('end_date')
        )
        
        response_serializer = TransactionStatisticsSerializer(stats)
        
        return Response({
            'success': True,
            'data': response_serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'errors': {'detail': str(e)}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description="List all users with optional filtering and search",
    manual_parameters=[
        openapi.Parameter(
            'role',
            openapi.IN_QUERY,
            description="Filter by user role",
            type=openapi.TYPE_STRING,
            enum=['CUSTOMER', 'PROVIDER', 'ADMIN']
        ),
        openapi.Parameter(
            'is_active',
            openapi.IN_QUERY,
            description="Filter by active status",
            type=openapi.TYPE_BOOLEAN
        ),
        openapi.Parameter(
            'search',
            openapi.IN_QUERY,
            description="Search by phone, email, or name",
            type=openapi.TYPE_STRING
        ),
    ],
    responses={
        200: AdminUserListSerializer(many=True),
        403: "Forbidden - Admin access required",
        500: "Internal Server Error"
    },
    tags=['Admin Dashboard']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def list_users(request):
    """
    List all users with optional filtering.
    
    Query Parameters:
        - role: Filter by role (CUSTOMER, PROVIDER, ADMIN)
        - is_active: Filter by active status (true/false)
        - search: Search by phone, email, or name
    
    Permissions:
        - User must be authenticated
        - User must be admin
    """
    try:
        queryset = User.objects.all()
        
        # Apply filters
        role = request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active_bool)
        
        search = request.query_params.get('search')
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(phone__icontains=search) |
                Q(email__icontains=search) |
                Q(name__icontains=search)
            )
        
        # Order by created_at descending
        queryset = queryset.order_by('-created_at')
        
        serializer = AdminUserListSerializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'meta': {
                'total': queryset.count()
            }
        })
    except Exception as e:
        return Response({
            'success': False,
            'errors': {'detail': str(e)}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='patch',
    operation_description="Suspend a user account and revoke all active sessions",
    request_body=UserModerationSerializer,
    responses={
        200: openapi.Response(
            description="User suspended successfully",
            examples={
                "application/json": {
                    "success": True,
                    "data": {
                        "success": True,
                        "message": "User suspended successfully",
                        "tokens_revoked": 2
                    }
                }
            }
        ),
        400: "Bad Request - User already suspended",
        403: "Forbidden - Admin access required",
        404: "Not Found - User not found",
        500: "Internal Server Error"
    },
    tags=['Admin Dashboard']
)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdmin])
def suspend_user(request, user_id):
    """
    Suspend a user account.
    
    Body:
        - reason: Optional reason for suspension
    
    Permissions:
        - User must be authenticated
        - User must be admin
    """
    try:
        serializer = UserModerationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        result = UserModerationService.suspend_user(
            user_id=user_id,
            reason=serializer.validated_data.get('reason', '')
        )
        
        if not result['success']:
            return Response({
                'success': False,
                'errors': {'detail': result['message']}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'data': result
        })
    except User.DoesNotExist:
        return Response({
            'success': False,
            'errors': {'detail': 'User not found'}
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'errors': {'detail': str(e)}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='patch',
    operation_description="Activate a suspended user account",
    responses={
        200: openapi.Response(
            description="User activated successfully",
            examples={
                "application/json": {
                    "success": True,
                    "data": {
                        "success": True,
                        "message": "User activated successfully"
                    }
                }
            }
        ),
        400: "Bad Request - User already active",
        403: "Forbidden - Admin access required",
        404: "Not Found - User not found",
        500: "Internal Server Error"
    },
    tags=['Admin Dashboard']
)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdmin])
def activate_user(request, user_id):
    """
    Activate a suspended user account.
    
    Permissions:
        - User must be authenticated
        - User must be admin
    """
    try:
        result = UserModerationService.activate_user(user_id=user_id)
        
        if not result['success']:
            return Response({
                'success': False,
                'errors': {'detail': result['message']}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'data': result
        })
    except User.DoesNotExist:
        return Response({
            'success': False,
            'errors': {'detail': 'User not found'}
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'errors': {'detail': str(e)}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@swagger_auto_schema(
    method='get',
    operation_description="Export data to CSV file (users, bookings, or transactions)",
    manual_parameters=[
        openapi.Parameter(
            'export_type',
            openapi.IN_QUERY,
            description="Type of data to export",
            type=openapi.TYPE_STRING,
            enum=['users', 'bookings', 'transactions'],
            required=True
        ),
        openapi.Parameter(
            'start_date',
            openapi.IN_QUERY,
            description="Start date for filtering (ISO format: YYYY-MM-DD)",
            type=openapi.TYPE_STRING,
            format=openapi.FORMAT_DATE
        ),
        openapi.Parameter(
            'end_date',
            openapi.IN_QUERY,
            description="End date for filtering (ISO format: YYYY-MM-DD)",
            type=openapi.TYPE_STRING,
            format=openapi.FORMAT_DATE
        ),
        openapi.Parameter(
            'role',
            openapi.IN_QUERY,
            description="Filter by role (for users export only)",
            type=openapi.TYPE_STRING,
            enum=['CUSTOMER', 'PROVIDER', 'ADMIN']
        ),
        openapi.Parameter(
            'is_active',
            openapi.IN_QUERY,
            description="Filter by active status (for users export only)",
            type=openapi.TYPE_BOOLEAN
        ),
    ],
    responses={
        200: openapi.Response(
            description="CSV file download",
            schema=openapi.Schema(
                type=openapi.TYPE_FILE
            )
        ),
        400: "Bad Request - Invalid parameters",
        403: "Forbidden - Admin access required",
        500: "Internal Server Error"
    },
    tags=['Admin Dashboard']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def export_csv(request):
    """
    Export data to CSV.
    
    Query Parameters:
        - export_type: Type of data to export (users, bookings, transactions)
        - start_date: Optional start date for filtering
        - end_date: Optional end date for filtering
        - role: Optional role filter for users export
        - is_active: Optional active status filter for users export
    
    Permissions:
        - User must be authenticated
        - User must be admin
    """
    try:
        from rest_framework.exceptions import ValidationError as DRFValidationError
        
        # Create mutable copy of query params
        query_data = request.query_params.dict()
        serializer = ExportFilterSerializer(data=query_data)
        serializer.is_valid(raise_exception=True)
        
        export_type = serializer.validated_data['export_type']
        start_date = serializer.validated_data.get('start_date')
        end_date = serializer.validated_data.get('end_date')
        
        if export_type == 'users':
            role = serializer.validated_data.get('role')
            is_active = serializer.validated_data.get('is_active')
            csv_data = DataExportService.export_users_csv(
                role=role,
                is_active=is_active
            )
            filename = 'users_export.csv'
        elif export_type == 'bookings':
            csv_data = DataExportService.export_bookings_csv(
                start_date=start_date,
                end_date=end_date
            )
            filename = 'bookings_export.csv'
        elif export_type == 'transactions':
            csv_data = DataExportService.export_transactions_csv(
                start_date=start_date,
                end_date=end_date
            )
            filename = 'transactions_export.csv'
        else:
            return Response({
                'success': False,
                'errors': {'detail': 'Invalid export type'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create HTTP response with CSV content
        response = HttpResponse(csv_data, content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
    except DRFValidationError as e:
        return Response({
            'success': False,
            'errors': e.detail if hasattr(e, 'detail') else {'detail': str(e)}
        }, status=status.HTTP_400_BAD_REQUEST)
    except ValidationError as e:
        return Response({
            'success': False,
            'errors': {'detail': str(e)}
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'errors': {'detail': str(e)}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
