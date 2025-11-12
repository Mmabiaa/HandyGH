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
        serializer = DateRangeSerializer(data=request.query_params)
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
    except Exception as e:
        return Response({
            'success': False,
            'errors': {'detail': str(e)}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        serializer = ExportFilterSerializer(data=request.query_params)
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
    except Exception as e:
        return Response({
            'success': False,
            'errors': {'detail': str(e)}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
