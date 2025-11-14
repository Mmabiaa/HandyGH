import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBookings, useCreateBooking, useUpdateBookingStatus } from '../useBookings';
import { BookingService } from '../../../api/services';
import { BookingStatus, PaymentStatus } from '../../../api/types';
import type { Booking, CreateBookingRequest } from '../../../api/types';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { afterEach } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock BookingService
jest.mock('../../../api/services/BookingService', () => ({
  BookingService: {
    getBookings: jest.fn(),
    getBookingById: jest.fn(),
    createBooking: jest.fn(),
    updateBookingStatus: jest.fn(),
    cancelBooking: jest.fn(),
    checkAvailability: jest.fn(),
  },
}));

describe('useBookings hooks', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  const mockBooking: Booking = {
    id: 'booking-1',
    customerId: 'customer-1',
    providerId: 'provider-1',
    serviceId: 'service-1',
    status: BookingStatus.CONFIRMED,
    scheduledDate: '2024-11-15',
    scheduledTime: '10:00',
    duration: 60,
    location: {
      address: 'East Legon, Accra',
      city: 'Accra',
      region: 'Greater Accra',
      coordinates: { latitude: 5.6037, longitude: -0.1870 },
    },
    totalAmount: 150,
    currency: 'GHS',
    paymentStatus: PaymentStatus.COMPLETED,
    addOns: [],
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('useBookings', () => {
    it('should fetch all bookings', async () => {
      (BookingService.getBookings as jest.Mock).mockResolvedValueOnce([mockBooking]);

      const { result } = renderHook(() => useBookings(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([mockBooking]);
      expect(BookingService.getBookings).toHaveBeenCalledWith(undefined);
    });

    it('should fetch bookings with status filter', async () => {
      (BookingService.getBookings as jest.Mock).mockResolvedValueOnce([mockBooking]);

      const { result } = renderHook(
        () => useBookings(BookingStatus.CONFIRMED),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(BookingService.getBookings).toHaveBeenCalledWith(BookingStatus.CONFIRMED);
    });
  });

  describe('useCreateBooking', () => {
    const createBookingData: CreateBookingRequest = {
      providerId: 'provider-1',
      serviceId: 'service-1',
      scheduledDate: '2024-11-15',
      scheduledTime: '10:00',
      location: {
        address: 'East Legon, Accra',
        city: 'Accra',
        region: 'Greater Accra',
        coordinates: { latitude: 5.6037, longitude: -0.1870 },
      },
    };

    it('should create a booking successfully', async () => {
      (BookingService.createBooking as jest.Mock).mockResolvedValueOnce(mockBooking);

      const { result } = renderHook(() => useCreateBooking(), { wrapper });

      await waitFor(() => {
        result.current.mutate(createBookingData);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockBooking);
      expect(BookingService.createBooking).toHaveBeenCalledWith(createBookingData);
    });

    it('should update cache optimistically', async () => {
      (BookingService.createBooking as jest.Mock).mockResolvedValueOnce(mockBooking);

      // Pre-populate cache with existing bookings
      queryClient.setQueryData(['bookings', 'list', {}], []);

      const { result } = renderHook(() => useCreateBooking(), { wrapper });

      await waitFor(() => {
        result.current.mutate(createBookingData);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Check that cache was updated
      const cachedBookings = queryClient.getQueryData<Booking[]>(['bookings', 'list', {}]);
      expect(cachedBookings).toContainEqual(mockBooking);
    });
  });

  describe('useUpdateBookingStatus', () => {
    it('should update booking status successfully', async () => {
      const updatedBooking = { ...mockBooking, status: BookingStatus.IN_PROGRESS };
      (BookingService.updateBookingStatus as jest.Mock).mockResolvedValueOnce(updatedBooking);

      const { result } = renderHook(() => useUpdateBookingStatus(), { wrapper });

      await waitFor(() => {
        result.current.mutate({
          bookingId: 'booking-1',
          status: BookingStatus.IN_PROGRESS,
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(BookingService.updateBookingStatus).toHaveBeenCalledWith(
        'booking-1',
        BookingStatus.IN_PROGRESS
      );
    });

    it('should handle optimistic updates', async () => {
      const updatedBooking = { ...mockBooking, status: BookingStatus.IN_PROGRESS };
      (BookingService.updateBookingStatus as jest.Mock).mockResolvedValueOnce(updatedBooking);

      // Pre-populate cache
      queryClient.setQueryData(['bookings', 'detail', 'booking-1'], mockBooking);

      const { result } = renderHook(() => useUpdateBookingStatus(), { wrapper });

      await waitFor(() => {
        result.current.mutate({
          bookingId: 'booking-1',
          status: BookingStatus.IN_PROGRESS,
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Check that cache was updated
      const cachedBooking = queryClient.getQueryData<Booking>(['bookings', 'detail', 'booking-1']);
      expect(cachedBooking?.status).toBe(BookingStatus.IN_PROGRESS);
    });

    it('should rollback on error', async () => {
      const error = new Error('Update failed');
      (BookingService.updateBookingStatus as jest.Mock).mockRejectedValueOnce(error);

      // Pre-populate cache
      queryClient.setQueryData(['bookings', 'detail', 'booking-1'], mockBooking);

      const { result } = renderHook(() => useUpdateBookingStatus(), { wrapper });

      await waitFor(() => {
        result.current.mutate({
          bookingId: 'booking-1',
          status: BookingStatus.IN_PROGRESS,
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      // Check that cache was rolled back
      const cachedBooking = queryClient.getQueryData<Booking>(['bookings', 'detail', 'booking-1']);
      expect(cachedBooking?.status).toBe(BookingStatus.CONFIRMED);
    });
  });
});
