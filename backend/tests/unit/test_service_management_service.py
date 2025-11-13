"""
Unit tests for ServiceManagementService.

Tests cover:
- Service CRUD operations
- Service validation
- Service activation/deactivation
- Error handling
"""

from decimal import Decimal

import pytest

from apps.providers.models import Provider, ProviderService, ServiceCategory
from apps.providers.services import ServiceManagementService
from apps.users.models import User
from core.exceptions import NotFoundError
from core.exceptions import ValidationError as CustomValidationError


@pytest.fixture
def provider_with_profile(db, provider_user):
    """Create a provider with profile."""
    return Provider.objects.create(
        user=provider_user,
        business_name="Test Plumbing Services",
        categories=["plumbing"],
        is_active=True,
    )


@pytest.fixture
def plumbing_category(db):
    """Create a plumbing service category."""
    return ServiceCategory.objects.create(
        name="Plumbing", slug="plumbing", description="Plumbing services", is_active=True
    )


@pytest.fixture
def inactive_category(db):
    """Create an inactive service category."""
    return ServiceCategory.objects.create(
        name="Inactive Category", slug="inactive", description="Inactive category", is_active=False
    )


class TestGetService:
    """Test get_service method."""

    def test_get_service_success(self, db, provider_with_profile, plumbing_category):
        """Test successful service retrieval."""
        service = ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title="Emergency Plumbing",
            description="24/7 emergency plumbing",
            price_type="FIXED",
            price_amount=Decimal("150.00"),
        )

        result = ServiceManagementService.get_service(str(service.id))

        assert result.id == service.id
        assert result.title == "Emergency Plumbing"

    def test_get_service_not_found(self, db):
        """Test get_service with non-existent ID."""
        import uuid

        fake_id = str(uuid.uuid4())

        with pytest.raises(NotFoundError) as exc_info:
            ServiceManagementService.get_service(fake_id)

        assert "not found" in str(exc_info.value).lower()

    def test_get_service_includes_relations(self, db, provider_with_profile, plumbing_category):
        """Test that get_service includes provider and category."""
        service = ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title="Test Service",
            description="Test",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
        )

        result = ServiceManagementService.get_service(str(service.id))

        # Should have provider and category loaded
        assert result.provider.id == provider_with_profile.id
        assert result.category.id == plumbing_category.id


