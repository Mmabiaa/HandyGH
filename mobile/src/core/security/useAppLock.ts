/**
 * useAppLock Hook
 *
 * Manages app lock state based on biometric authentication settings.
 * Shows AppLockScreen when biometric authentication is enabled.
 *
 * Requirements: 13.5
 */

import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAppSettingsStore } from '../store/appSettingsStore';

export const useAppLock = () => {
  const { preferences } = useAppSettingsStore();
  const [isLocked, setIsLocked] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    // Lock app on mount if biometric is enabled
    if (preferences.biometricEnabled) {
      setIsLocked(true);
    }

    // Listen for app state changes
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [preferences.biometricEnabled]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // Lock app when it goes to background and comes back to foreground
    if (
      preferences.biometricEnabled &&
      appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      setIsLocked(true);
    }

    setAppState(nextAppState);
  };

  const unlock = () => {
    setIsLocked(false);
  };

  return {
    isLocked: preferences.biometricEnabled && isLocked,
    unlock,
  };
};
