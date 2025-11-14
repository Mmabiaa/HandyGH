/**
 * App Root Component
 *
 * Main entry point for the HandyGH Mobile Application.
 * Sets up navigation container, theme provider, deep linking, and app lock.
 */

import React from 'react';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/core/theme/ThemeProvider';
import { RootNavigator, navigationRef, linking } from './src/core/navigation';
import { useAppLock } from './src/core/security';
import { AppLockScreen } from './src/features/shared/screens';
import { ConnectionStatusBanner, ErrorBoundary } from './src/shared/components';
// Note: Toast is not rendered here for Expo Go compatibility
// Toast messages will use Alert fallback

// App Content Component with App Lock
const AppContent: React.FC = () => {
  const { isLocked, unlock } = useAppLock();

  if (isLocked) {
    return <AppLockScreen onUnlock={unlock} />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={() => {
        console.log('[App] Navigation is ready');
      }}
      onStateChange={() => {
        console.log('[App] Navigation state changed');
      }}
      fallback={
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      }
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />
      <RootNavigator />
      <ConnectionStatusBanner />
    </NavigationContainer>
  );
};

function App(): React.JSX.Element {
  console.log('[App] Component rendering...');

  try {
    return (
      <ErrorBoundary>
        <SafeAreaProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('[App] Error during render:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>App Error</Text>
        <Text style={styles.errorMessage}>
          {error instanceof Error ? error.message : 'Unknown error'}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#d32f2f',
  },
  errorMessage: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  errorStack: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default App;
