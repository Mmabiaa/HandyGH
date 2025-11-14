import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { MMKVStorage } from '../storage/MMKVStorage';

/**
 * Create persister for React Query cache using MMKV
 * This enables offline data access by persisting query cache
 */
export const queryPersister = createAsyncStoragePersister({
  storage: {
    getItem: async (key: string) => {
      const value = MMKVStorage.getString(key);
      return value ?? null;
    },
    setItem: async (key: string, value: string) => {
      MMKVStorage.set(key, value);
    },
    removeItem: async (key: string) => {
      MMKVStorage.delete(key);
    },
  },
  throttleTime: 1000, // Throttle writes to storage
});

/**
 * Configure React Query client with optimized cache settings
 * Implements stale-while-revalidate caching strategy with offline support
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale-while-revalidate strategy
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      gcTime: 24 * 60 * 60 * 1000, // 24 hours - cache time for offline access

      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch configuration
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: 'always',

      // Network mode - allow offline queries to return cached data
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry configuration for mutations
      retry: 1,
      retryDelay: 1000,

      // Network mode - mutations require network
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
