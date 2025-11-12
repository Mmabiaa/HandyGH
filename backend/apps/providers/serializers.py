"""
Serializers for providers app.

Design Decisions:
- Separate serializers for different use cases (list, detail, create, update)
- Nested service serializers for convenience
- Distance and price information included in search results
- Category validation for data integrity
"""

from rest_framework import serializers
from decimal import Decimal
from .models import Provider, ProviderService, ServiceCategory
from apps.users.serializers import UserSerializer


class ServiceCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for ServiceCategory model.
    """
    
    class Meta:
        model = ServiceCategory
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'icon',
            'is_active',
        ]
        read_only_fields = ['id']


class ProviderServiceSerializer(serializers.ModelSerializer):
    """
    Serializer for ProviderService model.
    
    Used for listing and retrieving provider services.
    """
    
    category = ServiceCategorySerializer(read_only=True)
    category_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    price_display = serializers.CharField(read_only=True)
    
    class Meta:
        model = ProviderService
        fields = [
            'id',
            'provider',
            'category',
            'category_id',
            'title',
            'description',
            'price_type',
            'price_amount',
            'price_display',
            'duration_estimate_min',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'provider', 'created_at', 'updated_at']


class ProviderServiceCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating provider services.
    """
    
    category_id = serializers.UUIDField(required=False, allow_null=True)
    
    class Meta:
        model = ProviderService
        fields = [
            'category_id',
            'title',
            'description',
            'price_type',
            'price_amount',
            'duration_estimate_min',
        ]
    
    def validate_price_type(self, value):
        """Validate price type."""
        if value not in ['HOURLY', 'FIXED']:
            raise serializers.ValidationError(
                "Price type must be either 'HOURLY' or 'FIXED'"
            )
        return value
    
    def validate_price_amount(self, value):
        """Validate price amount."""
        if value <= 0:
            raise serializers.ValidationError(
                "Price amount must be greater than 0"
            )
        return value


class ProviderSerializer(serializers.ModelSerializer):
    """
    Basic serializer for Provider model.
    
    Used for listing providers.
    """
    
    user = UserSerializer(read_only=True)
    display_name = serializers.CharField(read_only=True)
    service_count = serializers.IntegerField(read_only=True, required=False)
    
    class Meta:
        model = Provider
        fields = [
            'id',
            'user',
            'business_name',
            'display_name',
            'categories',
            'latitude',
            'longitude',
            'address',
            'verified',
            'rating_avg',
            'rating_count',
            'response_time_avg',
            'is_active',
            'service_count',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'verified',
            'rating_avg',
            'rating_count',
            'response_time_avg',
            'created_at',
        ]


class ProviderDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for Provider model.
    
    Includes all fields and nested services.
    Used for retrieving single provider details.
    """
    
    user = UserSerializer(read_only=True)
    display_name = serializers.CharField(read_only=True)
    services = ProviderServiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Provider
        fields = [
            'id',
            'user',
            'business_name',
            'display_name',
            'categories',
            'latitude',
            'longitude',
            'address',
            'verified',
            'verification_doc_url',
            'rating_avg',
            'rating_count',
            'response_time_avg',
            'is_active',
            'services',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'verified',
            'verification_doc_url',
            'rating_avg',
            'rating_count',
            'response_time_avg',
            'created_at',
            'updated_at',
        ]


class ProviderCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating provider profiles.
    """
    
    class Meta:
        model = Provider
        fields = [
            'business_name',
            'categories',
            'latitude',
            'longitude',
            'address',
        ]
    
    def validate_categories(self, value):
        """Validate that all categories exist and are active."""
        if value:
            valid_categories = ServiceCategory.objects.filter(
                slug__in=value,
                is_active=True
            ).values_list('slug', flat=True)
            
            invalid_categories = set(value) - set(valid_categories)
            if invalid_categories:
                raise serializers.ValidationError(
                    f"Invalid categories: {', '.join(invalid_categories)}"
                )
        return value


class ProviderUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating provider information.
    """
    
    class Meta:
        model = Provider
        fields = [
            'business_name',
            'categories',
            'latitude',
            'longitude',
            'address',
            'is_active',
        ]
    
    def validate_categories(self, value):
        """Validate that all categories exist and are active."""
        if value:
            valid_categories = ServiceCategory.objects.filter(
                slug__in=value,
                is_active=True
            ).values_list('slug', flat=True)
            
            invalid_categories = set(value) - set(valid_categories)
            if invalid_categories:
                raise serializers.ValidationError(
                    f"Invalid categories: {', '.join(invalid_categories)}"
                )
        return value


class ProviderSearchResultSerializer(serializers.Serializer):
    """
    Serializer for provider search results.
    
    Includes provider data plus search-specific information like distance and price.
    """
    
    provider = ProviderSerializer()
    distance_km = serializers.FloatField(allow_null=True)
    min_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        allow_null=True
    )
    service_count = serializers.IntegerField()
    
    class Meta:
        fields = [
            'provider',
            'distance_km',
            'min_price',
            'service_count',
        ]
