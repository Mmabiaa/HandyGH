/**
 * Main Navigator
 *
 * Routes to either Customer or Provider experience based on user role.
 * This navigator determines which tab navigator to display.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MainStackParamList } from './types';

// Tab navigators
import CustomerTabNavigator from './CustomerTabNavigator';
import ProviderStackNavigator from './ProviderStackNavigator';

// Shared screens
import { SettingsScreen } from '../../features/shared/screens';

// Offline indicators
import { OfflineModeBanner } from '../../shared/components';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator: React.FC = () => {
  // TODO: Get user role from auth store in later tasks
  // For now, we'll default to customer tabs
  // const userRole = useAuthStore(state => state.user?.role);

  return (
    <View style={styles.container}>
      {/* Global Offline Banner */}
      <OfflineModeBanner showQueueSize={true} />

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
          component={ProviderStackNavigator}
        />

        {/* Shared modal screens */}
        <Stack.Group
          screenOptions={{
            presentation: 'modal',
            headerShown: true,
            animation: 'slide_from_bottom',
          }}
        >
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Settings',
              headerBackTitle: 'Back',
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainNavigator;
