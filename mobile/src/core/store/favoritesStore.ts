/**
 * Favorites Store
 *
 * Manages favorite providers state using Zustand.
 * Provides optimistic updates for favorite/unfavorite actions.
 *
 * Requirements: 3.8
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKVStorage } from '../storage/MMKVStorage';

interface FavoritesState {
  favoriteProviderIds: string[];
  addFavorite: (providerId: string) => void;
  removeFavorite: (providerId: string) => void;
  isFavorite: (providerId: string) => boolean;
  clearFavorites: () => void;
}

/**
 * Favorites Store
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteProviderIds: [],

      addFavorite: (providerId: string) => {
        set((state) => ({
          favoriteProviderIds: [...new Set([...state.favoriteProviderIds, providerId])],
        }));
      },

      removeFavorite: (providerId: string) => {
        set((state) => ({
          favoriteProviderIds: state.favoriteProviderIds.filter((id) => id !== providerId),
        }));
      },

      isFavorite: (providerId: string) => {
        return get().favoriteProviderIds.includes(providerId);
      },

      clearFavorites: () => {
        set({ favoriteProviderIds: [] });
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => MMKVStorage.getItem(name),
        setItem: (name, value) => MMKVStorage.setItem(name, value),
        removeItem: (name) => MMKVStorage.removeItem(name),
      })),
    }
  )
);
