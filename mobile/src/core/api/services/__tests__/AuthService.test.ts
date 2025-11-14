import { AuthService } from '../AuthService';
import { api } from '../../client';
import { SecureTokenStorage } from '../../../storage/SecureTokenStorage';
import { AuthResponse, OTPResponse } from '../../types';

// Mock dependencies
jest.mock('../../client');
jest.mock('../../../storage/SecureTokenStorage');

describe('AuthService', () => {
  const mockApi = api as jest.Mocked<typeof api>;
  const mockStorage = SecureTokenStorage as jest.Mocked<typeof SecureTokenStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestOTP', () => {
    it('should request OTP for valid phone number', async () => {
      const phoneNumber = '+233241234567';
      const mockResponse: OTPResponse = {
        message: 'OTP sent successfully',
        phoneNumber,
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await AuthService.requestOTP(phoneNumber);

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/v1/auth/otp/request/',
        { phoneNumber }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle OTP request errors', async () => {
      const phoneNumber = '+233241234567';
      const error = new Error('Network error');

      mockApi.post.mockRejectedValue(error);

      await expect(AuthService.requestOTP(phoneNumber)).rejects.toThrow('Network error');
    });
  });

  describe('verifyOTP', () => {
    it('should verify OTP and store tokens', async () => {
      const phoneNumber = '+233241234567';
      const code = '123456';
      const mockResponse: AuthResponse = {
        access: 'access-token',
        refresh: 'refresh-token',
        user: {
          id: 'user-1',
          phoneNumber,
          firstName: 'John',
          lastName: 'Doe',
          role: 'customer',
          isVerified: true,
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);
      mockStorage.saveTokens.mockResolvedValue();

      const result = await AuthService.verifyOTP(phoneNumber, code);

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/v1/auth/otp/verify/',
        { phoneNumber, code }
      );
      expect(mockStorage.saveTokens).toHaveBeenCalledWith(
        'access-token',
        'refresh-token'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid OTP code', async () => {
      const phoneNumber = '+233241234567';
      const code = '000000';
      const error = new Error('Invalid OTP code');

      mockApi.post.mockRejectedValue(error);

      await expect(AuthService.verifyOTP(phoneNumber, code)).rejects.toThrow('Invalid OTP code');
      expect(mockStorage.saveTokens).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token', async () => {
      const refreshToken = 'refresh-token';
      const mockResponse = {
        access: 'new-access-token',
        refresh: 'new-refresh-token',
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await AuthService.refreshToken(refreshToken);

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/v1/auth/token/refresh/',
        { refresh: refreshToken }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle refresh token expiration', async () => {
      const refreshToken = 'expired-token';
      const error = new Error('Token expired');

      mockApi.post.mockRejectedValue(error);

      await expect(AuthService.refreshToken(refreshToken)).rejects.toThrow('Token expired');
    });
  });

  describe('logout', () => {
    it('should logout and clear tokens', async () => {
      mockApi.post.mockResolvedValue({});
      mockStorage.clearTokens.mockResolvedValue();

      await AuthService.logout();

      expect(mockApi.post).toHaveBeenCalledWith('/api/v1/auth/logout/');
      expect(mockStorage.clearTokens).toHaveBeenCalled();
    });

    it('should clear tokens even if API call fails', async () => {
      mockApi.post.mockRejectedValue(new Error('Network error'));
      mockStorage.clearTokens.mockResolvedValue();

      await AuthService.logout();

      expect(mockStorage.clearTokens).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when tokens exist', async () => {
      mockStorage.hasTokens.mockResolvedValue(true);

      const result = await AuthService.isAuthenticated();

      expect(result).toBe(true);
      expect(mockStorage.hasTokens).toHaveBeenCalled();
    });

    it('should return false when tokens do not exist', async () => {
      mockStorage.hasTokens.mockResolvedValue(false);

      const result = await AuthService.isAuthenticated();

      expect(result).toBe(false);
    });
  });
});
