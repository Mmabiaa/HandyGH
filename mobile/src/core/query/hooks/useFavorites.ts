/**
 * Favorites Hooks
 *
 * Custom hooks for managing favorite providers with API integration.
 * Implements optimistic updates for better UX.
 *
 * Requirements: 3.8
 */

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFavoritesStore } from '../../store/favoritesStore';
import { queryKeys } from '../queryKeys';

/**
 * Hook for toggling favorite status
 */
export const useFavoriteToggle = () => {
  const queryClient = useQueryClient();
  const isFavorite = useFavoritesStore((state) => state.isFavorite);

  const favoriteMutation = useMutation({
    mutationFn: async ({ providerId, action }: { providerId: string; action: 'add' | 'remove' }) => {
      // TODO: Replace with actual API call
      // if (action === 'add') {
      //   await providerService.favoriteProvider(providerId);
      // } else {
      //   await providerService.unfavoriteProvider(providerId);
      // }

      // Simulate API call - use parameters to avoid unused warning
      console.log(`${action} favorite for provider ${providerId}`);
      return new Promise((resolve) => setTimeout(resolve, 500));
    },
    onMutate: async ({ providerId, action }: { providerId: string; action: 'add' | 'remove' }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.providers.all });

      // Optimistically update the store
      const { addFavorite, removeFavorite } = useFavoritesStore.getState();
      if (action === 'add') {
        addFavorite(providerId);
      } else {
        removeFavorite(providerId);
      }

      // Return context for rollback
      return { providerId, action };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context) {
        const { addFavorite, removeFavorite } = useFavoritesStore.getState();
        if (context.action === 'add') {
          removeFavorite(context.providerId);
        } else {
          addFavorite(context.providerId);
        }
      }
    },
    onSettled: () => {
      // Refetch providers to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.providers.all });
    },
  });

  const toggleFavorite = useCallback(
    (providerId: string) => {
      const currentlyFavorite = isFavorite(providerId);
      const action = currentlyFavorite ? 'remove' : 'add';

      favoriteMutation.mutate({ providerId, action });
    },
    [favoriteMutation, isFavorite]
  );

  return {
    toggleFavorite,
    isFavorite,
    isLoading: favoriteMutation.isPending,
  };
};

/**
 * Hook for getting favorite providers
 */
export const useFavoriteProviders = () => {
  const { favoriteProviderIds } = useFavoritesStore();

  // TODO: In a real app, fetch favorite providers from API
  // For now, we'll return the IDs and let the UI handle fetching
  return {
    favoriteProviderIds,
    count: favoriteProviderIds.length,
  };
};