class TestAddService:
    """Test add_service method."""

    def test_add_service_success(self, db, provider_with_profile, plumbing_category):
        """Test successful service creation."""
        service = ServiceManagementService.add_service(
            provider_id=str(provider_with_profile.id),
            title="Emergency Plumbing Repair",
            description="Fast emergency plumbing repairs",
            price_type="HOURLY",
            price_amount=Decimal("50.00"),
            category_id=str(plumbing_category.id),
            duration_estimate_min=120,
        )

        assert service.id is not None
        assert service.provider == provider_with_profile
        assert service.category == plumbing_category
        assert service.title == "Emergency Plumbing Repair"
        assert service.price_type == "HOURLY"
        assert service.price_amount == Decimal("50.00")
        assert service.duration_estimate_min == 120
        assert service.is_active is True

    def test_add_service_without_category(self, db, provider_with_profile):
        """Test service creation without category."""
        service = ServiceManagementService.add_service(
            provider_id=str(provider_with_profile.id),
            title="General Service",
            description="General service",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
        )

        assert service.category is None

    def test_add_service_fixed_price(self, db, provider_with_profile, plumbing_category):
        """Test service creation with fixed price."""
        service = ServiceManagementService.add_service(
            provider_id=str(provider_with_profile.id),
            title="Fixed Price Service",
            description="Service with fixed price",
            price_type="FIXED",
            price_amount=Decimal("200.00"),
            category_id=str(plumbing_category.id),
        )

        assert service.price_type == "FIXED"
        assert service.price_amount == Decimal("200.00")

    def test_add_service_provider_not_found(self, db, plumbing_category):
        """Test service creation with non-existent provider."""
        import uuid

        fake_id = str(uuid.uuid4())

        with pytest.raises(NotFoundError):
            ServiceManagementService.add_service(
                provider_id=fake_id,
                title="Test Service",
                description="Test",
                price_type="FIXED",
                price_amount=Decimal("100.00"),
            )

    def test_add_service_category_not_found(self, db, provider_with_profile):
        """Test service creation with non-existent category."""
        import uuid

        fake_id = str(uuid.uuid4())

        with pytest.raises(NotFoundError) as exc_info:
            ServiceManagementService.add_service(
                provider_id=str(provider_with_profile.id),
                title="Test Service",
                description="Test",
                price_type="FIXED",
                price_amount=Decimal("100.00"),
                category_id=fake_id,
            )

        assert "category" in str(exc_info.value).lower()

    def test_add_service_inactive_category(self, db, provider_with_profile, inactive_category):
        """Test service creation with inactive category."""
        with pytest.raises(NotFoundError):
            ServiceManagementService.add_service(
                provider_id=str(provider_with_profile.id),
                title="Test Service",
                description="Test",
                price_type="FIXED",
                price_amount=Decimal("100.00"),
                category_id=str(inactive_category.id),
            )

    def test_add_service_invalid_price_type(self, db, provider_with_profile):
        """Test service creation with invalid price type."""
        with pytest.raises(CustomValidationError) as exc_info:
            ServiceManagementService.add_service(
                provider_id=str(provider_with_profile.id),
                title="Test Service",
                description="Test",
                price_type="INVALID",
                price_amount=Decimal("100.00"),
            )

        assert "price type" in str(exc_info.value).lower()

    def test_add_service_zero_price(self, db, provider_with_profile):
        """Test service creation with zero price."""
        with pytest.raises(CustomValidationError) as exc_info:
            ServiceManagementService.add_service(
                provider_id=str(provider_with_profile.id),
                title="Test Service",
                description="Test",
                price_type="FIXED",
                price_amount=Decimal("0.00"),
            )

        assert "greater than 0" in str(exc_info.value).lower()

    def test_add_service_negative_price(self, db, provider_with_profile):
        """Test service creation with negative price."""
        with pytest.raises(CustomValidationError) as exc_info:
            ServiceManagementService.add_service(
                provider_id=str(provider_with_profile.id),
                title="Test Service",
                description="Test",
                price_type="FIXED",
                price_amount=Decimal("-50.00"),
            )

        assert "greater than 0" in str(exc_info.value).lower()


class TestUpdateService:
    """Test update_service method."""

    def test_update_service_title(self, db, provider_with_profile, plumbing_category):
        """Test updating service title."""
        service = ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title="Old Title",
            description="Description",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
        )

        updated = ServiceManagementService.update_service(str(service.id), title="New Title")

        assert updated.title == "New Title"

    def test_update_service_price(self, db, provider_with_profile, plumbing_category):
        """Test updating service price."""
        service = ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title="Test Service",
            description="Description",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
        )

        updated = ServiceManagementService.update_service(
            str(service.id), price_amount=Decimal("150.00")
        )

        assert updated.price_amount == Decimal("150.00")

    def test_update_service_price_type(self, db, provider_with_profile, plumbing_category):
        """Test updating service price type."""
        service = ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title="Test Service",
            description="Description",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
        )

        updated = ServiceManagementService.update_service(str(service.id), price_type="HOURLY")

        assert updated.price_type == "HOURLY"

    def test_update_service_category(self, db, provider_with_profile, plumbing_category):
        """Test updating service category."""
        electrical_category = ServiceCategory.objects.create(
            name="Electrical", slug="electrical", is_active=True
        )

        service = ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title="Test Service",
            description="Description",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
        )

        updated = ServiceManagementService.update_service(
            str(service.id), category_id=str(electrical_category.id)
        )

        assert updated.category.id == electrical_category.id

    def test_update_service_not_found(self, db):
        """Test updating non-existent service."""
        import uuid

        fake_id = str(uuid.uuid4())

        with pytest.raises(NotFoundError):
            ServiceManagementService.update_service(fake_id, title="Test")

    def test_update_service_invalid_price_type(self, db, provider_with_profile, plumbing_category):
        """Test updating service with invalid price type."""
        service = ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title="Test Service",
            description="Description",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
        )

        with pytest.raises(CustomValidationError):
            ServiceManagementService.update_service(str(service.id), price_type="INVALID")

    def test_update_service_zero_price(self, db, provider_with_profile, plumbing_category):
        """Test updating service with zero price."""
        service = ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title="Test Service",
            description="Description",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
        )

        with pytest.raises(CustomValidationError):
            ServiceManagementService.update_service(str(service.id), price_amount=Decimal("0.00"))

    def test_update_service_inactive_category(
        self, db, provider_with_profile, plumbing_category, inactive_category
    ):
        """Test updating service with inactive category."""
        service = ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title="Test Service",
            description="Description",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
        )

        with pytest.raises(NotFoundError):
            ServiceManagementService.update_service(
                str(service.id), category_id=str(inactive_category.id)
            )


