import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '../authStore';
import { SecureTokenStorage } from '../../storage';
import type { User } from '../types';

// Mock SecureTokenStorage
jest.mock('../../storage/SecureTokenStorage', () => ({
  SecureTokenStorage: {
    saveTokens: jest.fn(),
    getTokens: jest.fn(),
    clearTokens: jest.fn(),
    hasTokens: jest.fn(),
  },
}));

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

describe('authStore', () => {
  const mockUser: User = {
    id: 'user-1',
    phoneNumber: '+233241234567',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'customer',
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.setUser(null);
      result.current.setAuthenticated(false);
      result.current.setLoading(false);
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('setUser', () => {
    it('should set user and update authenticated status', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear user and set authenticated to false when user is null', () => {
      const { result } = renderHook(() => useAuthStore());

      // First set a user
      act(() => {
        result.current.setUser(mockUser);
      });

      // Then clear it
      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should save tokens and set user state', async () => {
      const { result } = renderHook(() => useAuthStore());
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      await act(async () => {
        await result.current.login(mockUser, accessToken, refreshToken);
      });

      expect(SecureTokenStorage.saveTokens).toHaveBeenCalledWith(accessToken, refreshToken);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should throw error if token save fails', async () => {
      const { result } = renderHook(() => useAuthStore());
      const error = new Error('Failed to save tokens');

      (SecureTokenStorage.saveTokens as jest.Mock).mockRejectedValueOnce(error);

      await expect(
        act(async () => {
          await result.current.login(mockUser, 'token', 'refresh');
        })
      ).rejects.toThrow('Failed to save tokens');
    });
  });

  describe('logout', () => {
    it('should clear tokens and reset state', async () => {
      const { result } = renderHook(() => useAuthStore());

      // First login
      await act(async () => {
        await result.current.login(mockUser, 'token', 'refresh');
      });

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      expect(SecureTokenStorage.clearTokens).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('should update user properties', () => {
      const { result } = renderHook(() => useAuthStore());

      // Set initial user
      act(() => {
        result.current.setUser(mockUser);
      });

      // Update user
      act(() => {
        result.current.updateUser({ firstName: 'Jane', email: 'jane@example.com' });
      });

      expect(result.current.user?.firstName).toBe('Jane');
      expect(result.current.user?.email).toBe('jane@example.com');
      expect(result.current.user?.lastName).toBe('Doe'); // Should preserve other fields
    });

    it('should not update if user is null', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.updateUser({ firstName: 'Jane' });
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('hydrate', () => {
    it('should set authenticated to true if tokens exist', async () => {
      const { result } = renderHook(() => useAuthStore());

      (SecureTokenStorage.hasTokens as jest.Mock).mockResolvedValueOnce(true);

      await act(async () => {
        await result.current.hydrate();
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should set authenticated to false if no tokens exist', async () => {
      const { result } = renderHook(() => useAuthStore());

      (SecureTokenStorage.hasTokens as jest.Mock).mockResolvedValueOnce(false);

      await act(async () => {
        await result.current.hydrate();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const { result } = renderHook(() => useAuthStore());

      (SecureTokenStorage.hasTokens as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      await act(async () => {
        await result.current.hydrate();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
