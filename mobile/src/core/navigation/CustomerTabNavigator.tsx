/**
 * Customer Tab Navigator
 *
 * Bottom tab navigation for the customer experience with 5 main tabs:
 * - Home: Service discovery and featured providers
 * - Bookings: Active and past bookings
 * - Favorites: Saved providers
 * - Messages: Booking conversations
 * - Profile: User profile and settings
 */

import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { CustomerTabParamList } from './types';

// Placeholder screens - will be implemented in later tasks
import HomeScreen from '../../features/customer/screens/HomeScreen';
import BookingListScreen from '../../features/booking/screens/BookingListScreen';
import FavoritesScreen from '../../features/customer/screens/FavoritesScreen';
import MessagesScreen from '../../features/customer/screens/MessagesScreen';
import ProfileScreen from '../../features/customer/screens/ProfileScreen';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

const CustomerTabNavigator: React.FC = () => {
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
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          // TODO: Add icon in later tasks
          // tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingListScreen}
        options={{
          tabBarLabel: 'Bookings',
          // TODO: Add icon and badge for active bookings
          // tabBarBadge: activeBookingsCount > 0 ? activeBookingsCount : undefined,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Favorites',
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
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default CustomerTabNavigator;
