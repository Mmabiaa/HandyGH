/**
 * Custom hooks for booking requests
 * Requirements: 8.5, 8.6, 8.7, 8.8, 8.9, 8.10
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookingService } from '../../api/services/BookingService';
import { queryKeys } from '../queryKeys';

/**
 * Hook to fetch pending booking requests
 * Requirement 8.6: Retrieve pending booking requests
 */
export function usePendingRequests() {
  return useQuery({
    queryKey: queryKeys.bookings.pendingRequests(),
    queryFn: () => BookingService.getPendingRequests(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

/**
 * Hook to accept a booking request
 * Requirement 8.9: Update booking status to confirmed
 */
export function useAcceptBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => BookingService.acceptBooking(bookingId),
    onSuccess: (updatedBooking) => {
      // Update the booking detail cache
      queryClient.setQueryData(
        queryKeys.bookings.detail(updatedBooking.id),
        updatedBooking
      );

      // Invalidate pending requests list
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.pendingRequests(),
      });

      // Invalidate dashboard metrics
      queryClient.invalidateQueries({
        queryKey: queryKeys.provider.dashboardMetrics(),
      });

      // Invalidate booking lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.lists(),
      });
    },
  });
}

/**
 * Hook to decline a booking request
 * Requirement 8.10: Decline booking with reason
 */
export function useDeclineBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      BookingService.declineBooking(bookingId, reason),
    onSuccess: (updatedBooking) => {
      // Update the booking detail cache
      queryClient.setQueryData(
        queryKeys.bookings.detail(updatedBooking.id),
        updatedBooking
      );

      // Invalidate pending requests list
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.pendingRequests(),
      });

      // Invalidate dashboard metrics
      queryClient.invalidateQueries({
        queryKey: queryKeys.provider.dashboardMetrics(),
      });
    },
  });
}
