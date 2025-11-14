/**
 * Navigation Reference
 *
 * Provides a reference to the navigation container for programmatic navigation
 * outside of React components (e.g., in services, utilities, or middleware).
 *
 * Requirements: 13.9
 */

import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/**
 * Navigation container reference
 * Use this to navigate from outside React components
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to a screen programmatically
 *
 * @example
 * navigate('Auth', { screen: 'PhoneInput' });
 * navigate('Main', { screen: 'CustomerTabs', params: { screen: 'Home' } });
 */
export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params as any);
  } else {
    console.warn('Navigation is not ready yet');
  }
}

/**
 * Go back to the previous screen
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

/**
 * Reset the navigation state
 * Useful for logout or changing user roles
 *
 * @example
 * resetNavigation('Auth', { screen: 'Welcome' });
 */
export function resetNavigation<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName]
) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name, params } as any],
    });
  }
}

/**
 * Get the current route name
 */
export function getCurrentRoute() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute();
  }
  return null;
}

/**
 * Check if navigation is ready
 */
export function isNavigationReady() {
  return navigationRef.isReady();
}
