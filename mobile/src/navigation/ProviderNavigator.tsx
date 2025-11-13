import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  ProviderTabParamList,
  ProviderDashboardStackParamList,
  ProviderCalendarStackParamList,
  ProviderServicesStackParamList,
  ProviderMessagesStackParamList,
  ProviderProfileStackParamList
} from './types';
import { colors } from '@/constants/theme';

// Import existing screens
import { DashboardScreen } from '@/screens/provider/DashboardScreen';
import { ProfileScreen } from '@/screens/shared/ProfileScreen';

// Import new screens (will be created)
import { BookingRequestsScreen } from '@/screens/provider/BookingRequestsScreen';
import { BookingDetailsScreen } from '@/screens/provider/BookingDetailsScreen';
import { EarningsScreen } from '@/screens/provider/EarningsScreen';
import { PerformanceAnalyticsScreen } from '@/screens/provider/PerformanceAnalyticsScreen';
import { StatusUpdateScreen } from '@/screens/provider/StatusUpdateScreen';
import { PaymentRequestScreen } from '@/screens/provider/PaymentRequestScreen';

import { ProviderCalendarScreen } from '@/screens/provider/ProviderCalendarScreen';
import { AvailabilityManagementScreen } from '@/screens/provider/AvailabilityManagementScreen';
import { AvailabilitySetupScreen } from '@/screens/provider/AvailabilitySetupScreen';

import { ServiceListScreen } from '@/screens/provider/ServiceListScreen';
import { ServiceManagementScreen } from '@/screens/provider/ServiceManagementScreen';
import { ServiceCatalogSetupScreen } from '@/screens/provider/ServiceCatalogSetupScreen';
import { PricingManagementScreen } from '@/screens/provider/PricingManagementScreen';
import { PortfolioScreen } from '@/screens/provider/PortfolioScreen';

import { ChatListScreen } from '@/screens/shared/ChatListScreen';
import { ChatScreen } from '@/screens/shared/ChatScreen';

import { ProviderProfileSetupScreen } from '@/screens/provider/ProviderProfileSetupScreen';
import { ReviewsManagementScreen } from '@/screens/provider/ReviewsManagementScreen';
import { DocumentsScreen } from '@/screens/provider/DocumentsScreen';
import { BankingScreen } from '@/screens/provider/BankingScreen';
import { SettingsScreen } from '@/screens/shared/SettingsScreen';
import { TeamManagementScreen } from '@/screens/provider/TeamManagementScreen';
import { ExpenseTrackingScreen } from '@/screens/provider/ExpenseTrackingScreen';
import { TaxScreen } from '@/screens/provider/TaxScreen';
import { ProviderSupportScreen } from '@/screens/provider/ProviderSupportScreen';
import { VerificationScreen } from '@/screens/provider/VerificationScreen';

const Tab = createBottomTabNavigator<ProviderTabParamList>();
const DashboardStack = createNativeStackNavigator<ProviderDashboardStackParamList>();
const CalendarStack = createNativeStackNavigator<ProviderCalendarStackParamList>();
const ServicesStack = createNativeStackNavigator<ProviderServicesStackParamList>();
const MessagesStack = createNativeStackNavigator<ProviderMessagesStackParamList>();
const ProfileStack = createNativeStackNavigator<ProviderProfileStackParamList>();

// ============================================
// DASHBOARD STACK NAVIGATOR
// ============================================
const DashboardStackNavigator = () => {
  return (
    <DashboardStack.Navigator>
      <DashboardStack.Screen
        name="DashboardMain"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <DashboardStack.Screen
        name="BookingRequests"
        component={BookingRequestsScreen}
        options={{ title: 'Booking Requests' }}
      />
      <DashboardStack.Screen
        name="BookingDetails"
        component={BookingDetailsScreen}
        options={{ title: 'Booking Details' }}
      />
      <DashboardStack.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{ title: 'Earnings' }}
      />
      <DashboardStack.Screen
        name="PerformanceAnalytics"
        component={PerformanceAnalyticsScreen}
        options={{ title: 'Performance' }}
      />
      <DashboardStack.Screen
        name="StatusUpdate"
        component={StatusUpdateScreen}
        options={{
          title: 'Update Status',
          presentation: 'modal'
        }}
      />
      <DashboardStack.Screen
        name="PaymentRequest"
        component={PaymentRequestScreen}
        options={{
          title: 'Request Payment',
          presentation: 'modal'
        }}
      />
    </DashboardStack.Navigator>
  );
};

