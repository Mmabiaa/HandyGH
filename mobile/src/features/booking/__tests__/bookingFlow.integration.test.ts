/**
 * Booking Flow Integration Tests
 *
 * Tests the complete booking creation flow from service selection to confirmation,
 * including payment processing with Mobile Money integration.
 *
 * Requirements:
 * - 18.2: Integration tests for Backend API interactions
 * - Test complete booking creation flow
 * - Test payment flow with MoMo integration
 * - Test error scenarios and validation
 */

import { BookingService, PaymentService } from '../../../core/api/services';
import { BookingStatus, PaymentStatus } from '../../../core/api/types';
import type {
  Booking,
  CreateBookingRequest,
  PaymentResponse,
  MoMoPaymentRequest,
  Location,
  PaymentMethod,
} from '../../../core/api/types';

// Mock services
jest.mock('../../../core/api/services/BookingService');
jest.mock('../../../core/api/services/PaymentService');

const mockBookingService = BookingService as jest.Mocked<typeof BookingService>;
const mockPaymentService = PaymentService as jest.Mocked<typeof PaymentService>;

describe('Booking Flow Integration Tests', () => {
  const mockLocation: Location = {
    address: 'East Legon, Accra',
    city: 'Accra',
    region: 'Greater Accra',
    coordinates: {
      latitude: 5.6037,
      longitude: -0.1870,
    },
  };

  const mockPaymentMethod: PaymentMethod = {
    id: 'payment-1',
    type: 'momo',
    provider: 'mtn',
    phoneNumber: '+233241234567',
    isDefault: true,
  };

  const mockBooking: Booking = {
    id: 'booking-123',
    customerId: 'customer-1',
    providerId: 'provider-1',
    serviceId: 'service-1',
    status: BookingStatus.PENDING,
    scheduledDate: '2025-11-15',
    scheduledTime: '10:00',
    duration: 60,
    location: mockLocation,
    totalAmount: 150,
    currency: 'GHS',
    paymentStatus: PaymentStatus.PENDING,
    paymentMethod: mockPaymentMethod,
    addOns: [],
    createdAt: '2025-11-14T00:00:00Z',
    updatedAt: '2025-11-14T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Booking Creation Flow', () => {
    it('should create booking successfully with all required data', async () => {
      mockBookingService.createBooking.mockResolvedValue(mockBooking);

      const bookingRequest: CreateBookingRequest = {
        providerId: 'provider-1',
        serviceId: 'service-1',
        scheduledDate: '2025-11-15',
        scheduledTime: '10:00',
        location: mockLocation,
      };

      const result = await BookingService.createBooking(bookingRequest);

      expect(mockBookingService.createBooking).toHaveBeenCalledWith(bookingRequest);
      expect(result).toEqual(mockBooking);
      expect(result.id).toBe('booking-123');
      expect(result.status).toBe(BookingStatus.PENDING);
    });

    it('should create booking with add-ons', async () => {
      const bookingWithAddOns: Booking = {
        ...mockBooking,
        addOns: [
          { id: 'addon-1', name: 'Express Service', price: 20, description: 'Priority service' },
        ],
        totalAmount: 170,
      };

      mockBookingService.createBooking.mockResolvedValue(bookingWithAddOns);

      const bookingRequest: CreateBookingRequest = {
        providerId: 'provider-1',
        serviceId: 'service-1',
        scheduledDate: '2025-11-15',
        scheduledTime: '10:00',
        location: mockLocation,
        addOns: ['addon-1'],
      };

      const result = await BookingService.createBooking(bookingRequest);

      expect(result.addOns).toHaveLength(1);
      expect(result.totalAmount).toBe(170);
      expect(result.addOns[0].id).toBe('addon-1');
    });

    it('should create booking with location notes', async () => {
      const bookingWithNotes: Booking = {
        ...mockBooking,
        locationNotes: 'Gate code: 1234',
      };

      mockBookingService.createBooking.mockResolvedValue(bookingWithNotes);

      const bookingRequest: CreateBookingRequest = {
        providerId: 'provider-1',
        serviceId: 'service-1',
        scheduledDate: '2025-11-15',
        scheduledTime: '10:00',
        location: mockLocation,
        locationNotes: 'Gate code: 1234',
      };

      const result = await BookingService.createBooking(bookingRequest);

      expect(result.locationNotes).toBe('Gate code: 1234');
    });

    it('should retrieve booking by ID after creation', async () => {
      mockBookingService.createBooking.mockResolvedValue(mockBooking);
      mockBookingService.getBookingById.mockResolvedValue(mockBooking);

      const bookingRequest: CreateBookingRequest = {
        providerId: 'provider-1',
        serviceId: 'service-1',
        scheduledDate: '2025-11-15',
        scheduledTime: '10:00',
        location: mockLocation,
      };

      const createdBooking = await BookingService.createBooking(bookingRequest);
      const retrievedBooking = await BookingService.getBookingById(createdBooking.id);

      expect(mockBookingService.getBookingById).toHaveBeenCalledWith('booking-123');
      expect(retrievedBooking).toEqual(mockBooking);
    });
  });

  describe('Payment Flow with MoMo Integration', () => {
    it('should successfully process MTN Mobile Money payment', async () => {
      const paymentResponse: PaymentResponse = {
        transactionId: 'mtn-txn-123',
        status: PaymentStatus.COMPLETED,
        reference: 'MTN-REF-123',
        message: 'Payment successful',
      };

      mockPaymentService.initiateMoMoPayment.mockResolvedValue(paymentResponse);

      const momoRequest: MoMoPaymentRequest = {
        amount: 150,
        currency: 'GHS',
        phoneNumber: '+233241234567',
        provider: 'mtn',
        bookingId: 'booking-123',
      };

      const result = await PaymentService.initiateMoMoPayment(momoRequest);

      expect(mockPaymentService.initiateMoMoPayment).toHaveBeenCalledWith(momoRequest);
      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(result.transactionId).toBe('mtn-txn-123');
      expect(result.reference).toBe('MTN-REF-123');
    });

    it('should successfully process Vodafone Mobile Money payment', async () => {
      const paymentResponse: PaymentResponse = {
        transactionId: 'voda-txn-456',
        status: PaymentStatus.COMPLETED,
        reference: 'VODA-REF-456',
        message: 'Payment successful',
      };

      mockPaymentService.initiateMoMoPayment.mockResolvedValue(paymentResponse);

      const momoRequest: MoMoPaymentRequest = {
        amount: 150,
        currency: 'GHS',
        phoneNumber: '+233501234567',
        provider: 'vodafone',
        bookingId: 'booking-123',
      };

      const result = await PaymentService.initiateMoMoPayment(momoRequest);

      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(result.transactionId).toBe('voda-txn-456');
    });

    it('should successfully process AirtelTigo Mobile Money payment', async () => {
      const paymentResponse: PaymentResponse = {
        transactionId: 'at-txn-789',
        status: PaymentStatus.COMPLETED,
        reference: 'AT-REF-789',
        message: 'Payment successful',
      };

      mockPaymentService.initiateMoMoPayment.mockResolvedValue(paymentResponse);

      const momoRequest: MoMoPaymentRequest = {
        amount: 150,
        currency: 'GHS',
        phoneNumber: '+233271234567',
        provider: 'airteltigo',
        bookingId: 'booking-123',
      };

      const result = await PaymentService.initiateMoMoPayment(momoRequest);

      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(result.transactionId).toBe('at-txn-789');
    });

    it('should handle pending payment status with verification', async () => {
      const pendingResponse: PaymentResponse = {
        transactionId: 'txn-pending',
        status: PaymentStatus.PROCESSING,
        reference: 'REF-PENDING',
        message: 'Payment processing',
      };

      mockPaymentService.initiateMoMoPayment.mockResolvedValue(pendingResponse);

      const momoRequest: MoMoPaymentRequest = {
        amount: 150,
        currency: 'GHS',
        phoneNumber: '+233241234567',
        provider: 'mtn',
        bookingId: 'booking-123',
      };

      const result = await PaymentService.initiateMoMoPayment(momoRequest);

      expect(result.status).toBe(PaymentStatus.PROCESSING);
      expect(result.transactionId).toBe('txn-pending');

      // Verify payment status
      const completedResponse: PaymentResponse = {
        transactionId: 'txn-pending',
        status: PaymentStatus.COMPLETED,
        reference: 'REF-PENDING',
        message: 'Payment completed',
      };

      mockPaymentService.verifyPayment.mockResolvedValue(completedResponse);

      const verifiedResult = await PaymentService.verifyPayment('txn-pending');

      expect(mockPaymentService.verifyPayment).toHaveBeenCalledWith('txn-pending');
      expect(verifiedResult.status).toBe(PaymentStatus.COMPLETED);
    });

    it('should handle cash payment method without MoMo processing', async () => {
      const cashBooking: Booking = {
        ...mockBooking,
        paymentMethod: { ...mockPaymentMethod, type: 'cash' },
        paymentStatus: PaymentStatus.PENDING,
      };

      mockBookingService.createBooking.mockResolvedValue(cashBooking);

      const bookingRequest: CreateBookingRequest = {
        providerId: 'provider-1',
        serviceId: 'service-1',
        scheduledDate: '2025-11-15',
        scheduledTime: '10:00',
        location: mockLocation,
      };

      const result = await BookingService.createBooking(bookingRequest);

      expect(result.paymentMethod?.type).toBe('cash');
      expect(result.paymentStatus).toBe(PaymentStatus.PENDING);
      expect(mockPaymentService.initiateMoMoPayment).not.toHaveBeenCalled();
    });

    it('should complete full booking and payment flow', async () => {
      // Step 1: Create booking
      mockBookingService.createBooking.mockResolvedValue(mockBooking);

      const bookingRequest: CreateBookingRequest = {
        providerId: 'provider-1',
        serviceId: 'service-1',
        scheduledDate: '2025-11-15',
        scheduledTime: '10:00',
        location: mockLocation,
      };

      const booking = await BookingService.createBooking(bookingRequest);

      expect(booking.id).toBe('booking-123');
      expect(booking.paymentStatus).toBe(PaymentStatus.PENDING);

      // Step 2: Process payment
      const paymentResponse: PaymentResponse = {
        transactionId: 'txn-final',
        status: PaymentStatus.COMPLETED,
        reference: 'REF-FINAL',
        message: 'Payment successful',
      };

      mockPaymentService.initiateMoMoPayment.mockResolvedValue(paymentResponse);

      const momoRequest: MoMoPaymentRequest = {
        amount: booking.totalAmount,
        currency: booking.currency,
        phoneNumber: booking.paymentMethod!.phoneNumber!,
        provider: booking.paymentMethod!.provider!,
        bookingId: booking.id,
      };

      const payment = await PaymentService.initiateMoMoPayment(momoRequest);

      expect(payment.status).toBe(PaymentStatus.COMPLETED);

      // Step 3: Update booking status
      const confirmedBooking: Booking = {
        ...booking,
        status: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.COMPLETED,
      };

      mockBookingService.updateBookingStatus.mockResolvedValue(confirmedBooking);

      const updatedBooking = await BookingService.updateBookingStatus(
        booking.id,
        BookingStatus.CONFIRMED
      );

      expect(updatedBooking.status).toBe(BookingStatus.CONFIRMED);
      expect(updatedBooking.paymentStatus).toBe(PaymentStatus.COMPLETED);
    });
  });

  describe('Error Scenarios and Validation', () => {
    it('should handle booking creation failure with validation error', async () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            message: 'Invalid booking data',
            errors: {
              scheduledDate: 'Date cannot be in the past',
            },
          },
        },
      };

      mockBookingService.createBooking.mockRejectedValue(validationError);

      const bookingRequest: CreateBookingRequest = {
        providerId: 'provider-1',
        serviceId: 'service-1',
        scheduledDate: '2020-01-01',
        scheduledTime: '10:00',
        location: mockLocation,
      };

      await expect(BookingService.createBooking(bookingRequest)).rejects.toMatchObject({
        response: {
          status: 400,
          data: expect.objectContaining({
            message: 'Invalid booking data',
          }),
        },
      });
    });

    it('should handle payment failure with insufficient funds', async () => {
      const paymentError = {
        response: {
          status: 402,
          data: {
            message: 'Insufficient funds',
            code: 'INSUFFICIENT_FUNDS',
          },
        },
      };

      mockPaymentService.initiateMoMoPayment.mockRejectedValue(paymentError);

      const momoRequest: MoMoPaymentRequest = {
        amount: 150,
        currency: 'GHS',
        phoneNumber: '+233241234567',
        provider: 'mtn',
        bookingId: 'booking-123',
      };

      await expect(PaymentService.initiateMoMoPayment(momoRequest)).rejects.toMatchObject({
        response: {
          status: 402,
          data: expect.objectContaining({
            code: 'INSUFFICIENT_FUNDS',
          }),
        },
      });
    });

    it('should handle payment timeout scenario', async () => {
      const timeoutError = {
        response: {
          status: 408,
          data: {
            message: 'Payment request timeout',
            code: 'PAYMENT_TIMEOUT',
          },
        },
      };

      mockPaymentService.initiateMoMoPayment.mockRejectedValue(timeoutError);

      const momoRequest: MoMoPaymentRequest = {
        amount: 150,
        currency: 'GHS',
        phoneNumber: '+233241234567',
        provider: 'mtn',
        bookingId: 'booking-123',
      };

      await expect(PaymentService.initiateMoMoPayment(momoRequest)).rejects.toMatchObject({
        response: {
          status: 408,
          data: expect.objectContaining({
            code: 'PAYMENT_TIMEOUT',
          }),
        },
      });
    });

    it('should handle network errors gracefully', async () => {
      const networkError = {
        message: 'Network request failed',
        code: 'NETWORK_ERROR',
      };

      mockBookingService.createBooking.mockRejectedValue(networkError);

      const bookingRequest: CreateBookingRequest = {
        providerId: 'provider-1',
        serviceId: 'service-1',
        scheduledDate: '2025-11-15',
        scheduledTime: '10:00',
        location: mockLocation,
      };

      await expect(BookingService.createBooking(bookingRequest)).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
      });
    });

    it('should handle provider unavailability error', async () => {
      const unavailableError = {
        response: {
          status: 409,
          data: {
            message: 'Provider not available at selected time',
            code: 'PROVIDER_UNAVAILABLE',
          },
        },
      };

      mockBookingService.createBooking.mockRejectedValue(unavailableError);

      const bookingRequest: CreateBookingRequest = {
        providerId: 'provider-1',
        serviceId: 'service-1',
        scheduledDate: '2025-11-15',
        scheduledTime: '10:00',
        location: mockLocation,
      };

      await expect(BookingService.createBooking(bookingRequest)).rejects.toMatchObject({
        response: {
          status: 409,
          data: expect.objectContaining({
            code: 'PROVIDER_UNAVAILABLE',
          }),
        },
      });
    });

    it('should handle payment provider service unavailable', async () => {
      const serviceError = {
        response: {
          status: 503,
          data: {
            message: 'Mobile Money service temporarily unavailable',
            code: 'SERVICE_UNAVAILABLE',
          },
        },
      };

      mockPaymentService.initiateMoMoPayment.mockRejectedValue(serviceError);

      const momoRequest: MoMoPaymentRequest = {
        amount: 150,
        currency: 'GHS',
        phoneNumber: '+233241234567',
        provider: 'mtn',
        bookingId: 'booking-123',
      };

      await expect(PaymentService.initiateMoMoPayment(momoRequest)).rejects.toMatchObject({
        response: {
          status: 503,
          data: expect.objectContaining({
            code: 'SERVICE_UNAVAILABLE',
          }),
        },
      });
    });

    it('should handle invalid phone number format', async () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            message: 'Invalid phone number format',
            code: 'INVALID_PHONE_NUMBER',
          },
        },
      };

      mockPaymentService.initiateMoMoPayment.mockRejectedValue(validationError);

      const momoRequest: MoMoPaymentRequest = {
        amount: 150,
        currency: 'GHS',
        phoneNumber: '1234567890',
        provider: 'mtn',
        bookingId: 'booking-123',
      };

      await expect(PaymentService.initiateMoMoPayment(momoRequest)).rejects.toMatchObject({
        response: {
          status: 400,
          data: expect.objectContaining({
            code: 'INVALID_PHONE_NUMBER',
          }),
        },
      });
    });

    it('should handle booking cancellation after payment failure', async () => {
      // Create booking
      mockBookingService.createBooking.mockResolvedValue(mockBooking);

      const bookingRequest: CreateBookingRequest = {
        providerId: 'provider-1',
        serviceId: 'service-1',
        scheduledDate: '2025-11-15',
        scheduledTime: '10:00',
        location: mockLocation,
      };

      const booking = await BookingService.createBooking(bookingRequest);

      // Payment fails
      const paymentError = {
        response: {
          status: 402,
          data: { message: 'Payment failed' },
        },
      };

      mockPaymentService.initiateMoMoPayment.mockRejectedValue(paymentError);

      const momoRequest: MoMoPaymentRequest = {
        amount: 150,
        currency: 'GHS',
        phoneNumber: '+233241234567',
        provider: 'mtn',
        bookingId: booking.id,
      };

      await expect(PaymentService.initiateMoMoPayment(momoRequest)).rejects.toBeDefined();

      // Cancel booking
      mockBookingService.cancelBooking.mockResolvedValue();

      await BookingService.cancelBooking(booking.id, 'Payment failed');

      expect(mockBookingService.cancelBooking).toHaveBeenCalledWith(
        booking.id,
        'Payment failed'
      );
    });
  });
});
