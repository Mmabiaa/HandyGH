/**
 * Screen Transition Animations
 *
 * Custom transition animations for screen navigation
 * to provide smooth and professional user experience.
 *
 * Requirements: 11.7
 */

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

// Type alias for cleaner code
type StackNavigationOptions = NativeStackNavigationOptions;

/**
 * Slide from right transition (default)
 * Standard push/pop animation
 */
export const slideFromRight: StackNavigationOptions = {
  animation: 'slide_from_right',
  animationDuration: 300,
};

/**
 * Slide from bottom transition
 * Used for modal-like screens
 */
export const slideFromBottom: StackNavigationOptions = {
  animation: 'slide_from_bottom',
  animationDuration: 300,
  presentation: 'modal',
};

/**
 * Fade transition
 * Smooth fade in/out for subtle transitions
 */
export const fade: StackNavigationOptions = {
  animation: 'fade',
  animationDuration: 200,
};

/**
 * Fade from bottom transition
 * Combines fade with slight upward movement
 */
export const fadeFromBottom: StackNavigationOptions = {
  animation: 'fade_from_bottom',
  animationDuration: 300,
};

/**
 * No animation
 * Instant transition without animation
 */
export const none: StackNavigationOptions = {
  animation: 'none',
};

/**
 * Modal presentation
 * Full-screen modal with slide from bottom
 */
export const modal: StackNavigationOptions = {
  presentation: 'modal',
  animation: 'slide_from_bottom',
  animationDuration: 300,
  headerShown: false,
};

/**
 * Transparent modal
 * Modal with transparent background
 */
export const transparentModal: StackNavigationOptions = {
  presentation: 'transparentModal',
  animation: 'fade',
  animationDuration: 200,
  headerShown: false,
};

/**
 * Get platform-specific transition
 * Returns iOS-style or Android-style transition based on platform
 */
export function getPlatformTransition(): StackNavigationOptions {
  return Platform.select({
    ios: slideFromRight,
    android: {
      animation: 'slide_from_right',
      animationDuration: 250,
    },
    default: slideFromRight,
  });
}

/**
 * Custom transition configurations for specific screen types
 */
export const transitionPresets = {
  // Auth flow screens - smooth fade transitions
  auth: fade,

  // Main navigation - standard slide
  main: slideFromRight,

  // Detail screens - standard slide
  detail: slideFromRight,

  // Modal screens - slide from bottom
  modal: modal,

  // Overlay screens - transparent modal
  overlay: transparentModal,

  // Settings and profile - fade
  settings: fade,

  // Booking flow - slide from right with custom duration
  booking: {
    animation: 'slide_from_right',
    animationDuration: 250,
  },

  // Chat screens - slide from right
  chat: slideFromRight,

  // Payment screens - modal presentation
  payment: modal,
} as const;

/**
 * Get transition config for a screen type
 *
 * @param screenType - Type of screen
 * @returns Transition configuration
 */
export function getTransitionForScreen(
  screenType: keyof typeof transitionPresets
): StackNavigationOptions {
  return transitionPresets[screenType] || slideFromRight;
}

/**
 * Custom gesture configuration for better UX
 */
export const gestureConfig = {
  // Enable swipe back gesture
  gestureEnabled: true,

  // Gesture response distance (how far from edge to trigger)
  gestureResponseDistance: 50,

  // Full width gesture (swipe from anywhere)
  fullScreenGestureEnabled: false,
};

/**
 * Disable gesture for specific screens
 * Used for screens where back gesture should be prevented
 */
export const disableGesture: StackNavigationOptions = {
  gestureEnabled: false,
};

/**
 * Enable full screen gesture
 * Allows swiping from anywhere on screen to go back
 */
export const fullScreenGesture: StackNavigationOptions = {
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
};
