/**
 * Theme Configuration
 * Main theme object combining colors, spacing, typography, etc.
 */

import { lightTheme, darkTheme, ThemeColors } from './colors';
import { spacing } from './spacing';
import { shadows } from './shadows';
import { borderRadius } from './borderRadius';

export interface Theme {
  colors: ThemeColors;
  spacing: typeof spacing;
  shadows: typeof shadows;
  borderRadius: typeof borderRadius;
  isDark: boolean;
}

export const createTheme = (mode: 'light' | 'dark'): Theme => ({
  colors: mode === 'light' ? lightTheme : darkTheme,
  spacing,
  shadows,
  borderRadius,
  isDark: mode === 'dark',
});

export const lightThemeConfig = createTheme('light');
export const darkThemeConfig = createTheme('dark');
