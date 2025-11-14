import { Platform } from 'react-native';

/**
 * Haptic feedback utility using Expo Haptics (Expo-compatible)
 * Falls back gracefully if haptics are not available
 */

let Haptics: any = null;

/**
 * Lazy load expo-haptics
 */
async function getHaptics() {
  if (Haptics) return Haptics;

  try {
    const hapticsModule = await import('expo-haptics');
    Haptics = hapticsModule.default || hapticsModule;
    return Haptics;
  } catch (error) {
    console.warn('[Haptics] expo-haptics not available:', error);
    return null;
  }
}

/**
 * Trigger haptic feedback
 * @param type - 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'
 */
export async function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') {
  if (Platform.OS === 'web') {
    return; // Haptics not available on web
  }

  try {
    const HapticsModule = await getHaptics();
    if (!HapticsModule) return;

    switch (type) {
      case 'light':
        await HapticsModule.impactAsync(HapticsModule.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await HapticsModule.impactAsync(HapticsModule.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await HapticsModule.impactAsync(HapticsModule.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await HapticsModule.notificationAsync(HapticsModule.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await HapticsModule.notificationAsync(HapticsModule.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await HapticsModule.notificationAsync(HapticsModule.NotificationFeedbackType.Error);
        break;
    }
  } catch (error) {
    // Silently fail - haptics are optional
    console.warn('[Haptics] Error triggering haptic feedback:', error);
  }
}

/**
 * Convenience methods for common haptic patterns
 */
export const HapticsUtil = {
  light: () => triggerHaptic('light'),
  medium: () => triggerHaptic('medium'),
  heavy: () => triggerHaptic('heavy'),
  success: () => triggerHaptic('success'),
  warning: () => triggerHaptic('warning'),
  error: () => triggerHaptic('error'),
};
