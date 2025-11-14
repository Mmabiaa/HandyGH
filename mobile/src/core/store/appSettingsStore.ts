import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../storage/ZustandStorageAdapter';
import type { UserPreferences } from './types';

interface AppSettingsState {
  // State
  preferences: UserPreferences;

  // Actions
  setTheme: (theme: UserPreferences['theme']) => void;
  setLanguage: (language: UserPreferences['language']) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNotificationCategory: (category: keyof UserPreferences['notificationCategories'], enabled: boolean) => void;
  setLocationPermission: (enabled: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  notificationsEnabled: true,
  notificationCategories: {
    bookings: true,
    messages: true,
    promotions: true,
  },
  locationPermission: false,
  biometricEnabled: false,
};

/**
 * App settings store for managing user preferences
 * Persisted to MMKV for fast access and hydration
 */
export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      // Initial state
      preferences: defaultPreferences,

      // Set theme
      setTheme: (theme) => {
        set((state) => ({
          preferences: { ...state.preferences, theme },
        }));
      },

      // Set language
      setLanguage: (language) => {
        set((state) => ({
          preferences: { ...state.preferences, language },
        }));
      },

      // Set notifications enabled
      setNotificationsEnabled: (enabled) => {
        set((state) => ({
          preferences: { ...state.preferences, notificationsEnabled: enabled },
        }));
      },

      // Set notification category
      setNotificationCategory: (category, enabled) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            notificationCategories: {
              ...state.preferences.notificationCategories,
              [category]: enabled,
            },
          },
        }));
      },

      // Set location permission
      setLocationPermission: (enabled) => {
        set((state) => ({
          preferences: { ...state.preferences, locationPermission: enabled },
        }));
      },

      // Set biometric enabled
      setBiometricEnabled: (enabled) => {
        set((state) => ({
          preferences: { ...state.preferences, biometricEnabled: enabled },
        }));
      },

      // Update multiple preferences at once
      updatePreferences: (updates) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        }));
      },

      // Reset to default preferences
      resetPreferences: () => {
        set({ preferences: defaultPreferences });
      },
    }),
    {
      name: 'app-settings-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
