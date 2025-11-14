import { PaymentService } from '../PaymentService';
import { api } from '../../client';
import { MoMoPaymentRequest, PaymentResponse, PaymentMethod } from '../../types';

// Mock dependencies
jest.mock('../../client');

describe('PaymentService', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initiateMoMoPayment', () => {
    it('should initiate MoMo payment successfully', async () => {
      const paymentRequest: MoMoPaymentRequest = {
        amount: 100,
        currency: 'GHS',
        phoneNumber: '+233241234567',
        provider: 'mtn',
        bookingId: 'booking-1',
      };

      const mockResponse: PaymentResponse = {
        transactionId: 'txn-123',
        status: 'pending',
        reference: 'REF-123',
        message: 'Payment initiated',
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await PaymentService.initiateMoMoPayment(paymentRequest);

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/v1/payments/momo/initiate/',
        paymentRequest
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle payment initiation errors', async () => {
      const paymentRequest: MoMoPaymentRequest = {
        amount: 100,
        currency: 'GHS',
        phoneNumber: '+233241234567',
        provider: 'mtn',
        bookingId: 'booking-1',
      };

      const error = new Error('Insufficient balance');
      mockApi.post.mockRejectedValue(error);

      await expect(
        PaymentService.initiateMoMoPayment(paymentRequest)
      ).rejects.toThrow('Insufficient balance');
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment status', async () => {
      const mockResponse = {
        transactionId: 'txn-123',
        status: 'completed',
        message: 'Payment successful',
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await PaymentService.verifyPayment('txn-123');

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/payments/verify/txn-123/');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPaymentMethods', () => {
    it('should fetch user payment methods', async () => {
      const mockMethods: PaymentMethod[] = [
        {
          id: 'method-1',
          type: 'momo',
          provider: 'mtn',
          phoneNumber: '+233241234567',
          isDefault: true,
        },
      ];

      mockApi.get.mockResolvedValue(mockMethods);

      const result = await PaymentService.getPaymentMethods();

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/payments/methods/');
      expect(result).toEqual(mockMethods);
    });
  });

  describe('addPaymentMethod', () => {
    it('should add new payment method', async () => {
      const newMethod = {
        type: 'momo' as const,
        provider: 'vodafone' as const,
        phoneNumber: '+233501234567',
        isDefault: false,
      };

      const mockResponse: PaymentMethod = {
        id: 'method-2',
        ...newMethod,
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await PaymentService.addPaymentMethod(newMethod);

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/v1/payments/methods/',
        newMethod
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deletePaymentMethod', () => {
    it('should delete payment method', async () => {
      mockApi.delete.mockResolvedValue({});

      await PaymentService.deletePaymentMethod('method-1');

      expect(mockApi.delete).toHaveBeenCalledWith(
        '/api/v1/payments/methods/method-1/'
      );
    });
  });

  describe('setDefaultPaymentMethod', () => {
    it('should set default payment method', async () => {
      mockApi.patch.mockResolvedValue({});

      await PaymentService.setDefaultPaymentMethod('method-1');

      expect(mockApi.patch).toHaveBeenCalledWith(
        '/api/v1/payments/methods/method-1/',
        { isDefault: true }
      );
    });
  });

  describe('pollPaymentStatus', () => {
    it('should poll until payment is completed', async () => {
      const mockResponses = [
        { transactionId: 'txn-123', status: 'pending', message: 'Processing' },
        { transactionId: 'txn-123', status: 'pending', message: 'Processing' },
        { transactionId: 'txn-123', status: 'completed', message: 'Success' },
      ];

      let callCount = 0;
      mockApi.get.mockImplementation(() => {
        return Promise.resolve(mockResponses[callCount++]);
      });

      const promise = PaymentService.pollPaymentStatus('txn-123', 10, 1000);

      // Fast-forward through polling intervals
      for (let i = 0; i < 3; i++) {
        await jest.advanceTimersByTimeAsync(1000);
      }

      const result = await promise;

      expect(result.status).toBe('completed');
      expect(mockApi.get).toHaveBeenCalledTimes(3);
    });

    it('should stop polling when payment fails', async () => {
      const mockResponses = [
        { transactionId: 'txn-123', status: 'pending', message: 'Processing' },
        { transactionId: 'txn-123', status: 'failed', message: 'Failed' },
      ];

      let callCount = 0;
      mockApi.get.mockImplementation(() => {
        return Promise.resolve(mockResponses[callCount++]);
      });

      const promise = PaymentService.pollPaymentStatus('txn-123', 10, 1000);

      // Fast-forward through polling intervals
      for (let i = 0; i < 2; i++) {
        await jest.advanceTimersByTimeAsync(1000);
      }

      const result = await promise;

      expect(result.status).toBe('failed');
      expect(mockApi.get).toHaveBeenCalledTimes(2);
    });

    it('should timeout after max attempts', async () => {
      mockApi.get.mockResolvedValue({
        transactionId: 'txn-123',
        status: 'pending',
        message: 'Processing',
      });

      const promise = PaymentService.pollPaymentStatus('txn-123', 3, 1000);

      // Fast-forward through all polling attempts
      for (let i = 0; i < 3; i++) {
        await jest.advanceTimersByTimeAsync(1000);
      }

      await expect(promise).rejects.toThrow('Payment verification timeout');
      expect(mockApi.get).toHaveBeenCalledTimes(3);
    });
  });
});
