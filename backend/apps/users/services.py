"""
User service layer for HandyGH.

Handles business logic for user management including CRUD operations,
role validation, and profile management.

Design Decisions:
- Service layer separates business logic from views
- Centralized user operations for consistency
- Role validation ensures data integrity
"""

from typing import Optional, Dict, Any
from django.db import transaction
from django.core.exceptions import ValidationError
from .models import User, UserProfile
from core.exceptions import NotFoundError, ValidationError as CustomValidationError


class UserService:
    """
    Service class for user management operations.
    
    Provides methods for creating, retrieving, updating, and deactivating users.
    Handles role validation and profile management.
    """
    
    @staticmethod
    def get_user(user_id: str) -> User:
        """
        Get user by ID.
        
        Args:
            user_id: UUID of the user
            
        Returns:
            User instance
            
        Raises:
            NotFoundError: If user doesn't exist
        """
        try:
            return User.objects.select_related('profile').get(id=user_id)
        except User.DoesNotExist:
            raise NotFoundError(f"User with id {user_id} not found")
    
    @staticmethod
    def get_user_by_phone(phone: str) -> Optional[User]:
        """
        Get user by phone number.
        
        Args:
            phone: Phone number
            
        Returns:
            User instance or None if not found
        """
        try:
            return User.objects.select_related('profile').get(phone=phone)
        except User.DoesNotExist:
            return None
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[User]:
        """
        Get user by email address.
        
        Args:
            email: Email address
            
        Returns:
            User instance or None if not found
        """
        try:
            return User.objects.select_related('profile').get(email=email)
        except User.DoesNotExist:
            return None
    
    @staticmethod
    @transaction.atomic
    def create_user(phone: str, role: str = 'CUSTOMER', **kwargs) -> User:
        """
        Create a new user with profile.
        
        Args:
            phone: Phone number (required)
            role: User role (CUSTOMER, PROVIDER, ADMIN)
            **kwargs: Additional user fields (name, email, etc.)
            
        Returns:
            Created User instance
            
        Raises:
            CustomValidationError: If validation fails
        """
        # Validate role
        if role not in dict(User.ROLE_CHOICES):
            raise CustomValidationError(
                f"Invalid role: {role}. Must be one of: {', '.join(dict(User.ROLE_CHOICES).keys())}"
            )
        
        # Check if user already exists
        if User.objects.filter(phone=phone).exists():
            raise CustomValidationError(f"User with phone {phone} already exists")
        
        # Check email uniqueness if provided
        email = kwargs.get('email')
        if email and User.objects.filter(email=email).exists():
            raise CustomValidationError(f"User with email {email} already exists")
        
        # Create user
        user = User.objects.create_user(
            phone=phone,
            role=role,
            **kwargs
        )
        
        # Create associated profile
        UserProfile.objects.create(user=user)
        
        return user
    
    @staticmethod
    @transaction.atomic
    def update_user(user_id: str, **kwargs) -> User:
        """
        Update user information.
        
        Args:
            user_id: UUID of the user
            **kwargs: Fields to update
            
        Returns:
            Updated User instance
            
        Raises:
            NotFoundError: If user doesn't exist
            CustomValidationError: If validation fails
        """
        user = UserService.get_user(user_id)
        
        # Validate role if being updated
        if 'role' in kwargs:
            new_role = kwargs['role']
            if new_role not in dict(User.ROLE_CHOICES):
                raise CustomValidationError(
                    f"Invalid role: {new_role}. Must be one of: {', '.join(dict(User.ROLE_CHOICES).keys())}"
                )
        
        # Check email uniqueness if being updated
        if 'email' in kwargs and kwargs['email']:
            email = kwargs['email']
            if User.objects.filter(email=email).exclude(id=user_id).exists():
                raise CustomValidationError(f"User with email {email} already exists")
        
        # Update allowed fields
        allowed_fields = ['name', 'email', 'role']
        for field, value in kwargs.items():
            if field in allowed_fields:
                setattr(user, field, value)
        
        user.save()
        return user
    
    @staticmethod
    def deactivate_user(user_id: str) -> User:
        """
        Deactivate a user account.
        
        Args:
            user_id: UUID of the user
            
        Returns:
            Deactivated User instance
            
        Raises:
            NotFoundError: If user doesn't exist
        """
        user = UserService.get_user(user_id)
        user.deactivate()
        return user
    
    @staticmethod
    def activate_user(user_id: str) -> User:
        """
        Activate a user account.
        
        Args:
            user_id: UUID of the user
            
        Returns:
            Activated User instance
            
        Raises:
            NotFoundError: If user doesn't exist
        """
        user = UserService.get_user(user_id)
        user.activate()
        return user
    
    @staticmethod
    def validate_role_change(user: User, new_role: str) -> bool:
        """
        Validate if a role change is allowed.
        
        Args:
            user: User instance
            new_role: New role to assign
            
        Returns:
            True if role change is valid
            
        Raises:
            CustomValidationError: If role change is not allowed
        """
        # Validate new role exists
        if new_role not in dict(User.ROLE_CHOICES):
            raise CustomValidationError(f"Invalid role: {new_role}")
        
        # Don't allow changing from ADMIN to other roles (security)
        if user.role == 'ADMIN' and new_role != 'ADMIN':
            raise CustomValidationError("Cannot change admin role to non-admin")
        
        # Don't allow changing to ADMIN (must be done via superuser)
        if user.role != 'ADMIN' and new_role == 'ADMIN':
            raise CustomValidationError("Cannot change to admin role via this method")
        
        return True


class ProfileService:
    """
    Service class for user profile management.
    
    Handles profile-specific operations separate from core user data.
    """
    
    @staticmethod
    def get_profile(user_id: str) -> UserProfile:
        """
        Get user profile.
        
        Args:
            user_id: UUID of the user
            
        Returns:
            UserProfile instance
            
        Raises:
            NotFoundError: If profile doesn't exist
        """
        try:
            return UserProfile.objects.select_related('user').get(user_id=user_id)
        except UserProfile.DoesNotExist:
            raise NotFoundError(f"Profile for user {user_id} not found")
    
    @staticmethod
    def update_profile(user_id: str, **kwargs) -> UserProfile:
        """
        Update user profile information.
        
        Args:
            user_id: UUID of the user
            **kwargs: Profile fields to update
            
        Returns:
            Updated UserProfile instance
            
        Raises:
            NotFoundError: If profile doesn't exist
        """
        profile = ProfileService.get_profile(user_id)
        
        # Update allowed fields
        allowed_fields = ['profile_picture', 'address', 'date_of_birth', 'preferences']
        for field, value in kwargs.items():
            if field in allowed_fields:
                setattr(profile, field, value)
        
        profile.save()
        return profile
    
    @staticmethod
    def update_preferences(user_id: str, preferences: Dict[str, Any]) -> UserProfile:
        """
        Update user preferences.
        
        Args:
            user_id: UUID of the user
            preferences: Dictionary of preferences to update
            
        Returns:
            Updated UserProfile instance
        """
        profile = ProfileService.get_profile(user_id)
        
        # Merge with existing preferences
        current_prefs = profile.preferences or {}
        current_prefs.update(preferences)
        profile.preferences = current_prefs
        
        profile.save()
        return profile
