"""
Views for providers app.

Implements provider management endpoints with role-based access control.

Design Decisions:
- Use ViewSets for RESTful API design
- Integrate ProviderService and ServiceManagementService for business logic
- Role-based permissions for security
- Separate endpoints for provider operations and service management
- Search endpoint with comprehensive filtering
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from decimal import Decimal

from .models import Provider, ProviderService as ProviderServiceModel, ServiceCategory
from .serializers import (
    ProviderSerializer,
    ProviderDetailSerializer,
    ProviderCreateSerializer,
    ProviderUpdateSerializer,
    ProviderSearchResultSerializer,
    ProviderServiceSerializer,
    ProviderServiceCreateSerializer,
    ServiceCategorySerializer,
)
from .services import (
    ProviderService,
    ServiceManagementService,
    ProviderSearchService,
)
from core.permissions import IsProvider, IsAdmin, IsOwnerOrAdmin
from core.exceptions import NotFoundError, ValidationError as CustomValidationError


class ServiceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for ServiceCategory model.
    
    Provides read-only endpoints for service categories.
    """
    
    queryset = ServiceCategory.objects.filter(is_active=True)
    serializer_class = ServiceCategorySerializer
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_description="List all active service categories",
        responses={200: ServiceCategorySerializer(many=True)}
    )
    def list(self, request):
        """List all active service categories."""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'meta': {}
        })
    
    @swagger_auto_schema(
        operation_description="Get service category by ID",
        responses={
            200: ServiceCategorySerializer,
            404: "Not Found"
        }
    )
    def retrieve(self, request, pk=None):
        """Get service category by ID."""
        try:
            category = self.get_queryset().get(pk=pk)
            serializer = self.get_serializer(category)
            return Response({
                'success': True,
                'data': serializer.data,
                'meta': {}
            })
        except ServiceCategory.DoesNotExist:
            return Response({
                'success': False,
                'errors': {'message': 'Category not found'},
                'meta': {}
            }, status=status.HTTP_404_NOT_FOUND)


class ProviderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Provider model.
    
    Provides endpoints:
    - POST /api/v1/providers/ - Create provider profile
    - GET /api/v1/providers/ - Search providers with filters
    - GET /api/v1/providers/{id}/ - Get provider details
    - PATCH /api/v1/providers/{id}/ - Update provider
    - POST /api/v1/providers/{id}/services/ - Add service
    - GET /api/v1/providers/{id}/services/ - List services
    """
    
    queryset = Provider.objects.select_related('user').prefetch_related('services').all()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return ProviderCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ProviderUpdateSerializer
        elif self.action == 'retrieve':
            return ProviderDetailSerializer
        elif self.action == 'search':
            return ProviderSearchResultSerializer
        return ProviderSerializer
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['list', 'retrieve', 'search']:
            # Anyone can search and view providers
            return [AllowAny()]
        elif self.action == 'create':
            # Only authenticated users with PROVIDER role can create
            return [IsAuthenticated(), IsProvider()]
        elif self.action in ['update', 'partial_update', 'add_service', 'list_services']:
            # Owner or admin can update
            return [IsAuthenticated()]
        return [IsAuthenticated()]
    
    @swagger_auto_schema(
        operation_description="Create provider profile",
        request_body=ProviderCreateSerializer,
        responses={
            201: ProviderDetailSerializer,
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden"
        }
    )
    def create(self, request):
        """
        Create a new provider profile.
        
        User must have PROVIDER role and not already have a provider profile.
        """
        try:
            serializer = ProviderCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            provider = ProviderService.create_provider(
                user=request.user,
                **serializer.validated_data
            )
            
            response_serializer = ProviderDetailSerializer(provider)
            return Response({
                'success': True,
                'data': response_serializer.data,
                'meta': {}
            }, status=status.HTTP_201_CREATED)
        except CustomValidationError as e:
            return Response({
                'success': False,
                'errors': {'message': str(e)},
                'meta': {}
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Search providers with filters",
        manual_parameters=[
            openapi.Parameter(
                'category',
                openapi.IN_QUERY,
                description="Category slug to filter by",
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'latitude',
                openapi.IN_QUERY,
                description="Search center latitude",
                type=openapi.TYPE_NUMBER
            ),
            openapi.Parameter(
                'longitude',
                openapi.IN_QUERY,
                description="Search center longitude",
                type=openapi.TYPE_NUMBER
            ),
            openapi.Parameter(
                'radius_km',
                openapi.IN_QUERY,
                description="Search radius in kilometers (default: 5.0)",
                type=openapi.TYPE_NUMBER
            ),
            openapi.Parameter(
                'min_rating',
                openapi.IN_QUERY,
                description="Minimum rating filter (0.0 to 5.0)",
                type=openapi.TYPE_NUMBER
            ),
            openapi.Parameter(
                'verified_only',
                openapi.IN_QUERY,
                description="Only return verified providers",
                type=openapi.TYPE_BOOLEAN
            ),
            openapi.Parameter(
                'sort_by',
                openapi.IN_QUERY,
                description="Sort order: rating, distance, price (default: rating)",
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'min_price',
                openapi.IN_QUERY,
                description="Minimum price filter",
                type=openapi.TYPE_NUMBER
            ),
            openapi.Parameter(
                'max_price',
                openapi.IN_QUERY,
                description="Maximum price filter",
                type=openapi.TYPE_NUMBER
            ),
        ],
        responses={
            200: ProviderSearchResultSerializer(many=True),
            400: "Bad Request"
        }
    )
    def list(self, request):
        """
        Search providers with comprehensive filters.
        
        Supports filtering by:
        - Category
        - Location (with radius)
        - Rating
        - Verification status
        - Price range
        
        Supports sorting by:
        - Rating (default)
        - Distance
        - Price
        """
        try:
            # Extract query parameters
            category = request.query_params.get('category')
            latitude = request.query_params.get('latitude')
            longitude = request.query_params.get('longitude')
            radius_km = request.query_params.get('radius_km', 5.0)
            min_rating = request.query_params.get('min_rating')
            verified_only = request.query_params.get('verified_only', 'false').lower() == 'true'
            sort_by = request.query_params.get('sort_by', 'rating')
            min_price = request.query_params.get('min_price')
            max_price = request.query_params.get('max_price')
            
            # Convert numeric parameters
            if latitude:
                latitude = Decimal(latitude)
            if longitude:
                longitude = Decimal(longitude)
            if radius_km:
                radius_km = float(radius_km)
            if min_rating:
                min_rating = float(min_rating)
            if min_price:
                min_price = Decimal(min_price)
            if max_price:
                max_price = Decimal(max_price)
            
            # Perform search
            results = ProviderSearchService.search(
                category=category,
                latitude=latitude,
                longitude=longitude,
                radius_km=radius_km,
                min_rating=min_rating,
                verified_only=verified_only,
                sort_by=sort_by,
                min_price=min_price,
                max_price=max_price
            )
            
            serializer = ProviderSearchResultSerializer(results, many=True)
            return Response({
                'success': True,
                'data': serializer.data,
                'meta': {
                    'count': len(results),
                    'filters': {
                        'category': category,
                        'latitude': str(latitude) if latitude else None,
                        'longitude': str(longitude) if longitude else None,
                        'radius_km': radius_km,
                        'min_rating': min_rating,
                        'verified_only': verified_only,
                        'sort_by': sort_by,
                    }
                }
            })
        except (ValueError, TypeError) as e:
            return Response({
                'success': False,
                'errors': {'message': f'Invalid parameter: {str(e)}'},
                'meta': {}
            }, status=status.HTTP_400_BAD_REQUEST)
        except CustomValidationError as e:
            return Response({
                'success': False,
                'errors': {'message': str(e)},
                'meta': {}
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Get provider details by ID",
        responses={
            200: ProviderDetailSerializer,
            404: "Not Found"
        }
    )
    def retrieve(self, request, pk=None):
        """
        Get provider details by ID.
        
        Includes all provider information and active services.
        """
        try:
            provider = ProviderService.get_provider(pk)
            serializer = ProviderDetailSerializer(provider)
            return Response({
                'success': True,
                'data': serializer.data,
                'meta': {}
            })
        except NotFoundError as e:
            return Response({
                'success': False,
                'errors': {'message': str(e)},
                'meta': {}
            }, status=status.HTTP_404_NOT_FOUND)
    
    @swagger_auto_schema(
        operation_description="Update provider profile",
        request_body=ProviderUpdateSerializer,
        responses={
            200: ProviderDetailSerializer,
            400: "Bad Request",
            403: "Forbidden",
            404: "Not Found"
        }
    )
    def partial_update(self, request, pk=None):
        """
        Update provider information.
        
        Owner or admin can update. Cannot change verification status.
        """
        try:
            provider = ProviderService.get_provider(pk)
            
            # Check permission
            if request.user != provider.user and not request.user.role == 'ADMIN':
                return Response({
                    'success': False,
                    'errors': {'message': 'Permission denied'},
                    'meta': {}
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = ProviderUpdateSerializer(
                provider,
                data=request.data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            
            provider = ProviderService.update_provider(
                pk,
                **serializer.validated_data
            )
            
            response_serializer = ProviderDetailSerializer(provider)
            return Response({
                'success': True,
                'data': response_serializer.data,
                'meta': {}
            })
        except NotFoundError as e:
            return Response({
                'success': False,
                'errors': {'message': str(e)},
                'meta': {}
            }, status=status.HTTP_404_NOT_FOUND)
        except CustomValidationError as e:
            return Response({
                'success': False,
                'errors': {'message': str(e)},
                'meta': {}
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Add service to provider",
        request_body=ProviderServiceCreateSerializer,
        responses={
            201: ProviderServiceSerializer,
            400: "Bad Request",
            403: "Forbidden",
            404: "Not Found"
        }
    )
    @action(detail=True, methods=['post'], url_path='services')
    def add_service(self, request, pk=None):
        """
        Add a new service for the provider.
        
        Only the provider owner can add services.
        """
        try:
            provider = ProviderService.get_provider(pk)
            
            # Check permission
            if request.user != provider.user:
                return Response({
                    'success': False,
                    'errors': {'message': 'Permission denied'},
                    'meta': {}
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = ProviderServiceCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            service = ServiceManagementService.add_service(
                provider_id=pk,
                **serializer.validated_data
            )
            
            response_serializer = ProviderServiceSerializer(service)
            return Response({
                'success': True,
                'data': response_serializer.data,
                'meta': {}
            }, status=status.HTTP_201_CREATED)
        except NotFoundError as e:
            return Response({
                'success': False,
                'errors': {'message': str(e)},
                'meta': {}
            }, status=status.HTTP_404_NOT_FOUND)
        except CustomValidationError as e:
            return Response({
                'success': False,
                'errors': {'message': str(e)},
                'meta': {}
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="List provider services",
        manual_parameters=[
            openapi.Parameter(
                'active_only',
                openapi.IN_QUERY,
                description="Only return active services (default: true)",
                type=openapi.TYPE_BOOLEAN
            ),
        ],
        responses={
            200: ProviderServiceSerializer(many=True),
            404: "Not Found"
        }
    )
    @action(detail=True, methods=['get'], url_path='services')
    def list_services(self, request, pk=None):
        """
        List all services for a provider.
        
        By default, only returns active services.
        """
        try:
            active_only = request.query_params.get('active_only', 'true').lower() == 'true'
            
            services = ServiceManagementService.get_provider_services(
                provider_id=pk,
                active_only=active_only
            )
            
            serializer = ProviderServiceSerializer(services, many=True)
            return Response({
                'success': True,
                'data': serializer.data,
                'meta': {
                    'count': services.count(),
                    'active_only': active_only
                }
            })
        except Exception as e:
            return Response({
                'success': False,
                'errors': {'message': str(e)},
                'meta': {}
            }, status=status.HTTP_400_BAD_REQUEST)


class ProviderServiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProviderService model.
    
    Provides endpoints for managing individual services.
    """
    
    queryset = ProviderServiceModel.objects.select_related('provider', 'category').all()
    serializer_class = ProviderServiceSerializer
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    @swagger_auto_schema(
        operation_description="Get service by ID",
        responses={
            200: ProviderServiceSerializer,
            404: "Not Found"
        }
    )
    def retrieve(self, request, pk=None):
        """Get service details by ID."""
        try:
            service = ServiceManagementService.get_service(pk)
            serializer = ProviderServiceSerializer(service)
            return Response({
                'success': True,
                'data': serializer.data,
                'meta': {}
            })
        except NotFoundError as e:
            return Response({
                'success': False,
                'errors': {'message': str(e)},
                'meta': {}
            }, status=status.HTTP_404_NOT_FOUND)
    
    @swagger_auto_schema(
        operation_description="Update service",
        request_body=ProviderServiceCreateSerializer,
        responses={
            200: ProviderServiceSerializer,
            400: "Bad Request",
            403: "Forbidden",
            404: "Not Found"
        }
    )
    def partial_update(self, request, pk=None):
        """
        Update service information.
        
        Only the provider owner can update their services.
        """
        try:
            service = ServiceManagementService.get_service(pk)
            
            # Check permission
            if request.user != service.provider.user:
                return Response({
                    'success': False,
                    'errors': {'message': 'Permission denied'},
                    'meta': {}
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = ProviderServiceCreateSerializer(
                service,
                data=request.data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            
            service = ServiceManagementService.update_service(
                pk,
                **serializer.validated_data
            )
            
            response_serializer = ProviderServiceSerializer(service)
            return Response({
                'success': True,
                'data': response_serializer.data,
                'meta': {}
            })
        except NotFoundError as e:
            return Response({
                'success': False,
                'errors': {'message': str(e)},
                'meta': {}
            }, status=status.HTTP_404_NOT_FOUND)
        except CustomValidationError as e:
            return Response({
                'success': False,
                'errors': {'message': str(e)},
                'meta': {}
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Deactivate service",
        responses={
            200: ProviderServiceSerializer,
            403: "Forbidden",
            404: "Not Found"
        }
    )
    @action(detail=True, methods=['post'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        """
        Deactivate a service.
        
        Only the provider owner can deactivate their services.
        """
        try:
            service = ServiceManagementService.get_service(pk)
            
            # Check permission
            if request.user != service.provider.user:
                return Response({
                    'success': False,
                    'errors': {'message': 'Permission denied'},
                    'meta': {}
                }, status=status.HTTP_403_FORBIDDEN)
            
            service = ServiceManagementService.deactivate_service(pk)
            
            serializer = ProviderServiceSerializer(service)
            return Response({
                'success': True,
                'data': serializer.data,
                'meta': {}
            })
        except NotFoundError as e:
            return Response({
                'success': False,
                'errors': {'message': str(e)},
                'meta': {}
            }, status=status.HTTP_404_NOT_FOUND)
    
    @swagger_auto_schema(
        operation_description="Activate service",
        responses={
            200: ProviderServiceSerializer,
            403: "Forbidden",
            404: "Not Found"
        }
    )
    @action(detail=True, methods=['post'], url_path='activate')
    def activate(self, request, pk=None):
        """
        Activate a service.
        
        Only the provider owner can activate their services.
        """
        try:
            service = ServiceManagementService.get_service(pk)
            
            # Check permission
            if request.user != service.provider.user:
                return Response({
                    'success': False,
                    'errors': {'message': 'Permission denied'},
                    'meta': {}
                }, status=status.HTTP_403_FORBIDDEN)
            
            service = ServiceManagementService.activate_service(pk)
            
            serializer = ProviderServiceSerializer(service)
            return Response({
                'success': True,
                'data': serializer.data,
                'meta': {}
            })
        except NotFoundError as e:
            return Response({
                'success': False,
                'errors': {'message': str(e)},
                'meta': {}
            }, status=status.HTTP_404_NOT_FOUND)
