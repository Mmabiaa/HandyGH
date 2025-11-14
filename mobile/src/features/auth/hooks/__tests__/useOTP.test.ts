/**
 * useOTP Hook Tests
 * Tests OTP request and verification functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useOTP } from '../useOTP';
import { AuthService } from '../../../../core/api/services/AuthService';
import type { OTPResponse, AuthResponse } from '../../../../core/api/types';

jest.mock('../../../../core/api/services/AuthService');
jest.mock('../useAuth', () => ({
  useAuth: () => ({
    login: jest.fn(),
  }),
}));

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('useOTP Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestOTP', () => {
    it('should successfully request OTP', async () => {
      const mockResponse: OTPResponse = {
        message: 'OTP sent successfully',
        phoneNumber: '+233241234567',
      };

      mockAuthService.requestOTP.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useOTP());

      let response: OTPResponse | undefined;

      await act(async () => {
        response = await result.current.requestOTP('+233241234567');
      });

      await waitFor(() => {
        expect(response).toEqual(mockResponse);
        expect(mockAuthService.requestOTP).toHaveBeenCalledWith('+233241234567');
        expect(result.current.isRequestingOTP).toBe(false);
        expect(result.current.otpError).toBeNull();
      });
    });

    it('should handle empty phone number', async () => {
      const { result } = renderHook(() => useOTP());

      await act(async () => {
        try {
          await result.current.requestOTP('');
        } catch (error: any) {
          expect(error.message).toContain('Phone number is required');
        }
      });

      expect(mockAuthService.requestOTP).not.toHaveBeenCalled();
    });

    it('should handle invalid phone number error', async () => {
      mockAuthService.requestOTP.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Invalid phone number format' },
        },
      });

      const { result } = renderHook(() => useOTP());

      await act(async () => {
        try {
          await result.current.requestOTP('+233241234567');
        } catch (error) {
          // Expected error
        }
      });

      await waitFor(() => {
        expect(result.current.otpError).toBe('Invalid phone number format');
        expect(result.current.isRequestingOTP).toBe(false);
      });
    });

    it('should handle rate limit error', async () => {
      mockAuthService.requestOTP.mockRejectedValue({
        response: {
          status: 429,
          data: { message: 'Too many requests' },
        },
      });

      const { result } = renderHook(() => useOTP());

      await act(async () => {
        try {
          await result.current.requestOTP('+233241234567');
        } catch (error: any) {
          expect(error.code).toBe('RATE_LIMIT');
        }
      });

      await waitFor(() => {
        expect(result.current.otpError).toBe('Too many requests. Please try again later.');
      });
    });

    it('should handle network error', async () => {
      mockAuthService.requestOTP.mockRejectedValue({
        message: 'Network Error',
      });

      const { result } = renderHook(() => useOTP());

      await act(async () => {
        try {
          await result.current.requestOTP('+233241234567');
        } catch (error: any) {
          expect(error.name).toBe('NetworkError');
        }
      });

      await waitFor(() => {
        expect(result.current.otpError).toBe('Network error. Please check your connection.');
      });
    });
  });

  describe('verifyOTP', () => {
    it('should successfully verify OTP', async () => {
      const mockResponse: AuthResponse = {
        access: 'access-token',
        refresh: 'refresh-token',
        user: {
          id: 'user-123',
          phoneNumber: '+233241234567',
          firstName: 'John',
          lastName: 'Doe',
          role: 'customer',
          isVerified: true,
        },
      };

      mockAuthService.verifyOTP.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useOTP());

      let response: AuthResponse | undefined;

      await act(async () => {
        response = await result.current.verifyOTP('+233241234567', '123456');
      });

      await waitFor(() => {
        expect(response).toEqual(mockResponse);
        expect(mockAuthService.verifyOTP).toHaveBeenCalledWith('+233241234567', '123456');
        expect(result.current.isVerifyingOTP).toBe(false);
        expect(result.current.otpError).toBeNull();
      });
    });

    it('should validate OTP code length', async () => {
      const { result } = renderHook(() => useOTP());

      await act(async () => {
        try {
          await result.current.verifyOTP('+233241234567', '123');
        } catch (error: any) {
          expect(error.message).toContain('OTP code must be 6 digits');
        }
      });

      expect(mockAuthService.verifyOTP).not.toHaveBeenCalled();
    });

    it('should handle invalid OTP code error', async () => {
      mockAuthService.verifyOTP.mockRejectedValue({
        response: {
          status: 401,
          data: { message: 'Invalid OTP' },
        },
      });

      const { result } = renderHook(() => useOTP());

      await act(async () => {
        try {
          await result.current.verifyOTP('+233241234567', '123456');
        } catch (error: any) {
          expect(error.code).toBe('INVALID_OTP');
        }
      });

      await waitFor(() => {
        expect(result.current.otpError).toBe('Invalid or expired OTP code');
      });
    });

    it('should handle empty phone number', async () => {
      const { result } = renderHook(() => useOTP());

      await act(async () => {
        try {
          await result.current.verifyOTP('', '123456');
        } catch (error: any) {
          expect(error.message).toContain('Phone number is required');
        }
      });

      expect(mockAuthService.verifyOTP).not.toHaveBeenCalled();
    });

    it('should handle empty OTP code', async () => {
      const { result } = renderHook(() => useOTP());

      await act(async () => {
        try {
          await result.current.verifyOTP('+233241234567', '');
        } catch (error: any) {
          expect(error.message).toContain('OTP code is required');
        }
      });

      expect(mockAuthService.verifyOTP).not.toHaveBeenCalled();
    });
  });

  describe('resendOTP', () => {
    it('should allow resend after cooldown period', async () => {
      const mockResponse: OTPResponse = {
        message: 'OTP sent successfully',
        phoneNumber: '+233241234567',
      };

      mockAuthService.requestOTP.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useOTP());

      // First request
      await act(async () => {
        await result.current.requestOTP('+233241234567');
      });

      // Mock time passage
      jest.useFakeTimers();
      act(() => {
        jest.advanceTimersByTime(61000); // 61 seconds
      });

      // Resend should succeed
      await act(async () => {
        await result.current.resendOTP('+233241234567');
      });

      await waitFor(() => {
        expect(mockAuthService.requestOTP).toHaveBeenCalledTimes(2);
      });

      jest.useRealTimers();
    });

    it('should prevent resend before cooldown period', async () => {
      const mockResponse: OTPResponse = {
        message: 'OTP sent successfully',
        phoneNumber: '+233241234567',
      };

      mockAuthService.requestOTP.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useOTP());

      // First request
      await act(async () => {
        await result.current.requestOTP('+233241234567');
      });

      // Immediate resend should fail
      await act(async () => {
        try {
          await result.current.resendOTP('+233241234567');
        } catch (error: any) {
          expect(error.message).toContain('Please wait');
          expect(error.code).toBe('RATE_LIMIT');
        }
      });

      expect(mockAuthService.requestOTP).toHaveBeenCalledTimes(1);
    });

    it('should calculate remaining time correctly', async () => {
      const mockResponse: OTPResponse = {
        message: 'OTP sent successfully',
        phoneNumber: '+233241234567',
      };

      mockAuthService.requestOTP.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useOTP());

      await act(async () => {
        await result.current.requestOTP('+233241234567');
      });

      const remainingTime = result.current.getRemainingTime();
      expect(remainingTime).toBeGreaterThan(0);
      expect(remainingTime).toBeLessThanOrEqual(60);
    });
  });

  describe('clearError', () => {
    it('should clear OTP error', async () => {
      mockAuthService.requestOTP.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Invalid phone number' },
        },
      });

      const { result } = renderHook(() => useOTP());

      await act(async () => {
        try {
          await result.current.requestOTP('+233241234567');
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.otpError).toBe('Invalid phone number');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.otpError).toBeNull();
    });
  });
});
