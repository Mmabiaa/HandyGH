// react-native-toast-message requires native modules not available in Expo Go
// Using mock for Expo Go compatibility
import Toast from './toastMock';
import { triggerHaptic } from './haptics';

/**
 * Success feedback utilities
 * Requirement 16.5: Success confirmation with visual feedback
 */

export interface SuccessOptions {
  title?: string;
  message: string;
  duration?: number;
  haptic?: boolean;
}

/**
 * Show success toast with haptic feedback
 */
export function showSuccess(options: SuccessOptions): void {
  const {
    title = 'Success',
    message,
    duration = 3000,
    haptic = true,
  } = options;

  // Trigger haptic feedback
  if (haptic) {
    triggerHaptic('success');
  }

  // Show toast
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: duration,
    autoHide: true,
  });
}

/**
 * Show info toast
 */
export function showInfo(options: SuccessOptions): void {
  const {
    title = 'Info',
    message,
    duration = 3000,
    haptic = false,
  } = options;

  if (haptic) {
    triggerHaptic('light');
  }

  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: duration,
    autoHide: true,
  });
}

/**
 * Show warning toast
 */
export function showWarning(options: SuccessOptions): void {
  const {
    title = 'Warning',
    message,
    duration = 4000,
    haptic = true,
  } = options;

  if (haptic) {
    triggerHaptic('warning');
  }

  Toast.show({
    type: 'warning',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: duration,
    autoHide: true,
  });
}
