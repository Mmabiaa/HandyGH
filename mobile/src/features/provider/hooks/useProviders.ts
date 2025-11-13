/**
 * Provider Hooks
 *
 * React Query hooks for provider data with:
 * - Intelligent caching
 * - Automatic refetching
 * - Optimistic updates
 * - Infinite scroll support
 *
 * @requirements Req 2 (Provider Discovery), Req 13 (Performance)
 */

import { useQuery, useInfiniteQuery, UseQueryOptions } from '@tanstack/react-query';
import { providerService } from '../services/providerService';
import {
  Provider,
  ProviderFilters,
  ProviderListResponse,
  ServiceCategory,
} from '../types/provider.types';

/**
 * Hook for searching providers with filters
 */
export const useProviders = (
  filters: ProviderFilters,
  options?: UseQueryOptions<ProviderListResponse>
) => {
  return useQuery({
    queryKey: ['providers', filters],
    queryFn: () => providerService.searchProviders(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook for infinite scroll provider list
 */
export const useInfiniteProviders = (filters: ProviderFilters) => {
  return useInfiniteQuery({
    queryKey: ['providers', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      providerService.searchProviders({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      // Extract page number from next URL if exists
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        return url.searchParams.get('page');
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for getting a single provider
 */
export const useProvider = (
  id: string,
  options?: UseQueryOptions<Provider>
) => {
  return useQuery({
    queryKey: ['provider', id],
    queryFn: () => providerService.getProvider(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook for getting service categories
 */
export const useCategories = (
  options?: UseQueryOptions<ServiceCategory[]>
) => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => providerService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes (categories don't change often)
    ...options,
  });
};

/**
 * Hook for getting featured providers
 */
export const useFeaturedProviders = (
  options?: UseQueryOptions<Provider[]>
) => {
  return useQuery({
    queryKey: ['providers', 'featured'],
    queryFn: () => providerService.getFeaturedProviders(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook for getting nearby providers
 */
export const useNearbyProviders = (
  latitude: number | null,
  longitude: number | null,
  radius: number = 10,
  options?: UseQueryOptions<Provider[]>
) => {
  return useQuery({
    queryKey: ['providers', 'nearby', latitude, longitude, radius],
    queryFn: () => providerService.getNearbyProviders(latitude!, longitude!, radius),
    enabled: latitude !== null && longitude !== null,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
