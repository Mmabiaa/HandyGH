/**
 * App Lock Screen
 *
 * Displays when biometric authentication is enabled and app is opened.
 * Requires biometric authentication to unlock the app.
 *
 * Requirements: 13.5
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { BiometricAuth } from '../../../core/security';
import { Text, Button } from '../../../shared/components';
import { spacing } from '../../../core/theme/spacing';

interface AppLockScreenProps {
  onUnlock: () => void;
}

const AppLockScreen: React.FC<AppLockScreenProps> = ({ onUnlock }) => {
  const { theme } = useTheme();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometryTypeName, setBiometryTypeName] = useState('Biometric Authentication');

  useEffect(() => {
    // Get biometry type name
    BiometricAuth.getBiometryTypeName().then(setBiometryTypeName);

    // Automatically trigger authentication on mount
    handleAuthenticate();

    // Listen for app state changes
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // Trigger authentication when app comes to foreground
    if (nextAppState === 'active') {
      handleAuthenticate();
    }
  };

  const handleAuthenticate = async () => {
    if (isAuthenticating) return;

    try {
      setIsAuthenticating(true);

      const result = await BiometricAuth.authenticate(
        `Unlock HandyGH with ${biometryTypeName}`
      );

      if (result.success) {
        onUnlock();
      } else if (result.error && !result.error.includes('cancelled')) {
        Alert.alert('Authentication Failed', result.error);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Error', 'Failed to authenticate. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        {/* Lock Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text variant="h1" color="textOnPrimary">
            🔒
          </Text>
        </View>

        {/* Title */}
        <Text variant="h2" style={styles.title}>
          App Locked
        </Text>

        {/* Description */}
        <Text
          variant="body"
          color="textSecondary"
          style={styles.description}
        >
          Authenticate with {biometryTypeName} to unlock HandyGH
        </Text>

        {/* Authenticate Button */}
        <Button
          variant="primary"
          onPress={handleAuthenticate}
          loading={isAuthenticating}
          style={styles.button}
          accessibilityLabel={`Authenticate with ${biometryTypeName}`}
        >
          Unlock with {biometryTypeName}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  button: {
    minWidth: 250,
  },
});

export default AppLockScreen;
