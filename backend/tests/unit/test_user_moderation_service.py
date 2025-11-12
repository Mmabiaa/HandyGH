"""
Unit tests for UserModerationService.
"""

import pytest
from apps.admin_dashboard.services import UserModerationService
from apps.users.models import User
from apps.authentication.models import RefreshToken


@pytest.mark.django_db
class TestUserModerationService:
    """Test UserModerationService methods."""
    
    def test_suspend_user(self, customer_user):
        """Test suspending a user."""
        assert customer_user.is_active is True
        
        result = UserModerationService.suspend_user(
            user_id=str(customer_user.id),
            reason='Test suspension'
        )
        
        assert result['success'] is True
        assert 'suspended' in result['message'].lower()
        
        # Verify user is suspended
        customer_user.refresh_from_db()
        assert customer_user.is_active is False
    
    def test_suspend_already_suspended_user(self, customer_user):
        """Test suspending an already suspended user."""
        # Suspend user first
        customer_user.deactivate()
        
        result = UserModerationService.suspend_user(
            user_id=str(customer_user.id),
            reason='Test suspension'
        )
        
        assert result['success'] is False
        assert 'already suspended' in result['message'].lower()
    
    def test_suspend_user_revokes_sessions(self, customer_user):
        """Test that suspending a user revokes all sessions."""
        from apps.authentication.services import JWTService
        
        # Create some refresh tokens
        JWTService.create_tokens(customer_user)
        JWTService.create_tokens(customer_user)
        
        assert RefreshToken.objects.filter(user=customer_user).count() == 2
        
        result = UserModerationService.suspend_user(
            user_id=str(customer_user.id),
            reason='Test suspension'
        )
        
        assert result['success'] is True
        
        # Verify all tokens are revoked
        assert RefreshToken.objects.filter(user=customer_user).count() == 0
    
    def test_suspend_nonexistent_user(self):
        """Test suspending a non-existent user."""
        import uuid
        
        with pytest.raises(User.DoesNotExist):
            UserModerationService.suspend_user(
                user_id=str(uuid.uuid4()),
                reason='Test suspension'
            )
    
    def test_activate_user(self, customer_user):
        """Test activating a suspended user."""
        # Suspend user first
        customer_user.deactivate()
        assert customer_user.is_active is False
        
        result = UserModerationService.activate_user(
            user_id=str(customer_user.id)
        )
        
        assert result['success'] is True
        assert 'activated' in result['message'].lower()
        
        # Verify user is activated
        customer_user.refresh_from_db()
        assert customer_user.is_active is True
    
    def test_activate_already_active_user(self, customer_user):
        """Test activating an already active user."""
        assert customer_user.is_active is True
        
        result = UserModerationService.activate_user(
            user_id=str(customer_user.id)
        )
        
        assert result['success'] is False
        assert 'already active' in result['message'].lower()
    
    def test_activate_nonexistent_user(self):
        """Test activating a non-existent user."""
        import uuid
        
        with pytest.raises(User.DoesNotExist):
            UserModerationService.activate_user(
                user_id=str(uuid.uuid4())
            )
    
    def test_revoke_all_sessions(self, customer_user):
        """Test revoking all sessions for a user."""
        from apps.authentication.services import JWTService
        
        # Create multiple refresh tokens
        JWTService.create_tokens(customer_user)
        JWTService.create_tokens(customer_user)
        JWTService.create_tokens(customer_user)
        
        assert RefreshToken.objects.filter(user=customer_user).count() == 3
        
        result = UserModerationService.revoke_all_sessions(
            user_id=str(customer_user.id)
        )
        
        assert result['success'] is True
        assert result['revoked_count'] == 3
        
        # Verify all tokens are deleted
        assert RefreshToken.objects.filter(user=customer_user).count() == 0
    
    def test_revoke_all_sessions_no_sessions(self, customer_user):
        """Test revoking sessions when user has no active sessions."""
        assert RefreshToken.objects.filter(user=customer_user).count() == 0
        
        result = UserModerationService.revoke_all_sessions(
            user_id=str(customer_user.id)
        )
        
        assert result['success'] is True
        assert result['revoked_count'] == 0
