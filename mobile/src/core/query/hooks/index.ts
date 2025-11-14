// Export all query hooks
export {
  useProviders,
  useProvider,
  useProviderServices,
  useProviderReviews,
  useFavoriteProvider,
  useUnfavoriteProvider,
  useSearchProviders,
} from './useProviders';

export {
  useBookings,
  useBooking,
  useAvailability,
  useCreateBooking,
  useUpdateBookingStatus,
  useCancelBooking,
  useActiveBookings,
} from './useBookings';

export {
  useCategories,
  useCategory,
} from './useCategories';

export type { ServiceCategory } from './useCategories';
