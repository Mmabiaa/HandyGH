import { useCallback } from 'react';
import { useAuthStore } from '../../../core/store/authStore';
import { AuthService } from '../../../core/api/services/AuthService';
import type { User } from '../../../core/store/types';

/**
 * useAuth Hook
 * Provides authentication state and actions
 * Requirement 1.5, 1.7: Authentication state management
 */
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout: storeLogout,
    updateUser,
    setLoading,
  } = useAuthStore();

  /**
   * Login user with credentials
   * Stores tokens and updates auth state
   */
  const loginUser = useCallback(
    async (user: User, accessToken: string, refreshToken: string) => {
      try {
        setLoading(true);
        await login(user, accessToken, refreshToken);
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [login, setLoading]
  );

  /**
   * Logout user
   * Clears tokens and auth state
   */
  const logoutUser = useCallback(async () => {
    try {
      setLoading(true);
      await AuthService.logout();
      await storeLogout();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [storeLogout, setLoading]);

  /**
   * Update user profile
   */
  const updateUserProfile = useCallback(
    (updates: Partial<User>) => {
      updateUser(updates);
    },
    [updateUser]
  );

  /**
   * Check if user is authenticated
   */
  const checkAuthentication = useCallback(async () => {
    try {
      setLoading(true);
      const authenticated = await AuthService.isAuthenticated();
      return authenticated;
    } catch (error) {
      console.error('Check authentication error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,

    // Actions
    login: loginUser,
    logout: logoutUser,
    updateUser: updateUserProfile,
    checkAuthentication,
  };
};
