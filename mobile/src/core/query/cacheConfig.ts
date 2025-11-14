/**
 * Cache configuration for different data types
 * Defines stale times and cache times based on data volatility
 */

export const CACHE_CONFIG = {
  /**
   * Provider data - relatively static, cache for longer
   * Stale-while-revalidate: Show cached data while fetching fresh data
   */
  providers: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  },

  /**
   * Provider details - includes reviews and services, cache moderately
   */
  providerDetails: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 12 * 60 * 60 * 1000, // 12 hours
  },

  /**
   * Service categories - very static, cache for long time
   */
  categories: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  /**
   * Bookings - frequently updated, shorter cache
   */
  bookings: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  },

  /**
   * Active bookings - very dynamic, minimal stale time
   */
  activeBookings: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 6 * 60 * 60 * 1000, // 6 hours
  },

  /**
   * Messages - real-time data, minimal stale time
   */
  messages: {
    staleTime: 0, // Always stale, refetch on mount
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  },

  /**
   * User profile - moderately static
   */
  profile: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  },

  /**
   * Reviews - relatively static
   */
  reviews: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  },

  /**
   * Availability - dynamic, short cache
   */
  availability: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 1 * 60 * 60 * 1000, // 1 hour
  },

  /**
   * Dashboard metrics - moderately dynamic
   */
  dashboard: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 12 * 60 * 60 * 1000, // 12 hours
  },

  /**
   * Earnings data - updated daily
   */
  earnings: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  },
};

/**
 * Maximum cache size limits (number of items)
 */
export const CACHE_LIMITS = {
  providers: 100,
  bookings: 50,
  messages: 500,
  images: 100,
};

/**
 * Image cache configuration
 */
export const IMAGE_CACHE_CONFIG = {
  maxSize: 100 * 1024 * 1024, // 100 MB
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