class TestDeactivateService:
    """Test deactivate_service method."""

    def test_deactivate_service_success(self, db, provider_with_profile, plumbing_category):
        """Test successful service deactivation."""
        service = ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title="Test Service",
            description="Description",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
            is_active=True,
        )

        deactivated = ServiceManagementService.deactivate_service(str(service.id))

        assert deactivated.is_active is False

    def test_deactivate_service_not_found(self, db):
        """Test deactivating non-existent service."""
        import uuid

        fake_id = str(uuid.uuid4())

        with pytest.raises(NotFoundError):
            ServiceManagementService.deactivate_service(fake_id)


class TestActivateService:
    """Test activate_service method."""

    def test_activate_service_success(self, db, provider_with_profile, plumbing_category):
        """Test successful service activation."""
        service = ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title="Test Service",
            description="Description",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
            is_active=False,
        )

        activated = ServiceManagementService.activate_service(str(service.id))

        assert activated.is_active is True

    def test_activate_service_not_found(self, db):
        """Test activating non-existent service."""
        import uuid

        fake_id = str(uuid.uuid4())

        with pytest.raises(NotFoundError):
            ServiceManagementService.activate_service(fake_id)


class TestGetProviderServices:
    """Test get_provider_services method."""

    def test_get_provider_services_active_only(self, db, provider_with_profile, plumbing_category):
        """Test getting only active services."""
        # Create active service
        ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title="Active Service",
            description="Description",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
            is_active=True,
        )

        # Create inactive service
        ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title="Inactive Service",
            description="Description",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
            is_active=False,
        )

        services = ServiceManagementService.get_provider_services(
            str(provider_with_profile.id), active_only=True
        )

        assert services.count() == 1
        assert services.first().is_active is True

    def test_get_provider_services_all(self, db, provider_with_profile, plumbing_category):
        """Test getting all services including inactive."""
        # Create active service
        ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title="Active Service",
            description="Description",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
            is_active=True,
        )

        # Create inactive service
        ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title="Inactive Service",
            description="Description",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
            is_active=False,
        )

        services = ServiceManagementService.get_provider_services(
            str(provider_with_profile.id), active_only=False
        )

        assert services.count() == 2

    def test_get_provider_services_empty(self, db, provider_with_profile):
        """Test getting services when provider has none."""
        services = ServiceManagementService.get_provider_services(str(provider_with_profile.id))

        assert services.count() == 0

    def test_get_provider_services_ordered(self, db, provider_with_profile, plumbing_category):
        """Test that services are ordered by created_at descending."""
        import time

        # Create services with slight delay
        service1 = ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title="First Service",
            description="Description",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
        )

        time.sleep(0.01)

        service2 = ProviderService.objects.create(
            provider=provider_with_profile,
            category=plumbing_category,
            title="Second Service",
            description="Description",
            price_type="FIXED",
            price_amount=Decimal("100.00"),
        )

        services = ServiceManagementService.get_provider_services(str(provider_with_profile.id))

        # Most recent should be first
        assert services.first().id == service2.id


class TestServiceManagementTransactions:
    """Test that service operations use database transactions."""

    def test_add_service_rollback_on_error(self, db, provider_with_profile):
        """Test that service creation rolls back on error."""
        initial_count = ProviderService.objects.count()

        # Try to create service with invalid price
        try:
            ServiceManagementService.add_service(
                provider_id=str(provider_with_profile.id),
                title="Test Service",
                description="Test",
                price_type="FIXED",
                price_amount=Decimal("0.00"),  # Invalid
            )
        except CustomValidationError:
            pass

        # Service should not be created
        assert ProviderService.objects.count() == initial_count
