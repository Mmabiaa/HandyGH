/**
 * App Root Component
 *
 * Main entry point for the HandyGH Mobile Application.
 * Sets up navigation container, theme provider, and deep linking.
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/core/theme/ThemeProvider';
import { RootNavigator, navigationRef, linking } from './src/core/navigation';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer
          ref={navigationRef}
          linking={linking}
          onReady={() => {
            console.log('Navigation is ready');
          }}
        >
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#FFFFFF"
          />
          <RootNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
