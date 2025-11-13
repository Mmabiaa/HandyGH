/**
 * React Query Client Configuration
 *
 * Professional configuration with:
 * - Intelligent caching (stale-while-revalidate)
 * - Automatic retry with exponential backoff
 * - Offline support
 * - Performance optimization
 *
 * @requirements Req 11 (Offline Mode), Req 13 (Performance)
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Professional Query Client Configuration
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,

      // Keep in cache for 10 minutes
      gcTime: 10 * 60 * 1000, // formerly cacheTime

      // Retry failed requests with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus
      refetchOnWindowFocus: true,

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      retryDelay: 1000,
    },
  },
});

/**
 * Prefetch critical data on app start
 */
export const prefetchCriticalData = async () => {
  // Add prefetch logic here when needed
  // Example:
  // await queryClient.prefetchQuery(['user'], fetchUser);
  // await queryClient.prefetchQuery(['categories'], fetchCategories);
};
