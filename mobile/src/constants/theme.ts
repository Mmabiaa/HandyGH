import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const colors = {
  primary: '#01ce42ff',      // Green
  primaryDark: '#4bb767ff',
  primaryLight: '#53da84ff',

  secondary: '#10B981',    // Green
  secondaryDark: '#059669',
  secondaryLight: '#34D399',

  accent: '#F59E0B',       // Amber
  accentDark: '#D97706',
  accentLight: '#FBBF24',

  error: '#EF4444',        // Red
  errorDark: '#DC2626',
  errorLight: '#F87171',

  success: '#10B981',      // Green
  warning: '#F59E0B',      // Amber
  info: '#3B82F6',         // Blue

  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceDark: '#F3F4F6',

  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textDisabled: '#D1D5DB',

  border: '#E5E7EB',
  borderDark: '#D1D5DB',

  white: '#FFFFFF',
  black: '#000000',

  // Status colors
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  inProgress: '#8B5CF6',
  completed: '#10B981',
  cancelled: '#EF4444',

  // Rating
  star: '#FBBF24',
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
  },
  roundness: 8,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
