/**
 * Typography System
 * Font sizes, weights, and line heights for consistent text styling
 */

import { Platform } from 'react-native';

/**
 * Font Families
 */
export const fontFamily = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  semiBold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
} as const;

/**
 * Font Weights
 */
export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
} as const;

/**
 * Font Sizes
 * Base scale with accessibility support
 */
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

/**
 * Line Heights
 * Calculated for optimal readability
 */
export const lineHeight = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  '2xl': 32,
  '3xl': 40,
  '4xl': 44,
  '5xl': 56,
} as const;

/**
 * Letter Spacing
 */
export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
} as const;

/**
 * Typography Variants
 * Pre-defined text styles for common use cases
 */
export const typography = {
  // Headings
  h1: {
    fontFamily: fontFamily.bold,
    fontWeight: fontWeight.bold,
    fontSize: fontSize['4xl'],
    lineHeight: lineHeight['4xl'],
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontWeight: fontWeight.bold,
    fontSize: fontSize['3xl'],
    lineHeight: lineHeight['3xl'],
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontFamily: fontFamily.bold,
    fontWeight: fontWeight.bold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontFamily: fontFamily.semiBold,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    letterSpacing: letterSpacing.normal,
  },
  h5: {
    fontFamily: fontFamily.semiBold,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    letterSpacing: letterSpacing.normal,
  },
  h6: {
    fontFamily: fontFamily.semiBold,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    letterSpacing: letterSpacing.normal,
  },

  // Body Text
  body: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    letterSpacing: letterSpacing.normal,
  },
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    letterSpacing: letterSpacing.normal,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    letterSpacing: letterSpacing.normal,
  },

  // Labels and Captions
  label: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    letterSpacing: letterSpacing.wide,
  },
  labelLarge: {
    fontFamily: fontFamily.medium,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    letterSpacing: letterSpacing.wide,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontWeight: fontWeight.regular,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    letterSpacing: letterSpacing.normal,
  },

  // Button Text
  button: {
    fontFamily: fontFamily.semiBold,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    letterSpacing: letterSpacing.wide,
  },
  buttonSmall: {
    fontFamily: fontFamily.semiBold,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    letterSpacing: letterSpacing.wide,
  },
  buttonLarge: {
    fontFamily: fontFamily.semiBold,
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    letterSpacing: letterSpacing.wide,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
export type FontSize = keyof typeof fontSize;
export type LineHeight = keyof typeof lineHeight;
