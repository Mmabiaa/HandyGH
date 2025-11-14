import { BookingService } from '../BookingService';
import { api } from '../../client';
import { Booking, CreateBookingRequest, BookingStatus, TimeSlot } from '../../types';

// Mock dependencies
jest.mock('../../client');

describe('BookingService', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  const mockBooking: Booking = {
    id: 'booking-1',
    customerId: 'customer-1',
    providerId: 'provider-1',
    serviceId: 'service-1',
    status: BookingStatus.CONFIRMED,
    scheduledDate: '2025-11-15',
    scheduledTime: '10:00',
    duration: 60,
    location: {
      address: 'East Legon, Accra',
      city: 'Accra',
      region: 'Greater Accra',
      coordinates: { latitude: 5.6037, longitude: -0.1870 },
    },
    totalAmount: 100,
    currency: 'GHS',
    paymentStatus: 'pending',
    addOns: [],
    createdAt: '2025-11-14T10:00:00Z',
    updatedAt: '2025-11-14T10:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should create a new booking', async () => {
      const bookingData: CreateBookingRequest = {
        providerId: 'provider-1',
        serviceId: 'service-1',
        scheduledDate: '2025-11-15',
        scheduledTime: '10:00',
        location: {
          address: 'East Legon, Accra',
          city: 'Accra',
          region: 'Greater Accra',
          coordinates: { latitude: 5.6037, longitude: -0.1870 },
        },
      };

      mockApi.post.mockResolvedValue(mockBooking);

      const result = await BookingService.createBooking(bookingData);

      expect(mockApi.post).toHaveBeenCalledWith('/api/v1/bookings/', bookingData);
      expect(result).toEqual(mockBooking);
    });

    it('should create booking with add-ons and notes', async () => {
      const bookingData: CreateBookingRequest = {
        providerId: 'provider-1',
        serviceId: 'service-1',
        scheduledDate: '2025-11-15',
        scheduledTime: '10:00',
        location: {
          address: 'East Legon, Accra',
          city: 'Accra',
          region: 'Greater Accra',
          coordinates: { latitude: 5.6037, longitude: -0.1870 },
        },
        addOns: ['addon-1'],
        notes: 'Please call before arriving',
      };

      mockApi.post.mockResolvedValue(mockBooking);

      await BookingService.createBooking(bookingData);

      expect(mockApi.post).toHaveBeenCalledWith('/api/v1/bookings/', bookingData);
    });

    it('should handle booking creation errors', async () => {
      const bookingData: CreateBookingRequest = {
        providerId: 'provider-1',
        serviceId: 'service-1',
        scheduledDate: '2025-11-15',
        scheduledTime: '10:00',
        location: {
          address: 'East Legon, Accra',
          city: 'Accra',
          region: 'Greater Accra',
          coordinates: { latitude: 5.6037, longitude: -0.1870 },
        },
      };

      const error = new Error('Provider not available');
      mockApi.post.mockRejectedValue(error);

      await expect(BookingService.createBooking(bookingData)).rejects.toThrow(
        'Provider not available'
      );
    });
  });

  describe('getBookings', () => {
    it('should fetch all bookings', async () => {
      const mockBookings = [mockBooking];
      mockApi.get.mockResolvedValue(mockBookings);

      const result = await BookingService.getBookings();

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/bookings/');
      expect(result).toEqual(mockBookings);
    });

    it('should fetch bookings by status', async () => {
      const mockBookings = [mockBooking];
      mockApi.get.mockResolvedValue(mockBookings);

      await BookingService.getBookings(BookingStatus.CONFIRMED);

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/bookings/?status=confirmed');
    });
  });

  describe('getBookingById', () => {
    it('should fetch booking by ID', async () => {
      mockApi.get.mockResolvedValue(mockBooking);

      const result = await BookingService.getBookingById('booking-1');

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/bookings/booking-1/');
      expect(result).toEqual(mockBooking);
    });
  });

  describe('updateBookingStatus', () => {
    it('should update booking status', async () => {
      const updatedBooking = { ...mockBooking, status: BookingStatus.IN_PROGRESS };
      mockApi.patch.mockResolvedValue(updatedBooking);

      const result = await BookingService.updateBookingStatus(
        'booking-1',
        BookingStatus.IN_PROGRESS
      );

      expect(mockApi.patch).toHaveBeenCalledWith('/api/v1/bookings/booking-1/', {
        status: BookingStatus.IN_PROGRESS,
      });
      expect(result.status).toBe(BookingStatus.IN_PROGRESS);
    });

    it('should update booking status with cancellation reason', async () => {
      const updatedBooking = {
        ...mockBooking,
        status: BookingStatus.CANCELLED,
        cancellationReason: 'Customer request',
      };
      mockApi.patch.mockResolvedValue(updatedBooking);

      await BookingService.updateBookingStatus(
        'booking-1',
        BookingStatus.CANCELLED,
        'Customer request'
      );

      expect(mockApi.patch).toHaveBeenCalledWith('/api/v1/bookings/booking-1/', {
        status: BookingStatus.CANCELLED,
        cancellationReason: 'Customer request',
      });
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking with reason', async () => {
      const cancelledBooking = {
        ...mockBooking,
        status: BookingStatus.CANCELLED,
        cancellationReason: 'Changed plans',
      };
      mockApi.patch.mockResolvedValue(cancelledBooking);

      const result = await BookingService.cancelBooking('booking-1', 'Changed plans');

      expect(mockApi.patch).toHaveBeenCalledWith('/api/v1/bookings/booking-1/', {
        status: BookingStatus.CANCELLED,
        cancellationReason: 'Changed plans',
      });
      expect(result.status).toBe(BookingStatus.CANCELLED);
    });
  });

  describe('checkAvailability', () => {
    it('should check provider availability', async () => {
      const mockTimeSlots: TimeSlot[] = [
        { startTime: '09:00', endTime: '10:00', isBooked: false },
        { startTime: '10:00', endTime: '11:00', isBooked: true },
        { startTime: '11:00', endTime: '12:00', isBooked: false },
      ];

      mockApi.get.mockResolvedValue(mockTimeSlots);

      const result = await BookingService.checkAvailability({
        providerId: 'provider-1',
        date: '2025-11-15',
      });

      expect(mockApi.get).toHaveBeenCalledWith(
        '/api/v1/bookings/availability/?provider_id=provider-1&date=2025-11-15'
      );
      expect(result).toEqual(mockTimeSlots);
    });

    it('should check availability with service ID', async () => {
      const mockTimeSlots: TimeSlot[] = [
        { startTime: '09:00', endTime: '10:00', isBooked: false },
      ];

      mockApi.get.mockResolvedValue(mockTimeSlots);

      await BookingService.checkAvailability({
        providerId: 'provider-1',
        date: '2025-11-15',
        serviceId: 'service-1',
      });

      expect(mockApi.get).toHaveBeenCalledWith(
        '/api/v1/bookings/availability/?provider_id=provider-1&date=2025-11-15&service_id=service-1'
      );
    });
  });

  describe('getActiveBookings', () => {
    it('should fetch active bookings', async () => {
      const mockBookings = [mockBooking];
      mockApi.get.mockResolvedValue(mockBookings);

      const result = await BookingService.getActiveBookings();

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/bookings/?active=true');
      expect(result).toEqual(mockBookings);
    });
  });

  describe('submitReview', () => {
    it('should submit review for completed booking', async () => {
      mockApi.post.mockResolvedValue({});

      await BookingService.submitReview('booking-1', 5, 'Excellent service!');

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/v1/bookings/booking-1/review/',
        {
          rating: 5,
          comment: 'Excellent service!',
        }
      );
    });
  });
});
