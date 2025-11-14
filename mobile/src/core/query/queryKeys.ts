import type { ProviderQueryParams, BookingStatus, AvailabilityQueryParams } from '../api/types';

/**
 * Query key factory for consistent cache keys across the application
 * Follows React Query best practices for hierarchical key structure
 */
export const queryKeys = {
  // Provider queries
  providers: {
    all: ['providers'] as const,
    lists: () => [...queryKeys.providers.all, 'list'] as const,
    list: (params: ProviderQueryParams) => [...queryKeys.providers.lists(), params] as const,
    details: () => [...queryKeys.providers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.providers.details(), id] as const,
    services: (id: string) => [...queryKeys.providers.detail(id), 'services'] as const,
    reviews: (id: string) => [...queryKeys.providers.detail(id), 'reviews'] as const,
    reviewsPaginated: (id: string, page: number) => [...queryKeys.providers.reviews(id), page] as const,
  },

  // Service category queries
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.categories.all, 'detail', id] as const,
  },

  // Booking queries
  bookings: {
    all: ['bookings'] as const,
    lists: () => [...queryKeys.bookings.all, 'list'] as const,
    list: (status?: BookingStatus) => [...queryKeys.bookings.lists(), { status }] as const,
    details: () => [...queryKeys.bookings.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.bookings.details(), id] as const,
    availability: (params: AvailabilityQueryParams) => [...queryKeys.bookings.all, 'availability', params] as const,
  },

  // Message queries
  messages: {
    all: ['messages'] as const,
    lists: () => [...queryKeys.messages.all, 'list'] as const,
    list: (bookingId: string) => [...queryKeys.messages.lists(), bookingId] as const,
  },

  // Payment queries
  payments: {
    all: ['payments'] as const,
    methods: () => [...queryKeys.payments.all, 'methods'] as const,
    status: (transactionId: string) => [...queryKeys.payments.all, 'status', transactionId] as const,
  },

  // User queries
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    favorites: () => [...queryKeys.user.all, 'favorites'] as const,
  },

  // Provider dashboard queries (for provider users)
  providerDashboard: {
    all: ['provider-dashboard'] as const,
    metrics: () => [...queryKeys.providerDashboard.all, 'metrics'] as const,
    earnings: (period?: 'week' | 'month' | 'year') => [...queryKeys.providerDashboard.all, 'earnings', { period }] as const,
    performance: () => [...queryKeys.providerDashboard.all, 'performance'] as const,
  },

  // Provider queries (for provider-specific data)
  provider: {
    all: ['provider'] as const,
    dashboard: () => [...queryKeys.provider.all, 'dashboard'] as const,
    dashboardMetrics: () => [...queryKeys.provider.all, 'dashboard', 'metrics'] as const,
    earningsTrend: (days: number) => [...queryKeys.provider.all, 'earnings-trend', days] as const,
    upcomingBookings: (days: number) => [...queryKeys.provider.all, 'upcoming-bookings', days] as const,
  },

  // Review queries
  reviews: {
    all: ['reviews'] as const,
    lists: () => [...queryKeys.reviews.all, 'list'] as const,
    list: (providerId: string, params?: any) => [...queryKeys.reviews.lists(), providerId, params] as const,
    details: () => [...queryKeys.reviews.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.reviews.details(), id] as const,
    breakdown: (providerId: string) => [...queryKeys.reviews.all, 'breakdown', providerId] as const,
    myReviews: (page?: number, pageSize?: number) => [...queryKeys.reviews.all, 'my-reviews', { page, pageSize }] as const,
  },
} as const;

/**
 * Helper to invalidate related queries
 * Example: After creating a booking, invalidate booking lists
 */
export const getRelatedQueryKeys = {
  afterBookingCreate: () => [
    queryKeys.bookings.lists(),
    queryKeys.providerDashboard.metrics(),
  ],

  afterBookingUpdate: (bookingId: string) => [
    queryKeys.bookings.detail(bookingId),
    queryKeys.bookings.lists(),
  ],

  afterProviderFavorite: (providerId: string) => [
    queryKeys.user.favorites(),
    queryKeys.providers.detail(providerId),
  ],

  afterReviewSubmit: (providerId: string) => [
    queryKeys.providers.reviews(providerId),
    queryKeys.providers.detail(providerId),
  ],
};
