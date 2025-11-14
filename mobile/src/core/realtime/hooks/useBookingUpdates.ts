import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocketEvent } from './useSocket';
import { SocketEvent } from '../SocketManager';
import { queryKeys } from '../../query/queryKeys';
import type { Booking, BookingStatus } from '../../api/types';

/**
 * Booking status update event data
 */
interface BookingStatusUpdate {
  bookingId: string;
  status: BookingStatus;
  updatedAt: string;
  message?: string;
}

/**
 * New booking request event data (for providers)
 */
interface BookingRequest {
  booking: Booking;
  message: string;
}

/**
 * Hook to subscribe to real-time booking status updates
 * Automatically updates React Query cache when booking status changes
 */
export function useBookingStatusUpdates(bookingId?: string) {
  const queryClient = useQueryClient();

  const handleStatusUpdate = useCallback(
    (data: BookingStatusUpdate) => {
      // If bookingId is provided, only handle updates for that booking
      if (bookingId && data.bookingId !== bookingId) {
        return;
      }

      console.log('[useBookingStatusUpdates] Received status update:', data);

      // Update the specific booking in cache
      queryClient.setQueryData<Booking>(
        queryKeys.bookings.detail(data.bookingId),
        (oldBooking) => {
          if (!oldBooking) return oldBooking;
          return {
            ...oldBooking,
            status: data.status,
            updatedAt: data.updatedAt,
          };
        }
      );

      // Update booking in all list queries
      queryClient.setQueriesData<Booking[]>(
        { queryKey: queryKeys.bookings.all },
        (oldBookings) => {
          if (!oldBookings) return oldBookings;
          return oldBookings.map((booking) =>
            booking.id === data.bookingId
              ? { ...booking, status: data.status, updatedAt: data.updatedAt }
              : booking
          );
        }
      );

      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(data.bookingId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.all,
      });
    },
    [queryClient, bookingId]
  );

  useSocketEvent(SocketEvent.BOOKING_STATUS_UPDATE, handleStatusUpdate, [
    queryClient,
    bookingId,
  ]);
}

/**
 * Hook to subscribe to booking confirmation events
 */
export function useBookingConfirmation(bookingId?: string) {
  const queryClient = useQueryClient();

  const handleConfirmation = useCallback(
    (data: BookingStatusUpdate) => {
      if (bookingId && data.bookingId !== bookingId) {
        return;
      }

      console.log('[useBookingConfirmation] Booking confirmed:', data);

      // Update booking status to confirmed
      queryClient.setQueryData<Booking>(
        queryKeys.bookings.detail(data.bookingId),
        (oldBooking) => {
          if (!oldBooking) return oldBooking;
          return {
            ...oldBooking,
            status: data.status,
            updatedAt: data.updatedAt,
          };
        }
      );

      // Invalidate to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(data.bookingId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.all,
      });
    },
    [queryClient, bookingId]
  );

  useSocketEvent(SocketEvent.BOOKING_CONFIRMED, handleConfirmation, [
    queryClient,
    bookingId,
  ]);
}

/**
 * Hook to subscribe to booking cancellation events
 */
export function useBookingCancellation(bookingId?: string) {
  const queryClient = useQueryClient();

  const handleCancellation = useCallback(
    (data: BookingStatusUpdate) => {
      if (bookingId && data.bookingId !== bookingId) {
        return;
      }

      console.log('[useBookingCancellation] Booking cancelled:', data);

      // Update booking status to cancelled
      queryClient.setQueryData<Booking>(
        queryKeys.bookings.detail(data.bookingId),
        (oldBooking) => {
          if (!oldBooking) return oldBooking;
          return {
            ...oldBooking,
            status: data.status,
            updatedAt: data.updatedAt,
          };
        }
      );

      // Invalidate to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(data.bookingId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.all,
      });
    },
    [queryClient, bookingId]
  );

  useSocketEvent(SocketEvent.BOOKING_CANCELLED, handleCancellation, [
    queryClient,
    bookingId,
  ]);
}

/**
 * Hook to subscribe to new booking requests (for providers)
 */
export function useBookingRequests() {
  const queryClient = useQueryClient();

  const handleNewRequest = useCallback(
    (data: BookingRequest) => {
      console.log('[useBookingRequests] New booking request:', data);

      // Add new booking to pending bookings list
      queryClient.setQueryData<Booking[]>(
        queryKeys.bookings.list('pending' as BookingStatus),
        (oldBookings = []) => [data.booking, ...oldBookings]
      );

      // Invalidate to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.all,
      });
    },
    [queryClient]
  );

  useSocketEvent(SocketEvent.BOOKING_REQUEST, handleNewRequest, [queryClient]);
}

/**
 * Comprehensive hook that subscribes to all booking-related events
 * Use this in screens that need to stay updated with all booking changes
 */
export function useAllBookingUpdates(bookingId?: string) {
  useBookingStatusUpdates(bookingId);
  useBookingConfirmation(bookingId);
  useBookingCancellation(bookingId);

  // Only subscribe to booking requests if no specific bookingId
  // (booking requests are for providers to see new requests)
  if (!bookingId) {
    useBookingRequests();
  }
}
