/**
 * Main Navigator
 *
 * Routes to either Customer or Provider experience based on user role.
 * This navigator determines which tab navigator to display.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MainStackParamList } from './types';

// Tab navigators
import CustomerTabNavigator from './CustomerTabNavigator';
import ProviderTabNavigator from './ProviderTabNavigator';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator: React.FC = () => {
  // TODO: Get user role from auth store in later tasks
  // For now, we'll default to customer tabs
  // const userRole = useAuthStore(state => state.user?.role);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {/* Customer experience */}
      <Stack.Screen
        name="CustomerTabs"
        component={CustomerTabNavigator}
      />

      {/* Provider experience */}
      <Stack.Screen
        name="ProviderTabs"
        component={ProviderTabNavigator}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
