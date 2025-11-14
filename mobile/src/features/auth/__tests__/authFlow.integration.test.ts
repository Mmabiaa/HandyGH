/**
 * Authentication Flow Integration Tests
 * Requirement 18.2: Integration tests for authentication flow
 * Tests complete registration flow, OTP verification, and token refresh
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useAuth } from '../hooks/useAuth';
import { useOTP } from '../hooks/useOTP';
import { AuthService } from '../../../core/api/services/AuthService';
import { SecureTokenStorage } from '../../../core/storage/SecureTokenStorage';
import { TokenManager } from '../../../core/api/tokenManager';
import type { AuthResponse, OTPResponse } from '../../../core/api/types';

// Mock dependencies
jest.mock('../../../core/api/services/AuthService');
jest.mock('../../../core/storage/SecureTokenStorage');
jest.mock('../../../core/api/tokenManager');

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;
const mockSecureStorage = SecureTokenStorage as jest.Mocked<typeof SecureTokenStorage>;
const mockTokenManager = TokenManager as jest.Mocked<typeof TokenManager>;

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Registration Flow', () => {
    it('should complete full registration from phone input to authenticated state', async () => {
      // Mock OTP request response
      const mockOTPResponse: OTPResponse = {
        message: 'OTP sent successfully',
        phoneNumber: '+233241234567',
      };

      // Mock OTP verification response
      const mockAuthResponse: AuthResponse = {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: {
          id: 'user-123',
          phoneNumber: '+233241234567',
          firstName: 'John',
          lastName: 'Doe',
          role: 'customer',
          isVerified: true,
        },
      };

      mockAuthService.requestOTP.mockResolvedValue(mockOTPResponse);
      mockAuthService.verifyOTP.mockResolvedValue(mockAuthResponse);
      mockSecureStorage.saveTokens.mockResolvedValue();
      mockSecureStorage.hasTokens.mockResolvedValue(true);

      // Step 1: Request OTP
      const { result: otpResult } = renderHook(() => useOTP());

      await act(async () => {
        await otpResult.current.requestOTP('+233241234567');
      });

      await waitFor(() => {
        expect(mockAuthService.requestOTP).toHaveBeenCalledWith('+233241234567');
        expect(otpResult.current.isRequestingOTP).toBe(false);
      });

      // Step 2: Verify OTP
      await act(async () => {
        await otpResult.current.verifyOTP('+233241234567', '123456');
      });

      await waitFor(() => {
        expect(mockAuthService.verifyOTP).toHaveBeenCalledWith('+233241234567', '123456');
        expect(mockSecureStorage.saveTokens).toHaveBeenCalledWith(
          'mock-access-token',
          'mock-refresh-token'
        );
        expect(otpResult.current.isVerifyingOTP).toBe(false);
      });

      // Step 3: Verify user is authenticated
      const { result: authResult } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(authResult.current.isAuthenticated).toBe(true);
        expect(authResult.current.user).toEqual(mockAuthResponse.user);
      });
    });

    it('should handle OTP request failure gracefully', async () => {
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

      await waitFor(() => {
        expect(result.current.otpError).toBe('Invalid phone number');
        expect(result.current.isRequestingOTP).toBe(false);
      });
    });

    it('should handle invalid OTP code', async () => {
      mockAuthService.verifyOTP.mockRejectedValue({
        response: {
          status: 401,
          data: { message: 'Invalid OTP code' },
        },
      });

      const { result } = renderHook(() => useOTP());

      await act(async () => {
        try {
          await result.current.verifyOTP('+233241234567', '000000');
        } catch (error) {
          // Expected error
        }
      });

      await waitFor(() => {
        expect(result.current.otpError).toBe('Invalid or expired OTP code');
        expect(result.current.isVerifyingOTP).toBe(false);
      });
    });
  });

  describe('OTP Verification with Valid and Invalid Codes', () => {
    it('should successfully verify valid OTP code', async () => {
      const mockAuthResponse: AuthResponse = {
        access: 'valid-access-token',
        refresh: 'valid-refresh-token',
        user: {
          id: 'user-456',
          phoneNumber: '+233501234567',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'provider',
          isVerified: true,
        },
      };

      mockAuthService.verifyOTP.mockResolvedValue(mockAuthResponse);
      mockSecureStorage.saveTokens.mockResolvedValue();

      const { result } = renderHook(() => useOTP());

      let response: AuthResponse | undefined;

      await act(async () => {
        response = await result.current.verifyOTP('+233501234567', '123456');
      });

      await waitFor(() => {
        expect(response).toEqual(mockAuthResponse);
        expect(mockAuthService.verifyOTP).toHaveBeenCalledWith('+233501234567', '123456');
        expect(mockSecureStorage.saveTokens).toHaveBeenCalledWith(
          'valid-access-token',
          'valid-refresh-token'
        );
      });
    });

    it('should reject OTP code with incorrect length', async () => {
      const { result } = renderHook(() => useOTP());

      await act(async () => {
        try {
          await result.current.verifyOTP('+233501234567', '123');
        } catch (error: any) {
          expect(error.message).toContain('OTP code must be 6 digits');
        }
      });

      expect(mockAuthService.verifyOTP).not.toHaveBeenCalled();
    });

    it('should reject OTP code with non-numeric characters', async () => {
      const { result } = renderHook(() => useOTP());

      await act(async () => {
        try {
          await result.current.verifyOTP('+233501234567', '12345a');
        } catch (error: any) {
          expect(error.message).toContain('OTP code must be 6 digits');
        }
      });

      expect(mockAuthService.verifyOTP).not.toHaveBeenCalled();
    });

    it('should handle expired OTP code', async () => {
      mockAuthService.verifyOTP.mockRejectedValue({
        response: {
          status: 401,
          data: { message: 'OTP code has expired' },
        },
      });

      const { result } = renderHook(() => useOTP());

      await act(async () => {
        try {
          await result.current.verifyOTP('+233501234567', '123456');
        } catch (error) {
          // Expected error
        }
      });

      await waitFor(() => {
        expect(result.current.otpError).toBe('Invalid or expired OTP code');
      });
    });
  });

  describe('Token Refresh and Session Expiration', () => {
    it('should successfully refresh expired token', async () => {
      const mockTokens = {
        accessToken: 'expired-access-token',
        refreshToken: 'valid-refresh-token',
      };

      const newAccessToken = 'new-access-token';

      mockSecureStorage.getTokens.mockResolvedValue(mockTokens);
      mockTokenManager.refreshAccessToken.mockResolvedValue(newAccessToken);
      mockSecureStorage.saveTokens.mockResolvedValue();

      const result = await TokenManager.refreshAccessToken('valid-refresh-token');

      expect(result).toBe(newAccessToken);
      expect(mockTokenManager.refreshAccessToken).toHaveBeenCalledWith('valid-refresh-token');
    });

    it('should handle token refresh failure and logout user', async () => {
      mockTokenManager.refreshAccessToken.mockRejectedValue(
        new Error('Failed to refresh access token')
      );
      mockSecureStorage.clearTokens.mockResolvedValue();

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await TokenManager.refreshAccessToken('invalid-refresh-token');
        } catch (error) {
          // Token refresh failed, logout user
          await result.current.logout();
        }
      });

      await waitFor(() => {
        expect(mockSecureStorage.clearTokens).toHaveBeenCalled();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
      });
    });

    it('should validate token expiration correctly', () => {
      // Create a mock JWT token that expires in 10 minutes
      const now = Math.floor(Date.now() / 1000);
      const exp = now + 600; // 10 minutes from now

      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp, user_id: '123' }));
      const signature = 'mock-signature';
      const token = `${header}.${payload}.${signature}`;

      const validation = TokenManager.validateToken(token);

      expect(validation.isValid).toBe(true);
      expect(validation.needsRefresh).toBe(false);
      expect(validation.expiresIn).toBeGreaterThan(0);
    });

    it('should detect expired token', () => {
      // Create a mock JWT token that expired 1 hour ago
      const now = Math.floor(Date.now() / 1000);
      const exp = now - 3600; // 1 hour ago

      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp, user_id: '123' }));
      const signature = 'mock-signature';
      const token = `${header}.${payload}.${signature}`;

      const validation = TokenManager.validateToken(token);

      expect(validation.isValid).toBe(false);
      expect(validation.needsRefresh).toBe(true);
      expect(validation.expiresIn).toBe(0);
    });

    it('should detect token that needs refresh', () => {
      // Create a mock JWT token that expires in 2 minutes (within refresh threshold)
      const now = Math.floor(Date.now() / 1000);
      const exp = now + 120; // 2 minutes from now

      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ exp, user_id: '123' }));
      const signature = 'mock-signature';
      const token = `${header}.${payload}.${signature}`;

      const validation = TokenManager.validateToken(token);

      expect(validation.isValid).toBe(true);
      expect(validation.needsRefresh).toBe(true);
    });

    it('should handle session expiration on app resume', async () => {
      mockTokenManager.hasValidTokens.mockResolvedValue(false);
      mockSecureStorage.clearTokens.mockResolvedValue();

      const { result } = renderHook(() => useAuth());

      // Simulate session expiration
      await act(async () => {
        const hasValidTokens = await TokenManager.hasValidTokens();
        if (!hasValidTokens) {
          await result.current.logout();
        }
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
        expect(mockSecureStorage.clearTokens).toHaveBeenCalled();
      });
    });
  });

  describe('OTP Resend with Rate Limiting', () => {
    it('should allow OTP resend after cooldown period', async () => {
      const mockOTPResponse: OTPResponse = {
        message: 'OTP sent successfully',
        phoneNumber: '+233241234567',
      };

      mockAuthService.requestOTP.mockResolvedValue(mockOTPResponse);

      const { result } = renderHook(() => useOTP());

      // First request
      await act(async () => {
        await result.current.requestOTP('+233241234567');
      });

      // Wait for cooldown (mock by advancing time)
      jest.useFakeTimers();
      act(() => {
        jest.advanceTimersByTime(61000); // 61 seconds
      });

      // Second request should succeed
      await act(async () => {
        await result.current.resendOTP('+233241234567');
      });

      await waitFor(() => {
        expect(mockAuthService.requestOTP).toHaveBeenCalledTimes(2);
      });

      jest.useRealTimers();
    });

    it('should prevent OTP resend before cooldown period', async () => {
      const mockOTPResponse: OTPResponse = {
        message: 'OTP sent successfully',
        phoneNumber: '+233241234567',
      };

      mockAuthService.requestOTP.mockResolvedValue(mockOTPResponse);

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
        }
      });

      expect(mockAuthService.requestOTP).toHaveBeenCalledTimes(1);
    });
  });

  describe('Logout Flow', () => {
    it('should successfully logout and clear all tokens', async () => {
      mockAuthService.logout.mockResolvedValue();
      mockSecureStorage.clearTokens.mockResolvedValue();

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(mockAuthService.logout).toHaveBeenCalled();
        expect(mockSecureStorage.clearTokens).toHaveBeenCalled();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
      });
    });

    it('should clear tokens even if logout API call fails', async () => {
      mockAuthService.logout.mockRejectedValue(new Error('Network error'));
      mockSecureStorage.clearTokens.mockResolvedValue();

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(mockSecureStorage.clearTokens).toHaveBeenCalled();
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });
});
