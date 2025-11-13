import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CustomerTabParamList, CustomerHomeStackParamList, CustomerBookingsStackParamList, CustomerMessagesStackParamList, CustomerProfileStackParamList } from './types';
import { colors } from '@/constants/theme';

// Import existing screens
import { HomeScreen } from '@/screens/customer/HomeScreen';
import { BookingsScreen } from '@/screens/customer/BookingsScreen';
import { ProfileScreen } from '@/screens/shared/ProfileScreen';

// Import new screens (will be created)
import { ServiceCategoriesScreen } from '@/screens/customer/ServiceCategoriesScreen';
import { ProviderListScreen } from '@/screens/customer/ProviderListScreen';
import { ProviderDetailScreen } from '@/screens/customer/ProviderDetailScreen';
import { SearchScreen } from '@/screens/customer/SearchScreen';
import { MapViewScreen } from '@/screens/customer/MapViewScreen';
import { FilterScreen } from '@/screens/customer/FilterScreen';
import { ServiceSelectionScreen } from '@/screens/customer/ServiceSelectionScreen';
import { ProviderReviewsScreen } from '@/screens/customer/ProviderReviewsScreen';
import { ProviderGalleryScreen } from '@/screens/customer/ProviderGalleryScreen';

import { BookingDetailsScreen } from '@/screens/customer/BookingDetailsScreen';
import { BookingStatusScreen } from '@/screens/customer/BookingStatusScreen';
import { BookingChatScreen } from '@/screens/customer/BookingChatScreen';
import { RescheduleScreen } from '@/screens/customer/RescheduleScreen';
import { CancelBookingScreen } from '@/screens/customer/CancelBookingScreen';
import { ReviewSubmissionScreen } from '@/screens/customer/ReviewSubmissionScreen';
import { PaymentReceiptScreen } from '@/screens/customer/PaymentReceiptScreen';
import { InvoiceScreen } from '@/screens/customer/InvoiceScreen';

import { ChatListScreen } from '@/screens/shared/ChatListScreen';
import { ChatScreen } from '@/screens/shared/ChatScreen';

import { ProfileEditScreen } from '@/screens/shared/ProfileEditScreen';
import { BookingHistoryScreen } from '@/screens/customer/BookingHistoryScreen';
import { FavoritesScreen } from '@/screens/customer/FavoritesScreen';
import { SettingsScreen } from '@/screens/shared/SettingsScreen';
import { NotificationsScreen } from '@/screens/shared/NotificationsScreen';
import { SecurityScreen } from '@/screens/shared/SecurityScreen';
import { PaymentMethodsScreen } from '@/screens/customer/PaymentMethodsScreen';
import { AddressBookScreen } from '@/screens/customer/AddressBookScreen';
import { LanguageScreen } from '@/screens/shared/LanguageScreen';
import { HelpSupportScreen } from '@/screens/shared/HelpSupportScreen';
import { AboutScreen } from '@/screens/shared/AboutScreen';

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const HomeStack = createNativeStackNavigator<CustomerHomeStackParamList>();
const BookingsStack = createNativeStackNavigator<CustomerBookingsStackParamList>();
const MessagesStack = createNativeStackNavigator<CustomerMessagesStackParamList>();
const ProfileStack = createNativeStackNavigator<CustomerProfileStackParamList>();

// ============================================
// HOME STACK NAVIGATOR
// ============================================
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="ServiceCategories"
        component={ServiceCategoriesScreen}
        options={{ title: 'Service Categories' }}
      />
      <HomeStack.Screen
        name="ProviderList"
        component={ProviderListScreen}
        options={{ title: 'Service Providers' }}
      />
      <HomeStack.Screen
        name="ProviderDetail"
        component={ProviderDetailScreen}
        options={{ title: 'Provider Details' }}
      />
      <HomeStack.Screen
        name="ServiceSelection"
        component={ServiceSelectionScreen}
        options={{ title: 'Select Service' }}
      />
      <HomeStack.Screen
        name="ProviderReviews"
        component={ProviderReviewsScreen}
        options={{ title: 'Reviews' }}
      />
      <HomeStack.Screen
        name="ProviderGallery"
        component={ProviderGalleryScreen}
        options={{ title: 'Gallery' }}
      />
      <HomeStack.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="MapView"
        component={MapViewScreen}
        options={{ title: 'Map View' }}
      />
      <HomeStack.Screen
        name="Filter"
        component={FilterScreen}
        options={{
          title: 'Filters',
          presentation: 'modal'
        }}
      />
    </HomeStack.Navigator>
  );
};

// ============================================
// BOOKINGS STACK NAVIGATOR
// ============================================
const BookingsStackNavigator = () => {
  return (
    <BookingsStack.Navigator>
      <BookingsStack.Screen
        name="BookingList"
        component={BookingsScreen}
        options={{ title: 'My Bookings' }}
      />
      <BookingsStack.Screen
        name="BookingDetails"
        component={BookingDetailsScreen}
        options={{ title: 'Booking Details' }}
      />
      <BookingsStack.Screen
        name="BookingStatus"
        component={BookingStatusScreen}
        options={{ title: 'Booking Status' }}
      />
      <BookingsStack.Screen
        name="BookingChat"
        component={BookingChatScreen}
        options={{ title: 'Chat' }}
      />
      <BookingsStack.Screen
        name="Reschedule"
        component={RescheduleScreen}
        options={{ title: 'Reschedule Booking' }}
      />
      <BookingsStack.Screen
        name="CancelBooking"
        component={CancelBookingScreen}
        options={{
          title: 'Cancel Booking',
          presentation: 'modal'
        }}
      />
      <BookingsStack.Screen
        name="ReviewSubmission"
        component={ReviewSubmissionScreen}
        options={{
          title: 'Write Review',
          presentation: 'modal'
        }}
      />
      <BookingsStack.Screen
        name="PaymentReceipt"
        component={PaymentReceiptScreen}
        options={{ title: 'Payment Receipt' }}
      />
      <BookingsStack.Screen
        name="Invoice"
        component={InvoiceScreen}
        options={{ title: 'Invoice' }}
      />
    </BookingsStack.Navigator>
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
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{ title: 'Edit Profile' }}
      />
      <ProfileStack.Screen
        name="BookingHistory"
        component={BookingHistoryScreen}
        options={{ title: 'Booking History' }}
      />
      <ProfileStack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Favorites' }}
      />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <ProfileStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <ProfileStack.Screen
        name="Security"
        component={SecurityScreen}
        options={{ title: 'Security' }}
      />
      <ProfileStack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{ title: 'Payment Methods' }}
      />
      <ProfileStack.Screen
        name="AddressBook"
        component={AddressBookScreen}
        options={{ title: 'Saved Addresses' }}
      />
      <ProfileStack.Screen
        name="Language"
        component={LanguageScreen}
        options={{ title: 'Language' }}
      />
      <ProfileStack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ title: 'Help & Support' }}
      />
      <ProfileStack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'About' }}
      />
    </ProfileStack.Navigator>
  );
};

// ============================================
// MAIN TAB NAVIGATOR
// ============================================
export const CustomerNavigator: React.FC = () => {
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
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-check" size={size} color={color} />
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
