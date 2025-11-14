import { useEffect, useCallback, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { TokenManager } from '../../../core/api/tokenManager';
import { useAuth } from './useAuth';

/**
 * useSession Hook
 * Manages user session and automatic logout
 * Requirement 16.7: Session expiration handling
 */
export const useSession = () => {
  const { logout, isAuthenticated } = useAuth();
  const [sessionValid, setSessionValid] = useState(true);

  /**
   * Check session validity
   */
  const checkSession = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const hasValidTokens = await TokenManager.hasValidTokens();

      if (!hasValidTokens) {
        setSessionValid(false);
        await logout();
      } else {
        setSessionValid(true);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setSessionValid(false);
      await logout();
    }
  }, [isAuthenticated, logout]);

  /**
   * Handle app state change
   * Check session when app comes to foreground
   */
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkSession();
      }
    },
    [checkSession]
  );

  /**
   * Set up session monitoring
   */
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Check session immediately
    checkSession();

    // Set up app state listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Set up periodic session check (every 5 minutes)
    const intervalId = setInterval(checkSession, 5 * 60 * 1000);

    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
  }, [isAuthenticated, checkSession, handleAppStateChange]);

  return {
    sessionValid,
    checkSession,
  };
};
