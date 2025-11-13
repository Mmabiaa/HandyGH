import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { RootStackParamList } from './types';

/**
 * Deep linking configuration
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'handygh://', 'https://handygh.com'],
  config: {
    screens: {
      Auth: {
        screens: {
          Onboarding: 'onboarding',
          PhoneInput: 'login',
          OTPVerification: 'verify-otp',
          RoleSelection: 'select-role',
        },
      },
      Customer: {
        screens: {
          Home: 'home',
          Bookings: 'bookings',
          Messages: 'messages',
          Profile: 'profile',
        },
      },
      Provider: {
        screens: {
          Dashboard: 'dashboard',
          Bookings: 'bookings',
          Services: 'services',
          Profile: 'profile',
        },
      },
      ProviderDetail: 'provider/:providerId',
      BookingDetail: 'booking/:bookingId',
      Chat: 'chat/:bookingId',
      Review: 'review/:bookingId',
      Settings: 'settings',
    },
  },
};
