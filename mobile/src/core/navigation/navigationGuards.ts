/**
 * Navigation Guards
 *
 * Implements authentication guards and navigation protection
 * to ensure users can only access screens they're authorized for.
 *
 * Requirements: 13.9
 */

import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/**
 * Authentication status type
 */
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

/**
 * User role type
 */
export type UserRole = 'customer' | 'provider' | null;

/**
 * Hook to protect routes that require authentication
 * Redirects to auth flow if user is not authenticated
 *
 * @param authStatus - Current authentication status
 *
 * @example
 * const MyScreen = () => {
 *   useAuthGuard(authStatus);
 *   return <View>...</View>;
 * };
 */
export function useAuthGuard(authStatus: AuthStatus) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      // Redirect to auth flow
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth', params: { screen: 'Welcome' } }],
      });
    }
  }, [authStatus, navigation]);
}

/**
 * Hook to protect routes that require a specific role
 * Redirects if user doesn't have the required role
 *
 * @param userRole - Current user role
 * @param requiredRole - Required role to access the screen
 *
 * @example
 * const ProviderScreen = () => {
 *   useRoleGuard(userRole, 'provider');
 *   return <View>...</View>;
 * };
 */
export function useRoleGuard(
  userRole: UserRole,
  requiredRole: 'customer' | 'provider'
) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (userRole && userRole !== requiredRole) {
      // Redirect to appropriate home screen
      const targetScreen = userRole === 'customer' ? 'CustomerTabs' : 'ProviderTabs';
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            params: { screen: targetScreen } as any,
          },
        ],
      });
    }
  }, [userRole, requiredRole, navigation]);
}

/**
 * Hook to redirect authenticated users away from auth screens
 *
 * @param authStatus - Current authentication status
 * @param userRole - Current user role
 *
 * @example
 * const WelcomeScreen = () => {
 *   useGuestGuard(authStatus, userRole);
 *   return <View>...</View>;
 * };
 */
export function useGuestGuard(authStatus: AuthStatus, userRole: UserRole) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (authStatus === 'authenticated' && userRole) {
      // Redirect to appropriate home screen
      const targetScreen = userRole === 'customer' ? 'CustomerTabs' : 'ProviderTabs';
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            params: { screen: targetScreen } as any,
          },
        ],
      });
    }
  }, [authStatus, userRole, navigation]);
}

/**
 * Check if user can access a specific screen
 *
 * @param screen - Screen name to check
 * @param authStatus - Current authentication status
 * @param userRole - Current user role
 * @returns Whether the user can access the screen
 */
export function canAccessScreen(
  screen: string,
  authStatus: AuthStatus,
  userRole: UserRole
): boolean {
  // Public screens (no auth required)
  const publicScreens = ['Splash', 'Welcome', 'PhoneInput', 'OTPVerification'];
  if (publicScreens.includes(screen)) {
    return true;
  }

  // Auth required screens
  if (authStatus !== 'authenticated') {
    return false;
  }

  // Customer-only screens
  const customerScreens = [
    'Home',
    'Search',
    'ProviderList',
    'ProviderDetail',
    'ServiceSelection',
    'Favorites',
  ];
  if (customerScreens.includes(screen) && userRole !== 'customer') {
    return false;
  }

  // Provider-only screens
  const providerScreens = [
    'Dashboard',
    'BookingRequests',
    'ServiceExecution',
    'Earnings',
    'PerformanceAnalytics',
  ];
  if (providerScreens.includes(screen) && userRole !== 'provider') {
    return false;
  }

  return true;
}

/**
 * Get the default screen for a user based on their auth status and role
 *
 * @param authStatus - Current authentication status
 * @param userRole - Current user role
 * @returns Default screen name
 */
export function getDefaultScreen(
  authStatus: AuthStatus,
  userRole: UserRole
): keyof RootStackParamList {
  if (authStatus === 'loading') {
    return 'Splash';
  }

  if (authStatus === 'unauthenticated') {
    return 'Auth';
  }

  // Authenticated user
  return 'Main';
}
