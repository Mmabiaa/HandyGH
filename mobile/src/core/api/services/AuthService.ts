import { api } from '../client';
import {
  OTPRequest,
  OTPResponse,
  OTPVerifyRequest,
  AuthResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
} from '../types';
import { SecureTokenStorage } from '../../storage/SecureTokenStorage';

/**
 * Authentication Service
 * Handles OTP-based authentication, token management, and logout
 */
export class AuthService {
  private static readonly BASE_PATH = '/api/v1/auth';

  /**
   * Request OTP code for phone number
   * Requirement 1.5: Send OTP request to backend
   */
  static async requestOTP(phoneNumber: string): Promise<OTPResponse> {
    const payload: OTPRequest = { phoneNumber };

    return api.post<OTPResponse>(
      `${this.BASE_PATH}/otp/request/`,
      payload
    );
  }

  /**
   * Verify OTP code and authenticate user
   * Requirement 1.7: Verify OTP and receive authentication token
   */
  static async verifyOTP(phoneNumber: string, code: string): Promise<AuthResponse> {
    const payload: OTPVerifyRequest = { phoneNumber, code };

    const response = await api.post<AuthResponse>(
      `${this.BASE_PATH}/otp/verify/`,
      payload
    );

    // Store tokens securely after successful verification
    await SecureTokenStorage.saveTokens(response.access, response.refresh);

    return response;
  }

  /**
   * Refresh access token using refresh token
   * Requirement 13.2: Implement token refresh for session management
   */
  static async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    const payload: TokenRefreshRequest = { refresh: refreshToken };

    const response = await api.post<TokenRefreshResponse>(
      `${this.BASE_PATH}/token/refresh/`,
      payload
    );

    // Update stored tokens
    if (response.access) {
      const tokens = await SecureTokenStorage.getTokens();
      await SecureTokenStorage.saveTokens(
        response.access,
        response.refresh || tokens?.refreshToken || refreshToken
      );
    }

    return response;
  }

  /**
   * Logout user and clear stored tokens
   */
  static async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      await api.post(`${this.BASE_PATH}/logout/`);
    } catch (error) {
      // Continue with local logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local tokens
      await SecureTokenStorage.clearTokens();
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    return SecureTokenStorage.hasTokens();
  }
}
