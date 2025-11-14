import { useState, useCallback } from 'react';
import { AuthService } from '../../../core/api/services/AuthService';
import type { OTPResponse, AuthResponse } from '../../../core/api/types';
import { useAuth } from './useAuth';
import { AuthError, NetworkError, ValidationError } from '../utils/authErrors';

/**
 * useOTP Hook
 * Handles OTP request and verification flow
 * Requirement 1.5, 1.7: OTP request/verification
 */
export const useOTP = () => {
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState<number | null>(null);

  const { login } = useAuth();

  /**
   * Request OTP code for phone number
   * Requirement 1.5: Send OTP request to backend
   */
  const requestOTP = useCallback(async (phoneNumber: string): Promise<OTPResponse> => {
    try {
      setIsRequestingOTP(true);
      setOtpError(null);

      // Validate phone number format
      if (!phoneNumber || phoneNumber.trim().length === 0) {
        throw new ValidationError('Phone number is required', {
          phoneNumber: 'Phone number is required',
        });
      }

      const response = await AuthService.requestOTP(phoneNumber);
      setLastRequestTime(Date.now());

      return response;
    } catch (error: any) {
      console.error('OTP request error:', error);

      // Re-throw ValidationError as-is
      if (error instanceof ValidationError) {
        setOtpError(error.message);
        throw error;
      }

      // Handle different error types
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || 'Invalid phone number';
        setOtpError(errorMessage);
        throw new ValidationError(errorMessage, {
          phoneNumber: errorMessage,
        });
      } else if (error.response?.status === 429) {
        const errorMessage = 'Too many requests. Please try again later.';
        setOtpError(errorMessage);
        throw new AuthError('RATE_LIMIT', errorMessage, errorMessage);
      } else if (!error.response) {
        const errorMessage = 'Network error. Please check your connection.';
        setOtpError(errorMessage);
        throw new NetworkError(errorMessage);
      } else {
        const errorMessage = 'Failed to send OTP. Please try again.';
        setOtpError(errorMessage);
        throw new AuthError('OTP_REQUEST_FAILED', errorMessage, errorMessage);
      }
    } finally {
      setIsRequestingOTP(false);
    }
  }, []);

  /**
   * Verify OTP code and authenticate user
   * Requirement 1.7: Verify OTP and receive authentication token
   */
  const verifyOTP = useCallback(
    async (phoneNumber: string, code: string): Promise<AuthResponse> => {
      try {
        setIsVerifyingOTP(true);
        setOtpError(null);

        // Validate inputs
        if (!phoneNumber || phoneNumber.trim().length === 0) {
          throw new ValidationError('Phone number is required', {
            phoneNumber: 'Phone number is required',
          });
        }

        if (!code || code.trim().length === 0) {
          throw new ValidationError('OTP code is required', {
            code: 'OTP code is required',
          });
        }

        if (code.length !== 6) {
          throw new ValidationError('OTP code must be 6 digits', {
            code: 'OTP code must be 6 digits',
          });
        }

        const response = await AuthService.verifyOTP(phoneNumber, code);

        // Login user with received tokens
        // Add required User fields that may not be in the API response
        const userWithTimestamps = {
          ...response.user,
          createdAt: response.user.createdAt || new Date().toISOString(),
          updatedAt: response.user.updatedAt || new Date().toISOString(),
        };
        await login(userWithTimestamps, response.access, response.refresh);

        return response;
      } catch (error: any) {
        console.error('OTP verification error:', error);

        // Re-throw ValidationError as-is
        if (error instanceof ValidationError) {
          setOtpError(error.message);
          throw error;
        }

        // Handle different error types
        if (error.response?.status === 400) {
          const errorMessage = error.response.data?.message || 'Invalid OTP code';
          setOtpError(errorMessage);
          throw new ValidationError(errorMessage, {
            code: errorMessage,
          });
        } else if (error.response?.status === 401) {
          const errorMessage = 'Invalid or expired OTP code';
          setOtpError(errorMessage);
          throw new AuthError('INVALID_OTP', errorMessage, errorMessage);
        } else if (!error.response) {
          const errorMessage = 'Network error. Please check your connection.';
          setOtpError(errorMessage);
          throw new NetworkError(errorMessage);
        } else {
          const errorMessage = 'Failed to verify OTP. Please try again.';
          setOtpError(errorMessage);
          throw new AuthError('OTP_VERIFY_FAILED', errorMessage, errorMessage);
        }
      } finally {
        setIsVerifyingOTP(false);
      }
    },
    [login]
  );

  /**
   * Resend OTP code
   * Includes rate limiting check
   */
  const resendOTP = useCallback(
    async (phoneNumber: string): Promise<OTPResponse> => {
      // Check if enough time has passed since last request (60 seconds)
      if (lastRequestTime) {
        const timeSinceLastRequest = Date.now() - lastRequestTime;
        const minWaitTime = 60000; // 60 seconds

        if (timeSinceLastRequest < minWaitTime) {
          const remainingTime = Math.ceil((minWaitTime - timeSinceLastRequest) / 1000);
          const errorMessage = `Please wait ${remainingTime} seconds before requesting a new code`;
          setOtpError(errorMessage);
          throw new AuthError('RATE_LIMIT', errorMessage, errorMessage);
        }
      }

      return requestOTP(phoneNumber);
    },
    [lastRequestTime, requestOTP]
  );

  /**
   * Clear OTP error
   */
  const clearError = useCallback(() => {
    setOtpError(null);
  }, []);

  /**
   * Get remaining time until next OTP request is allowed
   */
  const getRemainingTime = useCallback((): number => {
    if (!lastRequestTime) return 0;

    const timeSinceLastRequest = Date.now() - lastRequestTime;
    const minWaitTime = 60000; // 60 seconds
    const remainingTime = Math.max(0, minWaitTime - timeSinceLastRequest);

    return Math.ceil(remainingTime / 1000);
  }, [lastRequestTime]);

  return {
    // State
    isRequestingOTP,
    isVerifyingOTP,
    otpError,
    lastRequestTime,

    // Actions
    requestOTP,
    verifyOTP,
    resendOTP,
    clearError,
    getRemainingTime,
  };
};
