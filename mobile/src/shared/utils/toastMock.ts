/**
 * Mock implementation of react-native-toast-message
 * This is a temporary mock until the actual package is installed
 *
 * To install the real package:
 * npm install react-native-toast-message
 */

import { Alert } from 'react-native';

interface ToastOptions {
  type: 'success' | 'error' | 'info' | 'warning';
  text1: string;
  text2?: string;
  position?: 'top' | 'bottom';
  visibilityTime?: number;
  autoHide?: boolean;
}

class ToastMock {
  show(options: ToastOptions): void {
    // Fallback to Alert for now
    if (__DEV__) {
      console.log('[Toast]', options.type, options.text1, options.text2);
    }

    // Show alert in development
    if (__DEV__) {
      Alert.alert(options.text1, options.text2);
    }
  }

  hide(): void {
    // No-op
  }
}

export default new ToastMock();
