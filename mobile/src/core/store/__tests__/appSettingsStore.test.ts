import { renderHook, act } from '@testing-library/react-native';
import { useAppSettingsStore } from '../appSettingsStore';

// Mock MMKV storage
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    delete: jest.fn(),
    contains: jest.fn(),
    clearAll: jest.fn(),
    getAllKeys: jest.fn(() => []),
  })),
}));

describe('appSettingsStore', () => {
  beforeEach(() => {
    // Reset store to default state
    const { result } = renderHook(() => useAppSettingsStore());
    act(() => {
      result.current.resetPreferences();
    });
  });

  describe('initial state', () => {
    it('should have default preferences', () => {
      const { result } = renderHook(() => useAppSettingsStore());

      expect(result.current.preferences).toEqual({
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
      });
    });
  });

  describe('setTheme', () => {
    it('should update theme preference', () => {
      const { result } = renderHook(() => useAppSettingsStore());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.preferences.theme).toBe('dark');
    });

    it('should support all theme options', () => {
      const { result } = renderHook(() => useAppSettingsStore());

      act(() => {
        result.current.setTheme('light');
      });
      expect(result.current.preferences.theme).toBe('light');

      act(() => {
        result.current.setTheme('dark');
      });
      expect(result.current.preferences.theme).toBe('dark');

      act(() => {
        result.current.setTheme('system');
      });
      expect(result.current.preferences.theme).toBe('system');
    });
  });

  describe('setLanguage', () => {
    it('should update language preference', () => {
      const { result } = renderHook(() => useAppSettingsStore());

      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.preferences.language).toBe('en');
    });
  });

  describe('setNotificationsEnabled', () => {
    it('should enable notifications', () => {
      const { result } = renderHook(() => useAppSettingsStore());

      act(() => {
        result.current.setNotificationsEnabled(false);
      });
      expect(result.current.preferences.notificationsEnabled).toBe(false);

      act(() => {
        result.current.setNotificationsEnabled(true);
      });
      expect(result.current.preferences.notificationsEnabled).toBe(true);
    });
  });

  describe('setNotificationCategory', () => {
    it('should update individual notification categories', () => {
      const { result } = renderHook(() => useAppSettingsStore());

      act(() => {
        result.current.setNotificationCategory('bookings', false);
      });

      expect(result.current.preferences.notificationCategories.bookings).toBe(false);
      expect(result.current.preferences.notificationCategories.messages).toBe(true);
      expect(result.current.preferences.notificationCategories.promotions).toBe(true);
    });

    it('should update multiple categories independently', () => {
      const { result } = renderHook(() => useAppSettingsStore());

      act(() => {
        result.current.setNotificationCategory('bookings', false);
        result.current.setNotificationCategory('promotions', false);
      });

      expect(result.current.preferences.notificationCategories).toEqual({
        bookings: false,
        messages: true,
        promotions: false,
      });
    });
  });

  describe('setLocationPermission', () => {
    it('should update location permission', () => {
      const { result } = renderHook(() => useAppSettingsStore());

      act(() => {
        result.current.setLocationPermission(true);
      });

      expect(result.current.preferences.locationPermission).toBe(true);
    });
  });

  describe('setBiometricEnabled', () => {
    it('should update biometric setting', () => {
      const { result } = renderHook(() => useAppSettingsStore());

      act(() => {
        result.current.setBiometricEnabled(true);
      });

      expect(result.current.preferences.biometricEnabled).toBe(true);
    });
  });

  describe('updatePreferences', () => {
    it('should update multiple preferences at once', () => {
      const { result } = renderHook(() => useAppSettingsStore());

      act(() => {
        result.current.updatePreferences({
          theme: 'dark',
          notificationsEnabled: false,
          biometricEnabled: true,
        });
      });

      expect(result.current.preferences.theme).toBe('dark');
      expect(result.current.preferences.notificationsEnabled).toBe(false);
      expect(result.current.preferences.biometricEnabled).toBe(true);
      // Other preferences should remain unchanged
      expect(result.current.preferences.language).toBe('en');
    });
  });

  describe('resetPreferences', () => {
    it('should reset all preferences to defaults', () => {
      const { result } = renderHook(() => useAppSettingsStore());

      // Change some preferences
      act(() => {
        result.current.setTheme('dark');
        result.current.setNotificationsEnabled(false);
        result.current.setBiometricEnabled(true);
      });

      // Reset
      act(() => {
        result.current.resetPreferences();
      });

      expect(result.current.preferences).toEqual({
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
      });
    });
  });
});
