import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CustomerTabParamList } from './types';
import { colors } from '@/constants/theme';

// Screens
import { HomeScreen } from '@/screens/customer/HomeScreen';
import { BookingsScreen } from '@/screens/customer/BookingsScreen';
import { ProfileScreen } from '@/screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

// Placeholder Messages screen
const MessagesScreen = () => {
  const { View, Text, StyleSheet } = require('react-native');
  return (
    <View style={styles.container}>
      <Text>Messages</Text>
    </View>
  );
};

const styles = require('react-native').StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const CustomerNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-check" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="message" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
