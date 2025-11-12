"""
Provider service layer for HandyGH.

Handles business logic for provider management including CRUD operations,
verification, and service management.

Design Decisions:
- Service layer separates business logic from views
- Centralized provider operations for consistency
- Verification workflow for trust and safety
"""

from typing import Optional, List, Dict, Any
from decimal import Decimal
from django.db import transaction
from django.db.models import QuerySet, Q
from math import radians, cos, sin, asin, sqrt

from .models import Provider, ProviderService as ProviderServiceModel, ServiceCategory
from apps.users.models import User
from core.exceptions import NotFoundError, ValidationError as CustomValidationError


class ProviderService:
    """
    Service class for provider management operations.
    
    Provides methods for creating, retrieving, updating providers
    and handling verification workflow.
    """
    
    @staticmethod
    def get_provider(provider_id: str) -> Provider:
        """
        Get provider by ID.
        
        Args:
            provider_id: UUID of the provider
            
        Returns:
            Provider instance
            
        Raises:
            NotFoundError: If provider doesn't exist
        """
        try:
            return Provider.objects.select_related('user').get(id=provider_id)
        except Provider.DoesNotExist:
            raise NotFoundError(f"Provider with id {provider_id} not found")
    
    @staticmethod
    def get_provider_by_user(user_id: str) -> Optional[Provider]:
        """
        Get provider by user ID.
        
        Args:
            user_id: UUID of the user
            
        Returns:
            Provider instance or None
        """
        try:
            return Provider.objects.select_related('user').get(user_id=user_id)
        except Provider.DoesNotExist:
            return None
    
    @staticmethod
    @transaction.atomic
    def create_provider(
        user: User,
        business_name: str = '',
        categories: List[str] = None,
        latitude: Optional[Decimal] = None,
        longitude: Optional[Decimal] = None,
        address: str = '',
        **kwargs
    ) -> Provider:
        """
        Create a new provider profile.
        
        Args:
            user: User instance
            business_name: Business name
            categories: List of category slugs
            latitude: Location latitude
            longitude: Location longitude
            address: Physical address
            **kwargs: Additional provider fields
            
        Returns:
            Created Provider instance
            
        Raises:
            CustomValidationError: If validation fails
        """
        # Check if user already has a provider profile
        if hasattr(user, 'provider_profile'):
            raise CustomValidationError("User already has a provider profile")
        
        # Validate user role
        if user.role != 'PROVIDER':
            raise CustomValidationError("User must have PROVIDER role")
        
        # Validate categories
        if categories:
            valid_categories = ServiceCategory.objects.filter(
                slug__in=categories,
                is_active=True
            ).values_list('slug', flat=True)
            
            invalid_categories = set(categories) - set(valid_categories)
            if invalid_categories:
                raise CustomValidationError(
                    f"Invalid categories: {', '.join(invalid_categories)}"
                )
        
        # Create provider
        provider = Provider.objects.create(
            user=user,
            business_name=business_name,
            categories=categories or [],
            latitude=latitude,
            longitude=longitude,
            address=address,
            **kwargs
        )
        
        return provider
    
    @staticmethod
    @transaction.atomic
    def update_provider(provider_id: str, **kwargs) -> Provider:
        """
        Update provider information.
        
        Args:
            provider_id: UUID of the provider
            **kwargs: Fields to update
            
        Returns:
            Updated Provider instance
            
        Raises:
            NotFoundError: If provider doesn't exist
            CustomValidationError: If validation fails
        """
        provider = ProviderService.get_provider(provider_id)
        
        # Validate categories if being updated
        if 'categories' in kwargs:
            categories = kwargs['categories']
            if categories:
                valid_categories = ServiceCategory.objects.filter(
                    slug__in=categories,
                    is_active=True
                ).values_list('slug', flat=True)
                
                invalid_categories = set(categories) - set(valid_categories)
                if invalid_categories:
                    raise CustomValidationError(
                        f"Invalid categories: {', '.join(invalid_categories)}"
                    )
        
        # Update allowed fields
        allowed_fields = [
            'business_name', 'categories', 'latitude', 'longitude',
            'address', 'is_active'
        ]
        for field, value in kwargs.items():
            if field in allowed_fields:
                setattr(provider, field, value)
        
        provider.save()
        return provider
    
    @staticmethod
    def verify_provider(
        provider_id: str,
        verification_doc_url: str = ''
    ) -> Provider:
        """
        Verify a provider.
        
        Args:
            provider_id: UUID of the provider
            verification_doc_url: URL to verification document
            
        Returns:
            Verified Provider instance
            
        Raises:
            NotFoundError: If provider doesn't exist
        """
        provider = ProviderService.get_provider(provider_id)
        provider.verified = True
        if verification_doc_url:
            provider.verification_doc_url = verification_doc_url
        provider.save(update_fields=['verified', 'verification_doc_url', 'updated_at'])
        return provider
    
    @staticmethod
    def unverify_provider(provider_id: str) -> Provider:
        """
        Remove verification from a provider.
        
        Args:
            provider_id: UUID of the provider
            
        Returns:
            Unverified Provider instance
        """
        provider = ProviderService.get_provider(provider_id)
        provider.verified = False
        provider.save(update_fields=['verified', 'updated_at'])
        return provider


