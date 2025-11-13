"""
Unit tests for UserService.
"""

import pytest

from apps.users.models import User
from apps.users.services import UserService


@pytest.mark.django_db
class TestUserService:
    """Test UserService methods."""

    def test_get_user_by_id(self, customer_user):
        """Test getting user by ID."""
        user = UserService.get_user(customer_user.id)

        assert user is not None
        assert user.id == customer_user.id
        assert user.phone == customer_user.phone

    def test_get_user_not_found(self):
        """Test getting non-existent user."""
        import uuid

        from core.exceptions import NotFoundError

        with pytest.raises(NotFoundError):
            UserService.get_user(uuid.uuid4())

    def test_update_user_name(self, customer_user):
        """Test updating user name."""
        new_name = "Updated Name"
        updated_user = UserService.update_user(customer_user.id, name=new_name)

        assert updated_user.name == new_name

        # Verify in database
        user = User.objects.get(id=customer_user.id)
        assert user.name == new_name

    def test_update_user_email(self, customer_user):
        """Test updating user email."""
        new_email = "newemail@example.com"
        updated_user = UserService.update_user(customer_user.id, email=new_email)

        assert updated_user.email == new_email

    def test_update_user_profile(self, customer_user):
        """Test updating user profile via ProfileService."""
        from apps.users.services import ProfileService

        profile_data = {"address": "123 Test Street", "preferences": {"language": "en"}}

        updated_profile = ProfileService.update_profile(customer_user.id, **profile_data)

        assert updated_profile.address == profile_data["address"]
        assert updated_profile.preferences == profile_data["preferences"]

    def test_deactivate_user(self, customer_user):
        """Test deactivating user."""
        assert customer_user.is_active is True

        UserService.deactivate_user(customer_user.id)

        # Verify in database
        user = User.objects.get(id=customer_user.id)
        assert user.is_active is False

    def test_validate_role_change_valid(self, customer_user):
        """Test valid role change from customer to provider."""
        result = UserService.validate_role_change(customer_user, "PROVIDER")
        assert result is True

    def test_validate_role_change_invalid_role(self, customer_user):
        """Test role change with invalid role."""
        from core.exceptions import ValidationError

        with pytest.raises(ValidationError):
            UserService.validate_role_change(customer_user, "INVALID")

    def test_validate_role_change_admin_to_customer(self, admin_user):
        """Test that admin cannot be changed to customer."""
        from core.exceptions import ValidationError

        with pytest.raises(ValidationError):
            UserService.validate_role_change(admin_user, "CUSTOMER")

    def test_validate_role_change_customer_to_admin(self, customer_user):
        """Test that customer cannot be changed to admin."""
        from core.exceptions import ValidationError

        with pytest.raises(ValidationError):
            UserService.validate_role_change(customer_user, "ADMIN")