// ============================================
// CALENDAR STACK NAVIGATOR
// ============================================
const CalendarStackNavigator = () => {
  return (
    <CalendarStack.Navigator>
      <CalendarStack.Screen
        name="CalendarMain"
        component={ProviderCalendarScreen}
        options={{ title: 'Calendar' }}
      />
      <CalendarStack.Screen
        name="AvailabilityManagement"
        component={AvailabilityManagementScreen}
        options={{ title: 'Manage Availability' }}
      />
      <CalendarStack.Screen
        name="AvailabilitySetup"
        component={AvailabilitySetupScreen}
        options={{ title: 'Setup Availability' }}
      />
    </CalendarStack.Navigator>
  );
};

// ============================================
// SERVICES STACK NAVIGATOR
// ============================================
const ServicesStackNavigator = () => {
  return (
    <ServicesStack.Navigator>
      <ServicesStack.Screen
        name="ServiceList"
        component={ServiceListScreen}
        options={{ title: 'My Services' }}
      />
      <ServicesStack.Screen
        name="ServiceManagement"
        component={ServiceManagementScreen}
        options={{ title: 'Manage Service' }}
      />
      <ServicesStack.Screen
        name="ServiceCatalogSetup"
        component={ServiceCatalogSetupScreen}
        options={{ title: 'Service Catalog' }}
      />
      <ServicesStack.Screen
        name="PricingManagement"
        component={PricingManagementScreen}
        options={{ title: 'Pricing' }}
      />
      <ServicesStack.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{ title: 'Portfolio' }}
      />
    </ServicesStack.Navigator>
  );
};

// ============================================
// MESSAGES STACK NAVIGATOR
// ============================================
const MessagesStackNavigator = () => {
  return (
    <MessagesStack.Navigator>
      <MessagesStack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: 'Messages' }}
      />
      <MessagesStack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params.recipientName
        })}
      />
    </MessagesStack.Navigator>
  );
};

// ============================================
// PROFILE STACK NAVIGATOR
// ============================================
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <ProfileStack.Screen
        name="ProviderProfileSetup"
        component={ProviderProfileSetupScreen}
        options={{ title: 'Business Profile' }}
      />
      <ProfileStack.Screen
        name="ReviewsManagement"
        component={ReviewsManagementScreen}
        options={{ title: 'Reviews' }}
      />
      <ProfileStack.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{ title: 'Documents' }}
      />
      <ProfileStack.Screen
        name="Banking"
        component={BankingScreen}
        options={{ title: 'Banking' }}
      />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <ProfileStack.Screen
        name="TeamManagement"
        component={TeamManagementScreen}
        options={{ title: 'Team' }}
      />
      <ProfileStack.Screen
        name="ExpenseTracking"
        component={ExpenseTrackingScreen}
        options={{ title: 'Expenses' }}
      />
      <ProfileStack.Screen
        name="Tax"
        component={TaxScreen}
        options={{ title: 'Tax Reports' }}
      />
      <ProfileStack.Screen
        name="ProviderSupport"
        component={ProviderSupportScreen}
        options={{ title: 'Support' }}
      />
      <ProfileStack.Screen
        name="Verification"
        component={VerificationScreen}
        options={{ title: 'Verification Status' }}
      />
    </ProfileStack.Navigator>
  );
};

// ============================================
// MAIN TAB NAVIGATOR
// ============================================
export const ProviderNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={CalendarStackNavigator}
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="briefcase" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="message" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
