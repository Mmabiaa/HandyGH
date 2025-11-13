import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

/**
 * Auth Stack Navigator
 */
export type AuthStackParamList = {
  Onboarding: undefined;
  PhoneInput: undefined;
  OTPVerification: { phone: string };
  RoleSelection: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

/**
 * Customer Tab Navigator
 */
export type CustomerTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type CustomerTabScreenProps<T extends keyof CustomerTabParamList> = BottomTabScreenProps<
  CustomerTabParamList,
  T
>;

/**
 * Provider Tab Navigator
 */
export type ProviderTabParamList = {
  Dashboard: undefined;
  Bookings: undefined;
  Services: undefined;
  Profile: undefined;
};

export type ProviderTabScreenProps<T extends keyof ProviderTabParamList> = BottomTabScreenProps<
  ProviderTabParamList,
  T
>;

/**
 * Root Stack Navigator
 */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Customer: NavigatorScreenParams<CustomerTabParamList>;
  Provider: NavigatorScreenParams<ProviderTabParamList>;

  // Shared screens
  ProviderDetail: { providerId: string };
  BookingDetail: { bookingId: string };
  Chat: { bookingId: string };
  Review: { bookingId: string };
  Settings: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

// Declare global types for navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
