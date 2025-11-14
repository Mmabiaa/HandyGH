/**
 * Navigation Type Definitions
 *
 * Defines TypeScript types for all navigation stacks and their parameters
 * to ensure type-safe navigation throughout the application.
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Root Stack Navigator
 * Top-level navigator that manages the main app flow
 */
export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

/**
 * Auth Stack Navigator
 * Handles authentication and onboarding flow
 */
export type AuthStackParamList = {
  Welcome: undefined;
  PhoneInput: undefined;
  OTPVerification: {
    phoneNumber: string;
  };
  RoleSelection: undefined;
  ProfileSetup: {
    role: 'customer' | 'provider';
  };
  ProviderOnboarding: undefined;
};

/**
 * Main Stack Navigator
 * Routes to either Customer or Provider experience based on user role
 */
export type MainStackParamList = {
  CustomerTabs: NavigatorScreenParams<CustomerTabParamList>;
  ProviderTabs: NavigatorScreenParams<ProviderTabParamList>;
};

/**
 * Customer Tab Navigator
 * Bottom tab navigation for customer experience
 */
export type CustomerTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Favorites: undefined;
  Messages: undefined;
  Profile: undefined;
};

/**
 * Customer Stack Navigator
 * Stack navigation for customer-specific screens
 */
export type CustomerStackParamList = {
  Home: undefined;
  Search: {
    initialQuery?: string;
  };
  ProviderList: {
    categoryId: string;
    categoryName?: string;
  };
  ProviderDetail: {
    providerId: string;
  };
  ProviderReviews: {
    providerId: string;
  };
  ServiceSelection: {
    providerId: string;
  };
  DateTimeSelection: {
    providerId: string;
    serviceId: string;
  };
  LocationSelection: {
    providerId: string;
    serviceId: string;
    scheduledDate: string;
    scheduledTime: string;
  };
  BookingSummary: {
    providerId: string;
    serviceId: string;
    scheduledDate: string;
    scheduledTime: string;
    locationId: string;
  };
  PaymentMethod: {
    bookingId: string;
  };
  MobileMoneyPayment: {
    bookingId: string;
    amount: number;
  };
  BookingConfirmation: {
    bookingId: string;
  };
  BookingList: undefined;
  BookingDetails: {
    bookingId: string;
  };
  BookingChat: {
    bookingId: string;
  };
  ReviewSubmission: {
    bookingId: string;
    providerId: string;
  };
  MapView: {
    providers?: string[];
    center?: {
      latitude: number;
      longitude: number;
    };
  };
};

/**
 * Provider Tab Navigator
 * Bottom tab navigation for provider experience
 */
export type ProviderTabParamList = {
  Dashboard: undefined;
  Calendar: undefined;
  Earnings: undefined;
  Messages: undefined;
  Profile: undefined;
};

/**
 * Provider Stack Navigator
 * Stack navigation for provider-specific screens
 */
export type ProviderStackParamList = {
  Dashboard: undefined;
  BookingRequests: undefined;
  BookingRequestDetail: {
    bookingId: string;
  };
  Calendar: undefined;
  ServiceExecution: {
    bookingId: string;
  };
  PaymentRequest: {
    bookingId: string;
  };
  Earnings: undefined;
  PaymentHistory: undefined;
  PerformanceAnalytics: undefined;
  Banking: undefined;
  ServiceManagement: undefined;
  ProviderProfile: undefined;
  BookingChat: {
    bookingId: string;
  };
};

/**
 * Shared Screens
 * Screens that can be accessed from multiple navigators
 */
export type SharedStackParamList = {
  Settings: undefined;
  Notifications: undefined;
  Support: undefined;
  Maintenance: {
    message?: string;
    estimatedTime?: string;
  };
};

// Navigation prop types for type-safe navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
