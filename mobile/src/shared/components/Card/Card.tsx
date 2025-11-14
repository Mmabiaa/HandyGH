/**
 * Card Component
 * Reusable card with elevation and press interactions
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { borderRadius } from '../../../core/theme/borderRadius';
import { shadows, ShadowKey } from '../../../core/theme/shadows';

export interface CardProps {
  /**
   * Card elevation level
   * @default 'md'
   */
  elevation?: ShadowKey;

  /**
   * Padding inside the card
   * @default 'md'
   */
  padding?: keyof typeof spacing;

  /**
   * Press handler - makes card touchable
   */
  onPress?: () => void;

  /**
   * Long press handler
   */
  onLongPress?: () => void;

  /**
   * Enable haptic feedback on press
   * @default true
   */
  hapticFeedback?: boolean;

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  /**
   * Border radius
   * @default 'md'
   */
  radius?: keyof typeof borderRadius;

  /**
   * Custom background color
   */
  backgroundColor?: string;

  /**
   * Children content
   */
  children: React.ReactNode;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Card Component with elevation and press interactions
 */
export const Card: React.FC<CardProps> = ({
  elevation = 'md',
  padding = 'md',
  onPress,
  onLongPress,
  hapticFeedback = true,
  disabled = false,
  radius = 'md',
  backgroundColor,
  children,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();

  const handlePress = () => {
    if (disabled || !onPress) return;

    // Trigger haptic feedback
    if (hapticFeedback && Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    }

    onPress();
  };

  const handleLongPress = () => {
    if (disabled || !onLongPress) return;

    // Trigger haptic feedback
    if (hapticFeedback && Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    }

    onLongPress();
  };

  const cardStyle: ViewStyle = {
    backgroundColor: backgroundColor || theme.colors.cardBackground,
    borderRadius: borderRadius[radius],
    padding: spacing[padding],
    ...shadows[elevation],
  };

  const combinedStyle = [cardStyle, style];

  // If onPress is provided, make it touchable
  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        style={combinedStyle}
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={disabled}
        activeOpacity={0.8}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{
          disabled,
        }}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // Otherwise, render as a regular view
  return (
    <View
      style={combinedStyle}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
};

/**
 * Card Header Component
 */
export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  rightElement,
  style,
}) => {
  const { Text } = require('../Text');

  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerContent}>
        <Text variant="h6" numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement && <View style={styles.headerRight}>{rightElement}</View>}
    </View>
  );
};

/**
 * Card Content Component
 */
export interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardContent: React.FC<CardContentProps> = ({ children, style }) => {
  return <View style={[styles.content, style]}>{children}</View>;
};

/**
 * Card Footer Component
 */
export interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => {
  return <View style={[styles.footer, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerRight: {
    marginLeft: spacing.md,
  },
  content: {
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
});
