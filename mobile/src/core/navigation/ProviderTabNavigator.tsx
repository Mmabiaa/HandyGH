/**
 * Provider Tab Navigator
 *
 * Bottom tab navigation for the provider experience with 5 main tabs:
 * - Dashboard: Business metrics and overview
 * - Calendar: Booking schedule
 * - Earnings: Financial analytics
 * - Messages: Customer conversations
 * - Profile: Business profile and settings
 */

import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ProviderTabParamList } from './types';

// Placeholder screens - will be implemented in later tasks
import ProviderDashboardScreen from '../../features/provider/screens/ProviderDashboardScreen';
import ProviderCalendarScreen from '../../features/provider/screens/ProviderCalendarScreen';
import EarningsScreen from '../../features/provider/screens/EarningsScreen';
import MessagesScreen from '../../features/provider/screens/MessagesScreen';
import ProviderProfileScreen from '../../features/provider/screens/ProviderProfileScreen';

const Tab = createBottomTabNavigator<ProviderTabParamList>();

const ProviderTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2E7D32', // Ghana green accent
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          backgroundColor: '#FFFFFF',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={ProviderDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          // TODO: Add icon in later tasks
          // tabBarIcon: ({ color, size }) => <DashboardIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={ProviderCalendarScreen}
        options={{
          tabBarLabel: 'Calendar',
          // TODO: Add badge for pending requests
          // tabBarBadge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          tabBarLabel: 'Earnings',
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Messages',
          // TODO: Add badge for unread messages
          // tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProviderProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default ProviderTabNavigator;
