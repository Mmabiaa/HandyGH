"""
Serializers for users app.

Design Decisions:
- Separate serializers for different use cases (list, detail, create, update)
- Password write-only for security
- Role-based field visibility
- Nested profile serializer for convenience
"""

from rest_framework import serializers
from .models import User, UserProfile
from core.validators import validate_ghana_phone


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile model.
    """
    
    class Meta:
        model = UserProfile
        fields = [
            'profile_picture',
            'address',
            'date_of_birth',
            'preferences',
        ]
        extra_kwargs = {
            'preferences': {'required': False},
        }


class UserSerializer(serializers.ModelSerializer):
    """
    Basic serializer for User model.
    
    Used for listing users and basic user information.
    """
    
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'phone',
            'email',
            'name',
            'role',
            'is_active',
            'created_at',
            'profile',
        ]
        read_only_fields = ['id', 'created_at']


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for User model.
    
    Includes all fields and nested profile information.
    Used for retrieving single user details.
    """
    
    profile = UserProfileSerializer()
    
    class Meta:
        model = User
        fields = [
            'id',
            'phone',
            'email',
            'name',
            'role',
            'is_active',
            'created_at',
            'updated_at',
            'last_login',
            'profile',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login']


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new users.
    
    Includes password field for user creation.
    """
    
    password = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'},
        help_text='Password (optional for OTP-only users)'
    )
    
    class Meta:
        model = User
        fields = [
            'phone',
            'email',
            'name',
            'role',
            'password',
        ]
        extra_kwargs = {
            'phone': {'validators': [validate_ghana_phone]},
            'email': {'required': False},
            'role': {'required': False},
        }
    
    def create(self, validated_data):
        """
        Create user with hashed password.
        
        Args:
            validated_data: Validated user data
            
        Returns:
            Created User instance
        """
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        
        if password:
            user.set_password(password)
            user.save()
        
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user information.
    
    Allows updating name, email, and profile information.
    Role and phone cannot be changed after creation.
    """
    
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = [
            'name',
            'email',
            'profile',
        ]
        extra_kwargs = {
            'email': {'required': False},
        }
    
    def update(self, instance, validated_data):
        """
        Update user and profile information.
        
        Args:
            instance: User instance to update
            validated_data: Validated update data
            
        Returns:
            Updated User instance
        """
        profile_data = validated_data.pop('profile', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update profile if provided
        if profile_data and hasattr(instance, 'profile'):
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing user password.
    """
    
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        min_length=8
    )
    
    def validate_old_password(self, value):
        """
        Validate that old password is correct.
        
        Args:
            value: Old password
            
        Returns:
            Validated password
            
        Raises:
            ValidationError: If old password is incorrect
        """
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect')
        return value
    
    def save(self, **kwargs):
        """
        Save new password.
        
        Returns:
            Updated user instance
        """
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
