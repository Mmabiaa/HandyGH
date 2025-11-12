"""
Unit tests for JWTService.

Tests token creation, refresh, and revocation.
"""

import pytest
from django.utils import timezone
from datetime import timedelta
from apps.authentication.services import JWTService
from apps.authentication.models import RefreshToken
from core.exceptions import AuthenticationError
from core.utils import hash_value


@pytest.mark.django_db
class TestJWTService:
    """Test JWTService functionality."""
    
    def test_create_tokens_success(self, customer_user):
        """Test successful token creation."""
        tokens = JWTService.create_tokens(customer_user)
        
        assert 'access_token' in tokens
        assert 'refresh_token' in tokens
        assert tokens['token_type'] == 'Bearer'
        assert 'expires_in' in tokens
        assert 'user' in tokens
        
        # Verify user data
        assert tokens['user']['id'] == str(customer_user.id)
        assert tokens['user']['phone'] == customer_user.phone
        assert tokens['user']['role'] == customer_user.role
    
    def test_create_tokens_stores_refresh_token(self, customer_user):
        """Test that refresh token is stored in database."""
        tokens = JWTService.create_tokens(customer_user)
        
        # Verify refresh token was stored
        token_hash = hash_value(tokens['refresh_token'])
        refresh_token = RefreshToken.objects.get(token_hash=token_hash)
        
        assert refresh_token is not None
        assert refresh_token.user == customer_user
        assert not refresh_token.revoked
        assert refresh_token.expires_at > timezone.now()
    
    def test_create_tokens_with_request_metadata(self, customer_user):
        """Test token creation with request metadata."""
        from unittest.mock import Mock
        
        # Mock request
        request = Mock()
        request.META = {
            'HTTP_USER_AGENT': 'Mozilla/5.0',
            'REMOTE_ADDR': '127.0.0.1'
        }
        
        tokens = JWTService.create_tokens(customer_user, request)
        
        # Verify metadata was stored
        token_hash = hash_value(tokens['refresh_token'])
        refresh_token = RefreshToken.objects.get(token_hash=token_hash)
        
        assert refresh_token.user_agent == 'Mozilla/5.0'
        assert refresh_token.ip_address == '127.0.0.1'
    
    def test_refresh_tokens_success(self, customer_user):
        """Test successful token refresh."""
        # Create initial tokens
        initial_tokens = JWTService.create_tokens(customer_user)
        
        # Refresh tokens
        new_tokens = JWTService.refresh_tokens(initial_tokens['refresh_token'])
        
        assert 'access_token' in new_tokens
        assert 'refresh_token' in new_tokens
        assert new_tokens['access_token'] != initial_tokens['access_token']
        assert new_tokens['refresh_token'] != initial_tokens['refresh_token']
    
    def test_refresh_tokens_revokes_old_token(self, customer_user):
        """Test that refreshing revokes the old token."""
        # Create initial tokens
        initial_tokens = JWTService.create_tokens(customer_user)
        initial_token_hash = hash_value(initial_tokens['refresh_token'])
        
        # Refresh tokens
        JWTService.refresh_tokens(initial_tokens['refresh_token'])
        
        # Old token should be revoked
        old_token = RefreshToken.objects.get(token_hash=initial_token_hash)
        assert old_token.revoked is True
    
    def test_refresh_tokens_invalid_token(self):
        """Test token refresh with invalid token."""
        with pytest.raises(AuthenticationError) as exc_info:
            JWTService.refresh_tokens('invalid_token_string')
        
        assert 'Invalid refresh token' in str(exc_info.value)
    
    def test_refresh_tokens_expired(self, customer_user):
        """Test token refresh with expired token."""
        # Create token
        tokens = JWTService.create_tokens(customer_user)
        token_hash = hash_value(tokens['refresh_token'])
        
        # Manually expire the token
        refresh_token = RefreshToken.objects.get(token_hash=token_hash)
        refresh_token.expires_at = timezone.now() - timedelta(days=1)
        refresh_token.save()
        
        with pytest.raises(AuthenticationError) as exc_info:
            JWTService.refresh_tokens(tokens['refresh_token'])
        
        assert 'expired' in str(exc_info.value).lower()
    
    def test_refresh_tokens_already_revoked(self, customer_user):
        """Test token refresh with already revoked token."""
        # Create and revoke token
        tokens = JWTService.create_tokens(customer_user)
        JWTService.revoke_token(tokens['refresh_token'])
        
        with pytest.raises(AuthenticationError):
            JWTService.refresh_tokens(tokens['refresh_token'])
    
    def test_revoke_token_success(self, customer_user):
        """Test successful token revocation."""
        tokens = JWTService.create_tokens(customer_user)
        
        result = JWTService.revoke_token(tokens['refresh_token'])
        
        assert result is True
        
        # Verify token is revoked in database
        token_hash = hash_value(tokens['refresh_token'])
        refresh_token = RefreshToken.objects.get(token_hash=token_hash)
        assert refresh_token.revoked is True
    
    def test_revoke_token_nonexistent(self):
        """Test revoking non-existent token."""
        result = JWTService.revoke_token('nonexistent_token')
        
        assert result is False
    
    def test_revoke_all_tokens(self, customer_user):
        """Test revoking all tokens for a user."""
        # Create multiple tokens
        tokens1 = JWTService.create_tokens(customer_user)
        tokens2 = JWTService.create_tokens(customer_user)
        tokens3 = JWTService.create_tokens(customer_user)
        
        # Revoke all
        count = JWTService.revoke_all_tokens(customer_user)
        
        assert count == 3
        
        # Verify all tokens are revoked
        active_tokens = RefreshToken.objects.filter(
            user=customer_user,
            revoked=False
        ).count()
        assert active_tokens == 0
    
    def test_revoke_all_tokens_no_active_tokens(self, customer_user):
        """Test revoking all tokens when user has no active tokens."""
        count = JWTService.revoke_all_tokens(customer_user)
        
        assert count == 0
    
    def test_multiple_users_token_isolation(self, customer_user, provider_user):
        """Test that tokens are isolated between users."""
        # Create tokens for both users
        customer_tokens = JWTService.create_tokens(customer_user)
        provider_tokens = JWTService.create_tokens(provider_user)
        
        # Revoke customer tokens
        JWTService.revoke_all_tokens(customer_user)
        
        # Provider tokens should still be valid
        provider_token_hash = hash_value(provider_tokens['refresh_token'])
        provider_refresh = RefreshToken.objects.get(token_hash=provider_token_hash)
        assert not provider_refresh.revoked
