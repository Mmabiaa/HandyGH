import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { ProviderService } from '../../api/services';
import { queryKeys, getRelatedQueryKeys } from '../queryKeys';
import type { Provider, ProviderQueryParams, Service, Review, PaginatedResponse } from '../../api/types';

/**
 * Hook to fetch providers list with optional filters
 */
export const useProviders = (
  params: ProviderQueryParams = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<Provider>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.providers.list(params),
    queryFn: () => ProviderService.getProviders(params),
    ...options,
  });
};

/**
 * Hook to fetch a single provider by ID
 */
export const useProvider = (
  providerId: string,
  options?: Omit<UseQueryOptions<Provider>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.providers.detail(providerId),
    queryFn: () => ProviderService.getProviderById(providerId),
    enabled: !!providerId,
    ...options,
  });
};

/**
 * Hook to fetch provider services
 */
export const useProviderServices = (
  providerId: string,
  options?: Omit<UseQueryOptions<Service[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.providers.services(providerId),
    queryFn: () => ProviderService.getProviderServices(providerId),
    enabled: !!providerId,
    ...options,
  });
};

/**
 * Hook to fetch provider reviews with pagination
 */
export const useProviderReviews = (
  providerId: string,
  page: number = 1,
  options?: Omit<UseQueryOptions<PaginatedResponse<Review>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.providers.reviewsPaginated(providerId, page),
    queryFn: () => ProviderService.getProviderReviews(providerId, page),
    enabled: !!providerId,
    ...options,
  });
};

/**
 * Hook to favorite a provider
 */
export const useFavoriteProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (providerId: string) => ProviderService.favoriteProvider(providerId),
    onSuccess: (_, providerId) => {
      // Invalidate related queries
      const relatedKeys = getRelatedQueryKeys.afterProviderFavorite(providerId);
      relatedKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key as any });
      });
    },
  });
};

/**
 * Hook to unfavorite a provider
 */
export const useUnfavoriteProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (providerId: string) => ProviderService.unfavoriteProvider(providerId),
    onSuccess: (_, providerId) => {
      // Invalidate related queries
      const relatedKeys = getRelatedQueryKeys.afterProviderFavorite(providerId);
      relatedKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key as any });
      });
    },
  });
};

/**
 * Hook to search providers
 */
export const useSearchProviders = (
  searchQuery: string,
  options?: Omit<UseQueryOptions<PaginatedResponse<Provider>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.providers.list({ search: searchQuery }),
    queryFn: () => ProviderService.getProviders({ search: searchQuery }),
    enabled: searchQuery.length > 0,
    ...options,
  });
};
