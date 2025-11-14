/**
 * Text Component
 * Reusable text component with variant support and Dynamic Type scaling
 */

import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  AccessibilityProps,
} from 'react-native';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { typography, TypographyVariant } from '../../../core/theme/typography';
import { ColorName } from '../../../core/theme/colors';

export interface TextProps extends RNTextProps, AccessibilityProps {
  /**
   * Typography variant to apply
   */
  variant?: TypographyVariant;

  /**
   * Text color from theme
   */
  color?: ColorName;

  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right' | 'justify';

  /**
   * Enable Dynamic Type scaling for accessibility
   * @default true
   */
  allowFontScaling?: boolean;

  /**
   * Maximum font scale for Dynamic Type
   * @default 2.0
   */
  maxFontSizeMultiplier?: number;

  /**
   * Children content
   */
  children: React.ReactNode;
}

/**
 * Text Component with variant support and accessibility features
 */
export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'text',
  align = 'left',
  allowFontScaling = true,
  maxFontSizeMultiplier = 2.0,
  style,
  children,
  accessibilityRole = 'text',
  ...rest
}) => {
  const { theme } = useTheme();

  // Get typography style for variant
  const variantStyle = typography[variant];

  // Get color from theme
  const textColor = theme.colors[color];

  // Combine styles
  const combinedStyle = [
    variantStyle,
    {
      color: typeof textColor === 'string' ? textColor : theme.colors.text,
      textAlign: align,
    },
    style,
  ];

  return (
    <RNText
      style={combinedStyle}
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      accessibilityRole={accessibilityRole}
      {...rest}
    >
      {children}
    </RNText>
  );
};

/**
 * Heading Components
 * Convenience components for common heading levels
 */
export const H1: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h1" accessibilityRole="header" {...props} />
);

export const H2: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h2" accessibilityRole="header" {...props} />
);

export const H3: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h3" accessibilityRole="header" {...props} />
);

export const H4: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h4" accessibilityRole="header" {...props} />
);

export const H5: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h5" accessibilityRole="header" {...props} />
);

export const H6: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h6" accessibilityRole="header" {...props} />
);

/**
 * Body Text Components
 */
export const Body: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="body" {...props} />
);

export const BodyLarge: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="bodyLarge" {...props} />
);

export const BodySmall: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="bodySmall" {...props} />
);

/**
 * Label and Caption Components
 */
export const Label: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="label" {...props} />
);

export const LabelLarge: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="labelLarge" {...props} />
);

export const Caption: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="caption" {...props} />
);
