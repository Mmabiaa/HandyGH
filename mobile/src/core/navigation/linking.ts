/**
 * Deep Linking Configuration
 *
 * Configures deep linking for the application to handle URLs
 * for bookings, providers, and other screens.
 *
 * Requirements: 13.9, 11.7
 */

import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/**
 * Deep linking configuration
 *
 * Supported URL patterns:
 * - handygh://provider/:providerId - View provider details
 * - handygh://booking/:bookingId - View booking details
 * - handygh://chat/:bookingId - Open booking chat
 * - handygh://category/:categoryId - View providers by category
 * - https://handygh.com/provider/:providerId - Web deep link
 * - https://handygh.com/booking/:bookingId - Web deep link
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'handygh://',
    'https://handygh.com',
    'https://www.handygh.com',
  ],
  config: {
    screens: {
      Splash: 'splash',
      Auth: {
        screens: {
          Welcome: 'welcome',
          PhoneInput: 'phone-input',
          OTPVerification: 'otp-verification',
          RoleSelection: 'role-selection',
          ProfileSetup: 'profile-setup',
          ProviderOnboarding: 'provider-onboarding',
        },
      },
      Main: {
        screens: {
          CustomerTabs: {
            screens: {
              Home: 'home',
              Bookings: 'bookings',
              Favorites: 'favorites',
              Messages: 'messages',
              Profile: 'profile',
            },
          },
          ProviderTabs: {
            screens: {
              Dashboard: 'dashboard',
              Calendar: 'calendar',
              Earnings: 'earnings',
              Messages: 'provider-messages',
              Profile: 'provider-profile',
            },
          },
        },
      },
    },
  },
};

/**
 * Parse deep link URL and extract parameters
 *
 * @param url - The deep link URL to parse
 * @returns Parsed route information or null if invalid
 */
export function parseDeepLink(url: string): {
  screen: string;
  params?: Record<string, any>;
} | null {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    // Provider detail: /provider/:providerId
    const providerMatch = path.match(/^\/provider\/([^/]+)$/);
    if (providerMatch) {
      return {
        screen: 'ProviderDetail',
        params: { providerId: providerMatch[1] },
      };
    }

    // Booking detail: /booking/:bookingId
    const bookingMatch = path.match(/^\/booking\/([^/]+)$/);
    if (bookingMatch) {
      return {
        screen: 'BookingDetails',
        params: { bookingId: bookingMatch[1] },
      };
    }

    // Booking chat: /chat/:bookingId
    const chatMatch = path.match(/^\/chat\/([^/]+)$/);
    if (chatMatch) {
      return {
        screen: 'BookingChat',
        params: { bookingId: chatMatch[1] },
      };
    }

    // Category providers: /category/:categoryId
    const categoryMatch = path.match(/^\/category\/([^/]+)$/);
    if (categoryMatch) {
      return {
        screen: 'ProviderList',
        params: { categoryId: categoryMatch[1] },
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to parse deep link:', error);
    return null;
  }
}

/**
 * Validate deep link URL
 * Ensures the URL is from a trusted source
 *
 * Requirements: 13.9 (Deep link validation to prevent malicious attacks)
 */
export function validateDeepLink(url: string): boolean {
  try {
    const urlObj = new URL(url);

    // Check if the URL is from a trusted domain
    const trustedDomains = [
      'handygh.com',
      'www.handygh.com',
    ];

    const trustedSchemes = ['handygh', 'https'];

    // Validate scheme
    if (!trustedSchemes.includes(urlObj.protocol.replace(':', ''))) {
      console.warn('Untrusted URL scheme:', urlObj.protocol);
      return false;
    }

    // Validate domain for https URLs
    if (urlObj.protocol === 'https:') {
      if (!trustedDomains.includes(urlObj.hostname)) {
        console.warn('Untrusted domain:', urlObj.hostname);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Invalid URL:', error);
    return false;
  }
}

/**
 * Generate deep link URL for sharing
 *
 * @param screen - The screen to link to
 * @param params - Screen parameters
 * @returns Deep link URL
 */
export function generateDeepLink(
  screen: string,
  params?: Record<string, any>
): string {
  const baseUrl = 'https://handygh.com';

  switch (screen) {
    case 'ProviderDetail':
      return `${baseUrl}/provider/${params?.providerId}`;
    case 'BookingDetails':
      return `${baseUrl}/booking/${params?.bookingId}`;
    case 'BookingChat':
      return `${baseUrl}/chat/${params?.bookingId}`;
    case 'ProviderList':
      return `${baseUrl}/category/${params?.categoryId}`;
    default:
      return baseUrl;
  }
}
