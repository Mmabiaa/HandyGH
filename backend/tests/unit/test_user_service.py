"""
Unit tests for UserService.
"""

import pytest
from apps.users.services import UserService
from apps.users.models import User


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
        updated_user = UserService.update_user(
            customer_user.id,
            name=new_name
        )
        
        assert updated_user.name == new_name
        
        # Verify in database
        user = User.objects.get(id=customer_user.id)
        assert user.name == new_name
    
    def test_update_user_email(self, customer_user):
        """Test updating user email."""
        new_email = "newemail@example.com"
        updated_user = UserService.update_user(
            customer_user.id,
            email=new_email
        )
        
        assert updated_user.email == new_email
    
    def test_update_user_profile(self, customer_user):
        """Test updating user profile via ProfileService."""
        from apps.users.services import ProfileService
        
        profile_data = {
            'address': '123 Test Street',
            'preferences': {'language': 'en'}
        }
        
        updated_profile = ProfileService.update_profile(
            customer_user.id,
            **profile_data
        )
        
        assert updated_profile.address == profile_data['address']
        assert updated_profile.preferences == profile_data['preferences']
    
    def test_deactivate_user(self, customer_user):
        """Test deactivating user."""
        assert customer_user.is_active is True
        
        UserService.deactivate_user(customer_user.id)
        
        # Verify in database
        user = User.objects.get(id=customer_user.id)
        assert user.is_active is False
    
    def test_validate_role_customer(self):
        """Test role validation for customer."""
        assert UserService.validate_role('CUSTOMER') is True
    
    def test_validate_role_provider(self):
        """Test role validation for provider."""
        assert UserService.validate_role('PROVIDER') is True
    
    def test_validate_role_admin(self):
        """Test role validation for admin."""
        assert UserService.validate_role('ADMIN') is True
    
    def test_validate_role_invalid(self):
        """Test role validation for invalid role."""
        assert UserService.validate_role('INVALID') is False
