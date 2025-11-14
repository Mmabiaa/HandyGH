/**
 * Color Palette for HandyGH Mobile Application
 * Professional color palette with Ghana accent colors
 */

export const colors = {
  // Primary Colors - Ghana-inspired
  primary: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107', // Main primary - Ghana gold
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },

  // Secondary Colors - Ghana green
  secondary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Main secondary - Ghana green
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  // Accent Colors - Ghana red
  accent: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336', // Main accent - Ghana red
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },

  // Neutral Colors
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    1000: '#000000',
  },

  // Semantic Colors
  success: {
    light: '#81C784',
    main: '#4CAF50',
    dark: '#388E3C',
    contrast: '#FFFFFF',
  },

  error: {
    light: '#E57373',
    main: '#F44336',
    dark: '#D32F2F',
    contrast: '#FFFFFF',
  },

  warning: {
    light: '#FFB74D',
    main: '#FF9800',
    dark: '#F57C00',
    contrast: '#000000',
  },

  info: {
    light: '#64B5F6',
    main: '#2196F3',
    dark: '#1976D2',
    contrast: '#FFFFFF',
  },
} as const;

/**
 * Light Theme Colors
 */
export const lightTheme = {
  // Brand Colors
  primary: colors.primary[500],
  primaryLight: colors.primary[300],
  primaryDark: colors.primary[700],
  secondary: colors.secondary[500],
  secondaryLight: colors.secondary[300],
  secondaryDark: colors.secondary[700],
  accent: colors.accent[500],

  // Neutral Colors (for direct access)
  neutral: colors.neutral,

  // Background Colors
  background: colors.neutral[0],
  backgroundSecondary: colors.neutral[50],
  backgroundTertiary: colors.neutral[100],
  surface: colors.neutral[0],
  surfaceElevated: colors.neutral[0],

  // Text Colors
  text: colors.neutral[900],
  textSecondary: colors.neutral[700],
  textTertiary: colors.neutral[600],
  textDisabled: colors.neutral[400],
  textOnPrimary: colors.neutral[0],
  textOnSecondary: colors.neutral[0],
  textOnAccent: colors.neutral[0],

  // Border Colors
  border: colors.neutral[300],
  borderLight: colors.neutral[200],
  borderDark: colors.neutral[400],

  // Semantic Colors
  success: colors.success.main,
  successLight: colors.success.light,
  successDark: colors.success.dark,
  error: colors.error.main,
  errorLight: colors.error.light,
  errorDark: colors.error.dark,
  warning: colors.warning.main,
  warningLight: colors.warning.light,
  warningDark: colors.warning.dark,
  info: colors.info.main,
  infoLight: colors.info.light,
  infoDark: colors.info.dark,

  // Component-specific Colors
  cardBackground: colors.neutral[0],
  inputBackground: colors.neutral[50],
  inputBorder: colors.neutral[300],
  inputBorderFocused: colors.primary[500],
  divider: colors.neutral[200],
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',

  // Status Colors
  online: colors.success.main,
  offline: colors.neutral[400],
  busy: colors.warning.main,
  away: colors.warning.light,
} as const;

/**
 * Dark Theme Colors
 */
export const darkTheme = {
  // Brand Colors
  primary: colors.primary[400],
  primaryLight: colors.primary[300],
  primaryDark: colors.primary[600],
  secondary: colors.secondary[400],
  secondaryLight: colors.secondary[300],
  secondaryDark: colors.secondary[600],
  accent: colors.accent[400],

  // Neutral Colors (for direct access)
  neutral: colors.neutral,

  // Background Colors
  background: colors.neutral[900],
  backgroundSecondary: colors.neutral[800],
  backgroundTertiary: colors.neutral[700],
  surface: colors.neutral[800],
  surfaceElevated: colors.neutral[700],

  // Text Colors
  text: colors.neutral[50],
  textSecondary: colors.neutral[300],
  textTertiary: colors.neutral[400],
  textDisabled: colors.neutral[600],
  textOnPrimary: colors.neutral[900],
  textOnSecondary: colors.neutral[900],
  textOnAccent: colors.neutral[900],

  // Border Colors
  border: colors.neutral[700],
  borderLight: colors.neutral[800],
  borderDark: colors.neutral[600],

  // Semantic Colors
  success: colors.success.light,
  successLight: colors.success.light,
  successDark: colors.success.dark,
  error: colors.error.light,
  errorLight: colors.error.light,
  errorDark: colors.error.dark,
  warning: colors.warning.light,
  warningLight: colors.warning.light,
  warningDark: colors.warning.dark,
  info: colors.info.light,
  infoLight: colors.info.light,
  infoDark: colors.info.dark,

  // Component-specific Colors
  cardBackground: colors.neutral[800],
  inputBackground: colors.neutral[700],
  inputBorder: colors.neutral[600],
  inputBorderFocused: colors.primary[400],
  divider: colors.neutral[700],
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',

  // Status Colors
  online: colors.success.light,
  offline: colors.neutral[600],
  busy: colors.warning.light,
  away: colors.warning.light,
} as const;

export type ThemeColors = typeof lightTheme;
export type ColorName = keyof ThemeColors;
