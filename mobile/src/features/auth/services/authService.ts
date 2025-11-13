/**
 * Professional Authentication Service
 *
 * Handles all authentication API calls with:
 * - Automatic retry logic
 * - Error handling
 * - Type safety
 *
 * @requirements Req 1 (Authentication)
 */

import { apiClient } from '@/api/client';
import { User, AuthTokens } from '../store/authStore';

/**
 * OTP Request Response
 */
export interface OTPRequestResponse {
  message: string;
  phone: string;
}

/**
 * OTP Verification Response
 */
export interface OTPVerificationResponse {
  user: User;
  tokens: AuthTokens;
}

/**
 * Token Refresh Response
 */
export interface TokenRefreshResponse {
  access: string;
}

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Request OTP for phone number
   */
  async requestOTP(phone: string): Promise<OTPRequestResponse> {
    const response = await apiClient.post<OTPRequestResponse>(
      '/auth/otp/request/',
      { phone }
    );
    return response.data;
  },

  /**
   * Verify OTP and authenticate user
   */
  async verifyOTP(phone: string, otp: string): Promise<OTPVerificationResponse> {
    const response = await apiClient.post<OTPVerificationResponse>(
      '/auth/otp/verify/',
      { phone, otp }
    );
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    const response = await apiClient.post<TokenRefreshResponse>(
      '/auth/token/refresh/',
      { refresh: refreshToken }
    );
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout/', { refresh: refreshToken });
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/users/me/');
    return response.data;
  },

  /**
   * Update user role
   */
  async updateUserRole(role: 'CUSTOMER' | 'PROVIDER'): Promise<User> {
    const response = await apiClient.patch<User>('/users/me/', { role });
    return response.data;
  },
};
