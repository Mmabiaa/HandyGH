/**
 * Provider Stack Navigator
 *
 * Stack navigation for provider-specific screens including modals
 * and detail screens that sit on top of the tab navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProviderStackParamList } from './types';

// Tab Navigator
import ProviderTabNavigator from './ProviderTabNavigator';

// Provider Screens
import BookingRequestsScreen from '../../features/provider/screens/BookingRequestsScreen';
import BookingRequestDetailScreen from '../../features/provider/screens/BookingRequestDetailScreen';

const Stack = createNativeStackNavigator<ProviderStackParamList>();

const ProviderStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#212121',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerShadowVisible: true,
      }}
    >
      {/* Main tabs - hide header since tabs have their own */}
      <Stack.Screen
        name="Dashboard"
        component={ProviderTabNavigator}
        options={{ headerShown: false }}
      />

      {/* Booking Requests */}
      <Stack.Screen
        name="BookingRequests"
        component={BookingRequestsScreen}
        options={{
          title: 'Booking Requests',
          headerBackTitle: 'Back',
        }}
      />

      {/* Booking Request Detail */}
      <Stack.Screen
        name="BookingRequestDetail"
        component={BookingRequestDetailScreen}
        options={{
          title: 'Request Details',
          headerBackTitle: 'Back',
        }}
      />

      {/* Calendar - Already in tabs, but can be accessed directly */}
      {/* Other provider screens will be added here as they're implemented */}
    </Stack.Navigator>
  );
};

export default ProviderStackNavigator;
