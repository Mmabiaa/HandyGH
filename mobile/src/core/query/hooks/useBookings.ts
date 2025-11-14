import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { BookingService } from '../../api/services';
import { queryKeys, getRelatedQueryKeys } from '../queryKeys';
import type {
  Booking,
  BookingStatus,
  CreateBookingRequest,
  UpdateBookingRequest,
  TimeSlot,
  AvailabilityQueryParams,
} from '../../api/types';

/**
 * Hook to fetch bookings list with optional status filter
 */
export const useBookings = (
  status?: BookingStatus,
  options?: Omit<UseQueryOptions<Booking[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.bookings.list(status),
    queryFn: () => BookingService.getBookings(status),
    ...options,
  });
};

/**
 * Hook to fetch a single booking by ID
 */
export const useBooking = (
  bookingId: string,
  options?: Omit<UseQueryOptions<Booking>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.bookings.detail(bookingId),
    queryFn: () => BookingService.getBookingById(bookingId),
    enabled: !!bookingId,
    ...options,
  });
};

/**
 * Hook to check provider availability
 */
export const useAvailability = (
  params: AvailabilityQueryParams,
  options?: Omit<UseQueryOptions<TimeSlot[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.bookings.availability(params),
    queryFn: () => BookingService.checkAvailability(params.providerId, params.date),
    enabled: !!params.providerId && !!params.date,
    ...options,
  });
};

/**
 * Hook to create a new booking
 */
export const useCreateBooking = (
  options?: Omit<UseMutationOptions<Booking, Error, CreateBookingRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingRequest) => BookingService.createBooking(data),
    onSuccess: (newBooking) => {
      // Optimistic update - add new booking to cache
      queryClient.setQueryData<Booking[]>(
        queryKeys.bookings.list(),
        (old = []) => [newBooking, ...old]
      );

      // Invalidate related queries
      getRelatedQueryKeys.afterBookingCreate().forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
    ...options,
  });
};

/**
 * Hook to update booking status
 */
export const useUpdateBookingStatus = (
  options?: Omit<UseMutationOptions<Booking, Error, { bookingId: string; status: BookingStatus }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: BookingStatus }) =>
      BookingService.updateBookingStatus(bookingId, status),
    onMutate: async ({ bookingId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.detail(bookingId) });

      // Snapshot previous value
      const previousBooking = queryClient.getQueryData<Booking>(queryKeys.bookings.detail(bookingId));

      // Optimistically update
      if (previousBooking) {
        queryClient.setQueryData<Booking>(
          queryKeys.bookings.detail(bookingId),
          { ...previousBooking, status }
        );
      }

      return { previousBooking };
    },
    onError: (err, { bookingId }, context) => {
      // Rollback on error
      if (context?.previousBooking) {
        queryClient.setQueryData(queryKeys.bookings.detail(bookingId), context.previousBooking);
      }
    },
    onSuccess: (_, { bookingId }) => {
      // Invalidate related queries
      getRelatedQueryKeys.afterBookingUpdate(bookingId).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
    ...options,
  });
};

/**
 * Hook to cancel a booking
 */
export const useCancelBooking = (
  options?: Omit<UseMutationOptions<void, Error, { bookingId: string; reason: string }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      BookingService.cancelBooking(bookingId, reason),
    onSuccess: (_, { bookingId }) => {
      // Invalidate related queries
      getRelatedQueryKeys.afterBookingUpdate(bookingId).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
    ...options,
  });
};

/**
 * Hook to fetch active bookings (confirmed, on_the_way, arrived, in_progress)
 */
export const useActiveBookings = (
  options?: Omit<UseQueryOptions<Booking[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.bookings.list(BookingStatus.CONFIRMED),
    queryFn: async () => {
      const bookings = await BookingService.getBookings();
      return bookings.filter(
        (booking) =>
          booking.status === BookingStatus.CONFIRMED ||
          booking.status === BookingStatus.ON_THE_WAY ||
          booking.status === BookingStatus.ARRIVED ||
          booking.status === BookingStatus.IN_PROGRESS
      );
    },
    ...options,
  });
};
