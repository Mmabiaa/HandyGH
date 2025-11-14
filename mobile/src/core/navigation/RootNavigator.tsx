/**
 * Root Navigator
 *
 * Top-level navigator that manages the main application flow:
 * - Splash screen
 * - Authentication flow
 * - Main application (Customer or Provider experience)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

// Placeholder screens - will be implemented in later tasks
import SplashScreen from '../../features/auth/screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{
          animation: 'none',
        }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthNavigator}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Main"
        component={MainNavigator}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
