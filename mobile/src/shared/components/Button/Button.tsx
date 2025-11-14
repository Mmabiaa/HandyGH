/**
 * Button Component
 * Reusable button with variants, sizes, loading states, and haptic feedback
 */

import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { Text } from '../Text';
import { spacing } from '../../../core/theme/spacing';
import { borderRadius } from '../../../core/theme/borderRadius';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /**
   * Button variant
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @default 'medium'
   */
  size?: ButtonSize;

  /**
   * Loading state
   * @default false
   */
  loading?: boolean;

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  /**
   * Icon component to display before text
   */
  icon?: React.ReactNode;

  /**
   * Icon component to display after text
   */
  iconRight?: React.ReactNode;

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Enable haptic feedback on press
   * @default true
   */
  hapticFeedback?: boolean;

  /**
   * Button text
   */
  children: React.ReactNode;

  /**
   * Custom style
   */
  style?: any;
}

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Button Component with variants, sizes, and loading states
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = false,
  hapticFeedback = true,
  children,
  style,
  onPress,
  accessibilityLabel,
  ...rest
}) => {
  const { theme } = useTheme();

  const isDisabled = disabled || loading;

  // Handle press with haptic feedback
  const handlePress = (event: any) => {
    if (isDisabled || !onPress) return;

    // Trigger haptic feedback
    if (hapticFeedback && Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    }

    onPress(event);
  };

  // Get button styles based on variant
  const getButtonStyles = () => {
    const baseStyle = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderRadius: borderRadius.md,
      borderWidth: variant === 'outline' ? 1 : 0,
    };

    // Size styles
    const sizeStyles = {
      small: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        minHeight: 36,
      },
      medium: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        minHeight: 44,
      },
      large: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: isDisabled
          ? theme.colors.neutral[300]
          : theme.colors.primary,
        borderColor: 'transparent',
      },
      secondary: {
        backgroundColor: isDisabled
          ? theme.colors.neutral[200]
          : theme.colors.secondary,
        borderColor: 'transparent',
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: isDisabled
          ? theme.colors.neutral[300]
          : theme.colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
    };

    return [
      baseStyle,
      sizeStyles[size],
      variantStyles[variant],
      fullWidth && { width: '100%' },
      style,
    ];
  };

  // Get text color based on variant
  const getTextColor = () => {
    if (isDisabled) {
      return variant === 'outline' || variant === 'ghost'
        ? 'textDisabled'
        : 'textOnPrimary';
    }

    switch (variant) {
      case 'primary':
        return 'textOnPrimary';
      case 'secondary':
        return 'textOnSecondary';
      case 'outline':
      case 'ghost':
        return 'primary';
      default:
        return 'text';
    }
  };

  // Get text variant based on size
  const getTextVariant = () => {
    switch (size) {
      case 'small':
        return 'buttonSmall';
      case 'large':
        return 'buttonLarge';
      default:
        return 'button';
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyles()}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost'
              ? theme.colors.primary
              : theme.colors.textOnPrimary
          }
        />
      ) : (
        <>
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          <Text variant={getTextVariant()} color={getTextColor() as any}>
            {children}
          </Text>
          {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});
