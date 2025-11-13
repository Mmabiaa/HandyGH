"""
Unit tests for ProviderService.

Tests cover:
- Provider CRUD operations
- Provider verification workflow
- Validation logic
- Error handling
"""

from decimal import Decimal

import pytest

from apps.providers.models import Provider, ServiceCategory
from apps.providers.services import ProviderService
from apps.users.models import User
from core.exceptions import NotFoundError
from core.exceptions import ValidationError as CustomValidationError


@pytest.fixture
def plumbing_category(db):
    """Create a plumbing service category."""
    return ServiceCategory.objects.create(
        name="Plumbing", slug="plumbing", description="Plumbing services", is_active=True
    )


@pytest.fixture
def electrical_category(db):
    """Create an electrical service category."""
    return ServiceCategory.objects.create(
        name="Electrical", slug="electrical", description="Electrical services", is_active=True
    )


@pytest.fixture
def inactive_category(db):
    """Create an inactive service category."""
    return ServiceCategory.objects.create(
        name="Inactive Category", slug="inactive", description="Inactive category", is_active=False
    )


class TestGetProvider:
    """Test get_provider method."""

    def test_get_provider_success(self, db, provider_user):
        """Test successful provider retrieval."""
        # Create provider
        provider = Provider.objects.create(
            user=provider_user, business_name="Test Plumbing", is_active=True
        )

        result = ProviderService.get_provider(str(provider.id))

        assert result.id == provider.id
        assert result.business_name == "Test Plumbing"

    def test_get_provider_not_found(self, db):
        """Test get_provider with non-existent ID."""
        import uuid

        fake_id = str(uuid.uuid4())

        with pytest.raises(NotFoundError) as exc_info:
            ProviderService.get_provider(fake_id)

        assert "not found" in str(exc_info.value).lower()

    def test_get_provider_includes_user(self, db, provider_user):
        """Test that get_provider includes user data."""
        provider = Provider.objects.create(user=provider_user, business_name="Test Plumbing")

        result = ProviderService.get_provider(str(provider.id))

        # Should have user data loaded (select_related)
        assert result.user.id == provider_user.id
        assert result.user.name == provider_user.name


class TestGetProviderByUser:
    """Test get_provider_by_user method."""

    def test_get_provider_by_user_success(self, db, provider_user):
        """Test successful provider retrieval by user ID."""
        provider = Provider.objects.create(user=provider_user, business_name="Test Plumbing")

        result = ProviderService.get_provider_by_user(str(provider_user.id))

        assert result is not None
        assert result.id == provider.id

    def test_get_provider_by_user_not_found(self, db, customer_user):
        """Test get_provider_by_user when user has no provider profile."""
        result = ProviderService.get_provider_by_user(str(customer_user.id))

        assert result is None


class TestCreateProvider:
    """Test create_provider method."""

    def test_create_provider_success(self, db, provider_user, plumbing_category):
        """Test successful provider creation."""
        provider = ProviderService.create_provider(
            user=provider_user,
            business_name="Test Plumbing Services",
            categories=["plumbing"],
            latitude=Decimal("5.6037"),
            longitude=Decimal("-0.1870"),
            address="123 Test Street, Accra",
        )

        assert provider.id is not None
        assert provider.user == provider_user
        assert provider.business_name == "Test Plumbing Services"
        assert provider.categories == ["plumbing"]
        assert provider.latitude == Decimal("5.6037")
        assert provider.longitude == Decimal("-0.1870")
        assert provider.address == "123 Test Street, Accra"
        assert provider.verified is False
        assert provider.is_active is True

    def test_create_provider_minimal_data(self, db, provider_user):
        """Test provider creation with minimal data."""
        provider = ProviderService.create_provider(user=provider_user)

        assert provider.id is not None
        assert provider.user == provider_user
        assert provider.business_name == ""
        assert provider.categories == []
        assert provider.latitude is None
        assert provider.longitude is None

    def test_create_provider_multiple_categories(
        self, db, provider_user, plumbing_category, electrical_category
    ):
        """Test provider creation with multiple categories."""
        provider = ProviderService.create_provider(
            user=provider_user, categories=["plumbing", "electrical"]
        )

        assert "plumbing" in provider.categories
        assert "electrical" in provider.categories

    def test_create_provider_duplicate_user(self, db, provider_user):
        """Test that creating provider for user with existing profile fails."""
        # Create first provider
        ProviderService.create_provider(user=provider_user)

        # Try to create second provider for same user
        with pytest.raises(CustomValidationError) as exc_info:
            ProviderService.create_provider(user=provider_user)

        assert "already has a provider profile" in str(exc_info.value).lower()

    def test_create_provider_wrong_role(self, db, customer_user):
        """Test that creating provider for non-provider user fails."""
        with pytest.raises(CustomValidationError) as exc_info:
            ProviderService.create_provider(user=customer_user)

        assert "provider role" in str(exc_info.value).lower()

    def test_create_provider_invalid_category(self, db, provider_user, plumbing_category):
        """Test provider creation with invalid category."""
        with pytest.raises(CustomValidationError) as exc_info:
            ProviderService.create_provider(
                user=provider_user, categories=["plumbing", "invalid_category"]
            )

        assert "invalid categories" in str(exc_info.value).lower()
        assert "invalid_category" in str(exc_info.value)

    def test_create_provider_inactive_category(self, db, provider_user, inactive_category):
        """Test provider creation with inactive category."""
        with pytest.raises(CustomValidationError) as exc_info:
            ProviderService.create_provider(user=provider_user, categories=["inactive"])

        assert "invalid categories" in str(exc_info.value).lower()


