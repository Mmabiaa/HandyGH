import React, { createContext, useContext, ReactNode } from 'react';

const ThemeContext = createContext({});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = {
    colors: {
      gold: '#CFB53B',
      green: '#006B3F',
      red: '#CE1126',
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#06D6A0',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#1E293B',
      textSecondary: '#64748B',
      error: '#EF4444',
      success: '#10B981',
      warning: '#F59E0B',
    },
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
