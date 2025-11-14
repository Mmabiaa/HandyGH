/**
 * Border Radius System
 * Consistent border radius values for components
 */

export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type BorderRadiusKey = keyof typeof borderRadius;
export type BorderRadiusValue = typeof borderRadius[BorderRadiusKey];
