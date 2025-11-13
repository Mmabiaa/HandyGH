import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ============================================
// AUTH STACK
// ============================================
export type AuthStackParamList = {
  Onboarding: undefined;
  Welcome: undefined;
  PhoneInput: undefined;
  Signup: undefined;
  Login: undefined;
  OTPVerification: {
    phone: string;
    flow: 'signup' | 'login';
  };
  RoleSelection: undefined;
  ProfileSetup: { role: 'CUSTOMER' | 'PROVIDER' };
  ProviderOnboarding: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

// ============================================
// CUSTOMER STACKS
// ============================================

// Home Stack (nested in Customer tabs)
export type CustomerHomeStackParamList = {
  HomeMain: undefined;
  ServiceCategories: undefined;
  ProviderList: { categoryId?: string; searchQuery?: string };
  ProviderDetail: { providerId: string };
  ServiceSelection: { providerId: string };
  ProviderReviews: { providerId: string };
  ProviderGallery: { providerId: string };
  Search: undefined;
  MapView: { categoryId?: string };
  Filter: { currentFilters?: any };
};

// Bookings Stack (nested in Customer tabs)
export type CustomerBookingsStackParamList = {
  BookingList: undefined;
  BookingDetails: { bookingId: string };
  BookingStatus: { bookingId: string };
  BookingChat: { bookingId: string; providerId: string };
  Reschedule: { bookingId: string };
  CancelBooking: { bookingId: string };
  ReviewSubmission: { bookingId: string; providerId: string };
  PaymentReceipt: { bookingId: string };
  Invoice: { bookingId: string };
};

// Messages Stack (nested in Customer tabs)
export type CustomerMessagesStackParamList = {
  ChatList: undefined;
  Chat: { chatId: string; recipientId: string; recipientName: string };
};

// Profile Stack (nested in Customer tabs)
export type CustomerProfileStackParamList = {
  ProfileMain: undefined;
  ProfileEdit: undefined;
  BookingHistory: undefined;
  Favorites: undefined;
  Settings: undefined;
  Notifications: undefined;
  Security: undefined;
  PaymentMethods: undefined;
  AddressBook: undefined;
  Language: undefined;
  HelpSupport: undefined;
  About: undefined;
};

// Customer Tab Navigator
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

// ============================================
// PROVIDER STACKS
// ============================================

// Dashboard Stack (nested in Provider tabs)
export type ProviderDashboardStackParamList = {
  DashboardMain: undefined;
  BookingRequests: undefined;
  BookingDetails: { bookingId: string };
  Earnings: undefined;
  PerformanceAnalytics: undefined;
  StatusUpdate: { bookingId: string };
  PaymentRequest: { bookingId: string };
};

// Calendar Stack (nested in Provider tabs)
export type ProviderCalendarStackParamList = {
  CalendarMain: undefined;
  AvailabilityManagement: undefined;
  AvailabilitySetup: undefined;
};

// Services Stack (nested in Provider tabs)
export type ProviderServicesStackParamList = {
  ServiceList: undefined;
  ServiceManagement: { serviceId?: string };
  ServiceCatalogSetup: undefined;
  PricingManagement: undefined;
  Portfolio: undefined;
};

// Provider Messages Stack
export type ProviderMessagesStackParamList = {
  ChatList: undefined;
  Chat: { chatId: string; recipientId: string; recipientName: string };
};

// Provider Profile Stack
export type ProviderProfileStackParamList = {
  ProfileMain: undefined;
  ProviderProfileSetup: undefined;
  ReviewsManagement: undefined;
  Documents: undefined;
  Banking: undefined;
  Settings: undefined;
  TeamManagement: undefined;
  ExpenseTracking: undefined;
  Tax: undefined;
  ProviderSupport: undefined;
  Verification: undefined;
};

// Provider Tab Navigator
export type ProviderTabParamList = {
  Dashboard: undefined;
  Bookings: undefined;
  Services: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type ProviderTabScreenProps<T extends keyof ProviderTabParamList> = BottomTabScreenProps<
  ProviderTabParamList,
  T
>;

// ============================================
// SHARED MODAL SCREENS
// ============================================
export type CustomerModalParamList = {
  BookingCreate: { providerId: string; serviceId?: string };
  DateTimeSelection: { bookingData: any };
  LocationSelection: { bookingData: any };
  ServiceCustomization: { bookingData: any };
  BookingSummary: { bookingData: any };
  PaymentMethod: { bookingData: any };
  MobileMoneyPayment: { amount: number; bookingId: string };
  ManualPayment: { amount: number; bookingId: string };
  BookingConfirmation: { bookingId: string };
  ServiceExecution: { bookingId: string };
  ServiceHistory: undefined;
  Support: { bookingId?: string };
};

export type SharedModalParamList = {
  NotificationCenter: undefined;
  Status: { bookingId: string };
  Tracking: { bookingId: string; providerId: string };
  LiveSupport: undefined;
  ImageViewer: { images: string[]; initialIndex?: number };
};

// ============================================
// ROOT STACK
// ============================================
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Customer: NavigatorScreenParams<CustomerTabParamList>;
  Provider: NavigatorScreenParams<ProviderTabParamList>;

  // Shared screens (accessible from both Customer and Provider)
  ProviderDetail: { providerId: string };
  BookingDetail: { bookingId: string };
  Chat: { bookingId: string };
  Review: { bookingId: string };
  Settings: undefined;

  // Customer Modals
  BookingCreate: { providerId: string; serviceId?: string };
  DateTimeSelection: { bookingData: any };
  LocationSelection: { bookingData: any };
  ServiceCustomization: { bookingData: any };
  BookingSummary: { bookingData: any };
  PaymentMethod: { bookingData: any };
  MobileMoneyPayment: { amount: number; bookingId: string };
  ManualPayment: { amount: number; bookingId: string };
  BookingConfirmation: { bookingId: string };

  // Shared Modals
  NotificationCenter: undefined;
  ImageViewer: { images: string[]; initialIndex?: number };
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