class TestUpdateProvider:
    """Test update_provider method."""

    def test_update_provider_business_name(self, db, provider_user):
        """Test updating provider business name."""
        provider = Provider.objects.create(user=provider_user, business_name="Old Name")

        updated = ProviderService.update_provider(str(provider.id), business_name="New Name")

        assert updated.business_name == "New Name"

    def test_update_provider_location(self, db, provider_user):
        """Test updating provider location."""
        provider = Provider.objects.create(user=provider_user, latitude=None, longitude=None)

        updated = ProviderService.update_provider(
            str(provider.id),
            latitude=Decimal("5.6037"),
            longitude=Decimal("-0.1870"),
            address="New Address",
        )

        assert updated.latitude == Decimal("5.6037")
        assert updated.longitude == Decimal("-0.1870")
        assert updated.address == "New Address"

    def test_update_provider_categories(
        self, db, provider_user, plumbing_category, electrical_category
    ):
        """Test updating provider categories."""
        provider = Provider.objects.create(user=provider_user, categories=["plumbing"])

        updated = ProviderService.update_provider(
            str(provider.id), categories=["plumbing", "electrical"]
        )

        assert "plumbing" in updated.categories
        assert "electrical" in updated.categories

    def test_update_provider_is_active(self, db, provider_user):
        """Test updating provider active status."""
        provider = Provider.objects.create(user=provider_user, is_active=True)

        updated = ProviderService.update_provider(str(provider.id), is_active=False)

        assert updated.is_active is False

    def test_update_provider_not_found(self, db):
        """Test updating non-existent provider."""
        import uuid

        fake_id = str(uuid.uuid4())

        with pytest.raises(NotFoundError):
            ProviderService.update_provider(fake_id, business_name="Test")

    def test_update_provider_invalid_category(self, db, provider_user, plumbing_category):
        """Test updating provider with invalid category."""
        provider = Provider.objects.create(user=provider_user, categories=["plumbing"])

        with pytest.raises(CustomValidationError) as exc_info:
            ProviderService.update_provider(str(provider.id), categories=["invalid_category"])

        assert "invalid categories" in str(exc_info.value).lower()

    def test_update_provider_ignores_protected_fields(self, db, provider_user):
        """Test that update ignores protected fields like verified."""
        provider = Provider.objects.create(user=provider_user, verified=False)

        # Try to update verified field (should be ignored)
        updated = ProviderService.update_provider(
            str(provider.id), verified=True, business_name="New Name"  # This should be ignored
        )

        assert updated.verified is False  # Should not change
        assert updated.business_name == "New Name"  # Should change


class TestVerifyProvider:
    """Test verify_provider method."""

    def test_verify_provider_success(self, db, provider_user):
        """Test successful provider verification."""
        provider = Provider.objects.create(user=provider_user, verified=False)

        verified = ProviderService.verify_provider(
            str(provider.id), verification_doc_url="https://example.com/doc.pdf"
        )

        assert verified.verified is True
        assert verified.verification_doc_url == "https://example.com/doc.pdf"

    def test_verify_provider_without_doc_url(self, db, provider_user):
        """Test provider verification without document URL."""
        provider = Provider.objects.create(user=provider_user, verified=False)

        verified = ProviderService.verify_provider(str(provider.id))

        assert verified.verified is True

    def test_verify_provider_not_found(self, db):
        """Test verifying non-existent provider."""
        import uuid

        fake_id = str(uuid.uuid4())

        with pytest.raises(NotFoundError):
            ProviderService.verify_provider(fake_id)


class TestUnverifyProvider:
    """Test unverify_provider method."""

    def test_unverify_provider_success(self, db, provider_user):
        """Test successful provider unverification."""
        provider = Provider.objects.create(user=provider_user, verified=True)

        unverified = ProviderService.unverify_provider(str(provider.id))

        assert unverified.verified is False

    def test_unverify_provider_not_found(self, db):
        """Test unverifying non-existent provider."""
        import uuid

        fake_id = str(uuid.uuid4())

        with pytest.raises(NotFoundError):
            ProviderService.unverify_provider(fake_id)


class TestProviderServiceTransactions:
    """Test that provider operations use database transactions."""

    def test_create_provider_rollback_on_error(self, db, provider_user, plumbing_category):
        """Test that provider creation rolls back on error."""
        initial_count = Provider.objects.count()

        # Try to create provider with invalid category
        try:
            ProviderService.create_provider(user=provider_user, categories=["plumbing", "invalid"])
        except CustomValidationError:
            pass

        # Provider should not be created
        assert Provider.objects.count() == initial_count

    def test_update_provider_rollback_on_error(self, db, provider_user, plumbing_category):
        """Test that provider update rolls back on error."""
        provider = Provider.objects.create(
            user=provider_user, business_name="Original Name", categories=["plumbing"]
        )

        # Try to update with invalid category
        try:
            ProviderService.update_provider(
                str(provider.id), business_name="New Name", categories=["invalid"]
            )
        except CustomValidationError:
            pass

        # Provider should not be updated
        provider.refresh_from_db()
        assert provider.business_name == "Original Name"
