import { renderHook, act } from '@testing-library/react-native';
import { useUserProfileStore } from '../userProfileStore';
import type { CustomerProfile, ProviderProfile } from '../types';

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

describe('userProfileStore', () => {
  const mockCustomerProfile: CustomerProfile = {
    id: 'customer-1',
    phoneNumber: '+233241234567',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'customer',
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    favoriteProviders: ['provider-1', 'provider-2'],
    defaultLocation: {
      address: 'East Legon, Accra',
      city: 'Accra',
      region: 'Greater Accra',
      coordinates: { latitude: 5.6037, longitude: -0.1870 },
    },
  };

  const mockProviderProfile: ProviderProfile = {
    id: 'provider-1',
    phoneNumber: '+233501234567',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'provider',
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    businessName: 'Jane Plumbing Services',
    businessDescription: 'Professional plumbing services',
    categories: ['plumbing'],
    rating: 4.5,
    totalReviews: 100,
    totalServices: 250,
    responseRate: 95,
    verificationStatus: 'verified',
  };

  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useUserProfileStore());
    act(() => {
      result.current.clearProfile();
    });
  });

  describe('setCustomerProfile', () => {
    it('should set customer profile', () => {
      const { result } = renderHook(() => useUserProfileStore());

      act(() => {
        result.current.setCustomerProfile(mockCustomerProfile);
      });

      expect(result.current.customerProfile).toEqual(mockCustomerProfile);
    });

    it('should clear customer profile when set to null', () => {
      const { result } = renderHook(() => useUserProfileStore());

      act(() => {
        result.current.setCustomerProfile(mockCustomerProfile);
      });

      act(() => {
        result.current.setCustomerProfile(null);
      });

      expect(result.current.customerProfile).toBeNull();
    });
  });

  describe('setProviderProfile', () => {
    it('should set provider profile', () => {
      const { result } = renderHook(() => useUserProfileStore());

      act(() => {
        result.current.setProviderProfile(mockProviderProfile);
      });

      expect(result.current.providerProfile).toEqual(mockProviderProfile);
    });
  });

  describe('updateCustomerProfile', () => {
    it('should update customer profile properties', () => {
      const { result } = renderHook(() => useUserProfileStore());

      act(() => {
        result.current.setCustomerProfile(mockCustomerProfile);
      });

      act(() => {
        result.current.updateCustomerProfile({ firstName: 'Johnny' });
      });

      expect(result.current.customerProfile?.firstName).toBe('Johnny');
      expect(result.current.customerProfile?.lastName).toBe('Doe');
    });

    it('should not update if customer profile is null', () => {
      const { result } = renderHook(() => useUserProfileStore());

      act(() => {
        result.current.updateCustomerProfile({ firstName: 'Johnny' });
      });

      expect(result.current.customerProfile).toBeNull();
    });
  });

  describe('updateProviderProfile', () => {
    it('should update provider profile properties', () => {
      const { result } = renderHook(() => useUserProfileStore());

      act(() => {
        result.current.setProviderProfile(mockProviderProfile);
      });

      act(() => {
        result.current.updateProviderProfile({ rating: 4.8 });
      });

      expect(result.current.providerProfile?.rating).toBe(4.8);
      expect(result.current.providerProfile?.businessName).toBe('Jane Plumbing Services');
    });
  });

  describe('favorite providers', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useUserProfileStore());
      act(() => {
        result.current.setCustomerProfile(mockCustomerProfile);
      });
    });

    it('should add provider to favorites', () => {
      const { result } = renderHook(() => useUserProfileStore());

      act(() => {
        result.current.addFavoriteProvider('provider-3');
      });

      expect(result.current.customerProfile?.favoriteProviders).toContain('provider-3');
      expect(result.current.customerProfile?.favoriteProviders).toHaveLength(3);
    });

    it('should not add duplicate provider to favorites', () => {
      const { result } = renderHook(() => useUserProfileStore());

      act(() => {
        result.current.addFavoriteProvider('provider-1');
      });

      expect(result.current.customerProfile?.favoriteProviders).toHaveLength(2);
    });

    it('should remove provider from favorites', () => {
      const { result } = renderHook(() => useUserProfileStore());

      act(() => {
        result.current.removeFavoriteProvider('provider-1');
      });

      expect(result.current.customerProfile?.favoriteProviders).not.toContain('provider-1');
      expect(result.current.customerProfile?.favoriteProviders).toHaveLength(1);
    });

    it('should check if provider is favorited', () => {
      const { result } = renderHook(() => useUserProfileStore());

      expect(result.current.isFavoriteProvider('provider-1')).toBe(true);
      expect(result.current.isFavoriteProvider('provider-3')).toBe(false);
    });

    it('should return false for favorite check when no customer profile', () => {
      const { result } = renderHook(() => useUserProfileStore());

      act(() => {
        result.current.clearProfile();
      });

      expect(result.current.isFavoriteProvider('provider-1')).toBe(false);
    });
  });

  describe('clearProfile', () => {
    it('should clear both customer and provider profiles', () => {
      const { result } = renderHook(() => useUserProfileStore());

      act(() => {
        result.current.setCustomerProfile(mockCustomerProfile);
        result.current.setProviderProfile(mockProviderProfile);
      });

      act(() => {
        result.current.clearProfile();
      });

      expect(result.current.customerProfile).toBeNull();
      expect(result.current.providerProfile).toBeNull();
    });
  });
});
