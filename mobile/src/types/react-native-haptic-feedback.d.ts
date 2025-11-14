/**
 * Type declarations for react-native-haptic-feedback
 */

declare module 'react-native-haptic-feedback' {
  export type HapticFeedbackTypes =
    | 'selection'
    | 'impactLight'
    | 'impactMedium'
    | 'impactHeavy'
    | 'notificationSuccess'
    | 'notificationWarning'
    | 'notificationError'
    | 'clockTick'
    | 'contextClick'
    | 'keyboardPress'
    | 'keyboardRelease'
    | 'keyboardTap'
    | 'longPress'
    | 'textHandleMove'
    | 'virtualKey'
    | 'virtualKeyRelease';

  export interface HapticOptions {
    enableVibrateFallback?: boolean;
    ignoreAndroidSystemSettings?: boolean;
  }

  export function trigger(
    type: HapticFeedbackTypes,
    options?: HapticOptions
  ): void;

  const ReactNativeHapticFeedback: {
    trigger: typeof trigger;
  };

  export default ReactNativeHapticFeedback;
}