class ServiceManagementService:
    """
    Service class for managing provider services.
    
    Handles CRUD operations for services offered by providers.
    """
    
    @staticmethod
    def get_service(service_id: str) -> ProviderServiceModel:
        """
        Get service by ID.
        
        Args:
            service_id: UUID of the service
            
        Returns:
            ProviderService instance
            
        Raises:
            NotFoundError: If service doesn't exist
        """
        try:
            return ProviderServiceModel.objects.select_related(
                'provider', 'category'
            ).get(id=service_id)
        except ProviderServiceModel.DoesNotExist:
            raise NotFoundError(f"Service with id {service_id} not found")
    
    @staticmethod
    @transaction.atomic
    def add_service(
        provider_id: str,
        title: str,
        description: str,
        price_type: str,
        price_amount: Decimal,
        category_id: Optional[str] = None,
        duration_estimate_min: Optional[int] = None,
        **kwargs
    ) -> ProviderServiceModel:
        """
        Add a new service for a provider.
        
        Args:
            provider_id: UUID of the provider
            title: Service title
            description: Service description
            price_type: Pricing model (HOURLY or FIXED)
            price_amount: Price amount
            category_id: Service category ID
            duration_estimate_min: Estimated duration
            **kwargs: Additional service fields
            
        Returns:
            Created ProviderService instance
            
        Raises:
            NotFoundError: If provider or category doesn't exist
            CustomValidationError: If validation fails
        """
        # Get provider
        provider = ProviderService.get_provider(provider_id)
        
        # Validate price type
        if price_type not in ['HOURLY', 'FIXED']:
            raise CustomValidationError(
                "Price type must be either 'HOURLY' or 'FIXED'"
            )
        
        # Validate price amount
        if price_amount <= 0:
            raise CustomValidationError("Price amount must be greater than 0")
        
        # Get category if provided
        category = None
        if category_id:
            try:
                category = ServiceCategory.objects.get(id=category_id, is_active=True)
            except ServiceCategory.DoesNotExist:
                raise NotFoundError(f"Category with id {category_id} not found")
        
        # Create service
        service = ProviderServiceModel.objects.create(
            provider=provider,
            category=category,
            title=title,
            description=description,
            price_type=price_type,
            price_amount=price_amount,
            duration_estimate_min=duration_estimate_min,
            **kwargs
        )
        
        return service
    
    @staticmethod
    @transaction.atomic
    def update_service(service_id: str, **kwargs) -> ProviderServiceModel:
        """
        Update service information.
        
        Args:
            service_id: UUID of the service
            **kwargs: Fields to update
            
        Returns:
            Updated ProviderService instance
            
        Raises:
            NotFoundError: If service doesn't exist
            CustomValidationError: If validation fails
        """
        service = ServiceManagementService.get_service(service_id)
        
        # Validate price type if being updated
        if 'price_type' in kwargs:
            price_type = kwargs['price_type']
            if price_type not in ['HOURLY', 'FIXED']:
                raise CustomValidationError(
                    "Price type must be either 'HOURLY' or 'FIXED'"
                )
        
        # Validate price amount if being updated
        if 'price_amount' in kwargs:
            price_amount = kwargs['price_amount']
            if price_amount <= 0:
                raise CustomValidationError("Price amount must be greater than 0")
        
        # Update category if provided
        if 'category_id' in kwargs:
            category_id = kwargs.pop('category_id')
            if category_id:
                try:
                    category = ServiceCategory.objects.get(id=category_id, is_active=True)
                    service.category = category
                except ServiceCategory.DoesNotExist:
                    raise NotFoundError(f"Category with id {category_id} not found")
        
        # Update allowed fields
        allowed_fields = [
            'title', 'description', 'price_type', 'price_amount',
            'duration_estimate_min', 'is_active'
        ]
        for field, value in kwargs.items():
            if field in allowed_fields:
                setattr(service, field, value)
        
        service.save()
        return service
    
    @staticmethod
    def deactivate_service(service_id: str) -> ProviderServiceModel:
        """
        Deactivate a service.
        
        Args:
            service_id: UUID of the service
            
        Returns:
            Deactivated ProviderService instance
        """
        service = ServiceManagementService.get_service(service_id)
        service.is_active = False
        service.save(update_fields=['is_active', 'updated_at'])
        return service
    
    @staticmethod
    def activate_service(service_id: str) -> ProviderServiceModel:
        """
        Activate a service.
        
        Args:
            service_id: UUID of the service
            
        Returns:
            Activated ProviderService instance
        """
        service = ServiceManagementService.get_service(service_id)
        service.is_active = True
        service.save(update_fields=['is_active', 'updated_at'])
        return service
    
    @staticmethod
    def get_provider_services(
        provider_id: str,
        active_only: bool = True
    ) -> QuerySet[ProviderServiceModel]:
        """
        Get all services for a provider.
        
        Args:
            provider_id: UUID of the provider
            active_only: Whether to return only active services
            
        Returns:
            QuerySet of ProviderService instances
        """
        queryset = ProviderServiceModel.objects.filter(
            provider_id=provider_id
        ).select_related('provider', 'category')
        
        if active_only:
            queryset = queryset.filter(is_active=True)
        
        return queryset.order_by('-created_at')


