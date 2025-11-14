import { QueryClient } from '@tanstack/react-query';

/**
 * Configure React Query client with optimized cache settings
 * Implements stale-while-revalidate caching strategy
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale-while-revalidate strategy
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes - cache time (formerly cacheTime)

      // Retry configuration
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch configuration
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,

      // Network mode
      networkMode: 'online', // Only fetch when online
    },
    mutations: {
      // Retry configuration for mutations
      retry: 1,
      retryDelay: 1000,

      // Network mode
      networkMode: 'online',
    },
  },
});

/**
 * Invalidate all queries - useful for logout or data refresh
 */
export const invalidateAllQueries = async () => {
  await queryClient.invalidateQueries();
};

/**
 * Clear all query cache - useful for logout
 */
export const clearQueryCache = () => {
  queryClient.clear();
};

/**
 * Prefetch query - useful for optimistic data loading
 */
export const prefetchQuery = async <T>(
  queryKey: unknown[],
  queryFn: () => Promise<T>
) => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
};
