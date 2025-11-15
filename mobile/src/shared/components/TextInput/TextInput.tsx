/**
 * TextInput Component
 * Reusable text input with validation, error states, and accessibility labels
 */

import React, { useState } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { Text } from '../Text';
import { spacing } from '../../../core/theme/spacing';
import { borderRadius } from '../../../core/theme/borderRadius';

export interface TextInputProps extends RNTextInputProps {
  /**
   * Input label
   */
  label?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Helper text to display below input
   */
  helperText?: string;

  /**
   * Left icon component
   */
  leftIcon?: React.ReactNode;

  /**
   * Right icon component
   */
  rightIcon?: React.ReactNode;

  /**
   * Show/hide password toggle for secure inputs
   * @default false
   */
  showPasswordToggle?: boolean;

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  /**
   * Required field indicator
   * @default false
   */
  required?: boolean;

  /**
   * Container style
   */
  containerStyle?: any;
}

/**
 * TextInput Component with validation and accessibility features
 */
export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  disabled = false,
  required = false,
  secureTextEntry,
  containerStyle,
  style,
  accessibilityLabel,
  ...rest
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasError = !!error;
  const isSecure = secureTextEntry && !isPasswordVisible;

  // Get border color based on state
  const getBorderColor = () => {
    if (hasError) return theme.colors.error;
    if (isFocused) return theme.colors.inputBorderFocused;
    return theme.colors.inputBorder;
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <Text variant="label" color="textSecondary" style={styles.label}>
            {label}
            {required && (
              <Text variant="label" color="error">
                {' *'}
              </Text>
            )}
          </Text>
        </View>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: disabled
              ? theme.colors.neutral[100]
              : theme.colors.inputBackground,
            borderColor: getBorderColor(),
            borderWidth: 1,
            borderRadius: borderRadius.md,
          },
          disabled && styles.disabled,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        {/* Text Input */}
        <RNTextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              flex: 1,
            },
            style,
          ]}
          placeholderTextColor={theme.colors.textTertiary}
          secureTextEntry={isSecure}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={helperText}
          accessibilityState={{
            disabled,
          }}
          {...rest}
        />

        {/* Password Toggle */}
        {showPasswordToggle && secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.rightIcon}
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
          >
            <Text variant="body" color="textSecondary">
              {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Right Icon */}
        {rightIcon && !showPasswordToggle && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>

      {/* Error Message */}
      {hasError && (
        <Text
          variant="caption"
          color="error"
          style={styles.errorText}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}

      {/* Helper Text */}
      {!hasError && helperText && (
        <Text variant="caption" color="textSecondary" style={styles.helperText}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    marginBottom: spacing.xs,
  },
  label: {
    marginBottom: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
  },
  leftIcon: {
    marginLeft: spacing.md,
  },
  rightIcon: {
    marginRight: spacing.md,
  },
  disabled: {
    opacity: 0.6,
  },
  errorText: {
    marginTop: spacing.xs,
  },
  helperText: {
    marginTop: spacing.xs,
  },
});