class ProviderSearchService:
    """
    Service class for searching and filtering providers.
    
    Implements geolocation-based search with various filters and sorting options.
    Optimized with select_related and prefetch_related for performance.
    """
    
    @staticmethod
    def calculate_distance(
        lat1: Decimal,
        lon1: Decimal,
        lat2: Decimal,
        lon2: Decimal
    ) -> float:
        """
        Calculate distance between two points using Haversine formula.
        
        The Haversine formula calculates the great-circle distance between
        two points on a sphere given their longitudes and latitudes.
        
        Args:
            lat1: Latitude of point 1 in decimal degrees
            lon1: Longitude of point 1 in decimal degrees
            lat2: Latitude of point 2 in decimal degrees
            lon2: Longitude of point 2 in decimal degrees
            
        Returns:
            Distance in kilometers
            
        Example:
            >>> distance = ProviderSearchService.calculate_distance(
            ...     Decimal('5.6037'), Decimal('-0.1870'),  # Accra
            ...     Decimal('5.6500'), Decimal('-0.2000')   # Nearby location
            ... )
            >>> print(f"{distance:.2f} km")
        """
        # Convert decimal degrees to radians
        lat1, lon1, lat2, lon2 = map(
            lambda x: radians(float(x)),
            [lat1, lon1, lat2, lon2]
        )
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        
        # Radius of earth in kilometers
        r = 6371
        
        return c * r
    
    @staticmethod
    def search(
        category: Optional[str] = None,
        latitude: Optional[Decimal] = None,
        longitude: Optional[Decimal] = None,
        radius_km: float = 5.0,
        min_rating: Optional[float] = None,
        verified_only: bool = False,
        active_only: bool = True,
        sort_by: str = 'rating',
        min_price: Optional[Decimal] = None,
        max_price: Optional[Decimal] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for providers with filters and sorting.
        
        This method performs a comprehensive search with:
        - Category filtering
        - Geolocation-based radius search
        - Rating filtering
        - Price range filtering
        - Verification status filtering
        - Multiple sorting options (rating, distance, price)
        
        Args:
            category: Category slug to filter by (e.g., 'plumbing', 'electrical')
            latitude: Search center latitude in decimal degrees
            longitude: Search center longitude in decimal degrees
            radius_km: Search radius in kilometers (default: 5.0)
            min_rating: Minimum rating filter (0.0 to 5.0)
            verified_only: Only return verified providers (default: False)
            active_only: Only return active providers (default: True)
            sort_by: Sort order - 'rating', 'distance', 'price' (default: 'rating')
            min_price: Minimum price filter for services
            max_price: Maximum price filter for services
            
        Returns:
            List of dictionaries containing provider data with distance and price info
            Each dict contains: provider object, distance_km, min_price, services
            
        Raises:
            CustomValidationError: If invalid sort_by value provided
            
        Example:
            >>> results = ProviderSearchService.search(
            ...     category='plumbing',
            ...     latitude=Decimal('5.6037'),
            ...     longitude=Decimal('-0.1870'),
            ...     radius_km=10.0,
            ...     min_rating=4.0,
            ...     sort_by='distance'
            ... )
        """
        # Validate sort_by parameter
        valid_sort_options = ['rating', 'distance', 'price']
        if sort_by not in valid_sort_options:
            raise CustomValidationError(
                f"Invalid sort_by value. Must be one of: {', '.join(valid_sort_options)}"
            )
        
        # Build optimized queryset with select_related and prefetch_related
        queryset = Provider.objects.select_related(
            'user'  # Fetch user data in same query to avoid N+1
        ).prefetch_related(
            'services',  # Prefetch all services for price calculations
            'services__category'  # Prefetch service categories
        )
        
        # Filter by active status
        if active_only:
            queryset = queryset.filter(is_active=True)
        
        # Filter by verification status
        if verified_only:
            queryset = queryset.filter(verified=True)
        
        # Filter by minimum rating
        if min_rating is not None:
            queryset = queryset.filter(rating_avg__gte=min_rating)
        
        # Filter by category
        if category:
            queryset = queryset.filter(categories__contains=[category])
        
        # Filter by location if provided (bounding box for performance)
        if latitude is not None and longitude is not None:
            # Calculate bounding box
            # 1 degree latitude ≈ 111 km
            lat_delta = Decimal(radius_km / 111.0)
            # 1 degree longitude varies by latitude
            lon_delta = Decimal(radius_km / (111.0 * float(cos(radians(float(latitude))))))
            
            queryset = queryset.filter(
                latitude__isnull=False,
                longitude__isnull=False,
                latitude__gte=latitude - lat_delta,
                latitude__lte=latitude + lat_delta,
                longitude__gte=longitude - lon_delta,
                longitude__lte=longitude + lon_delta
            )
        
        # Execute query and build results with additional data
        results = []
        for provider in queryset:
            # Calculate exact distance if location provided
            distance_km = None
            if latitude is not None and longitude is not None:
                if provider.latitude and provider.longitude:
                    distance_km = ProviderSearchService.calculate_distance(
                        latitude, longitude,
                        provider.latitude, provider.longitude
                    )
                    # Skip if outside radius (bounding box may include some outside)
                    if distance_km > radius_km:
                        continue
            
            # Get active services for price calculation
            active_services = [s for s in provider.services.all() if s.is_active]
            
            # Calculate minimum price from active services
            min_service_price = None
            if active_services:
                prices = [s.price_amount for s in active_services]
                min_service_price = min(prices) if prices else None
            
            # Apply price filters if specified
            if min_price is not None and min_service_price is not None:
                if min_service_price < min_price:
                    continue
            
            if max_price is not None and min_service_price is not None:
                if min_service_price > max_price:
                    continue
            
            # Build result dictionary
            result = {
                'provider': provider,
                'distance_km': distance_km,
                'min_price': min_service_price,
                'services': active_services,
                'service_count': len(active_services)
            }
            results.append(result)
        
        # Sort results based on sort_by parameter
        if sort_by == 'rating':
            # Sort by rating (descending), then by rating count (descending)
            results.sort(
                key=lambda x: (
                    -float(x['provider'].rating_avg),
                    -x['provider'].rating_count
                )
            )
        elif sort_by == 'distance':
            # Sort by distance (ascending), then by rating (descending)
            # Providers without distance go to the end
            results.sort(
                key=lambda x: (
                    x['distance_km'] if x['distance_km'] is not None else float('inf'),
                    -float(x['provider'].rating_avg)
                )
            )
        elif sort_by == 'price':
            # Sort by price (ascending), then by rating (descending)
            # Providers without price go to the end
            results.sort(
                key=lambda x: (
                    float(x['min_price']) if x['min_price'] is not None else float('inf'),
                    -float(x['provider'].rating_avg)
                )
            )
        
        return results
