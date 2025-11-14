import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKVStorage } from '../storage/MMKVStorage';
import type { CustomerProfile, ProviderProfile } from './types';

interface UserProfileState {
  // State
  customerProfile: CustomerProfile | null;
  providerProfile: ProviderProfile | null;

  // Actions
  setCustomerProfile: (profile: CustomerProfile | null) => void;
  setProviderProfile: (profile: ProviderProfile | null) => void;
  updateCustomerProfile: (updates: Partial<CustomerProfile>) => void;
  updateProviderProfile: (updates: Partial<ProviderProfile>) => void;
  addFavoriteProvider: (providerId: string) => void;
  removeFavoriteProvider: (providerId: string) => void;
  isFavoriteProvider: (providerId: string) => boolean;
  clearProfile: () => void;
}

/**
 * User profile store for managing customer and provider profile data
 * Separate from auth store to allow for more granular updates
 */
export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set, get) => ({
      // Initial state
      customerProfile: null,
      providerProfile: null,

      // Set customer profile
      setCustomerProfile: (profile) => {
        set({ customerProfile: profile });
      },

      // Set provider profile
      setProviderProfile: (profile) => {
        set({ providerProfile: profile });
      },

      // Update customer profile
      updateCustomerProfile: (updates) => {
        const currentProfile = get().customerProfile;
        if (currentProfile) {
          set({
            customerProfile: { ...currentProfile, ...updates },
          });
        }
      },

      // Update provider profile
      updateProviderProfile: (updates) => {
        const currentProfile = get().providerProfile;
        if (currentProfile) {
          set({
            providerProfile: { ...currentProfile, ...updates },
          });
        }
      },

      // Add provider to favorites
      addFavoriteProvider: (providerId) => {
        const currentProfile = get().customerProfile;
        if (currentProfile) {
          const favoriteProviders = currentProfile.favoriteProviders || [];
          if (!favoriteProviders.includes(providerId)) {
            set({
              customerProfile: {
                ...currentProfile,
                favoriteProviders: [...favoriteProviders, providerId],
              },
            });
          }
        }
      },

      // Remove provider from favorites
      removeFavoriteProvider: (providerId) => {
        const currentProfile = get().customerProfile;
        if (currentProfile) {
          const favoriteProviders = currentProfile.favoriteProviders || [];
          set({
            customerProfile: {
              ...currentProfile,
              favoriteProviders: favoriteProviders.filter(id => id !== providerId),
            },
          });
        }
      },

      // Check if provider is favorited
      isFavoriteProvider: (providerId) => {
        const currentProfile = get().customerProfile;
        if (currentProfile) {
          return currentProfile.favoriteProviders?.includes(providerId) ?? false;
        }
        return false;
      },

      // Clear all profile data
      clearProfile: () => {
        set({
          customerProfile: null,
          providerProfile: null,
        });
      },
    }),
    {
      name: 'user-profile-storage',
      storage: createJSONStorage(() => ({
        setItem: (name, value) => {
          MMKVStorage.set(name, value);
        },
        getItem: (name) => {
          const value = MMKVStorage.getString(name);
          return value ?? null;
        },
        removeItem: (name) => {
          MMKVStorage.delete(name);
        },
      })),
    }
  )
);
