import apiClient from './client';
import { APIResponse, OTPRequestData, OTPVerifyData, AuthResponse } from '@/types/api';

/**
 * Authentication API endpoints
 */
export const authAPI = {
  /**
   * Request OTP for phone number
   */
  requestOTP: async (phone: string): Promise<APIResponse<{ message: string }>> => {
    console.log('authAPI.requestOTP called with phone:', phone);
    try {
      const response = await apiClient.post<APIResponse<{ message: string }>>('/auth/otp/request/', {
        phone,
      });
      console.log('authAPI.requestOTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('authAPI.requestOTP error:', error);
      throw error;
    }
  },

  /**
   * Verify OTP and get authentication tokens
   */
  verifyOTP: async (data: OTPVerifyData): Promise<APIResponse<AuthResponse>> => {
    const response = await apiClient.post<APIResponse<AuthResponse>>('/auth/otp/verify/', data);

    // Store tokens
    if (response.data.success && response.data.data) {
      await apiClient.setTokens(
        response.data.data.access_token,
        response.data.data.refresh_token
      );
    }

    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<APIResponse<AuthResponse>> => {
    const response = await apiClient.post<APIResponse<AuthResponse>>('/auth/token/refresh/', {
      refresh_token: refreshToken,
    });

    // Update tokens
    if (response.data.success && response.data.data) {
      await apiClient.setTokens(
        response.data.data.access_token,
        response.data.data.refresh_token
      );
    }

    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (refreshToken: string): Promise<APIResponse<{ message: string }>> => {
    const response = await apiClient.post<APIResponse<{ message: string }>>('/auth/logout/', {
      refresh_token: refreshToken,
    });

    // Clear tokens
    await apiClient.clearTokens();

    return response.data;
  },

  /**
   * Logout from all devices
   */
  logoutAll: async (): Promise<APIResponse<{ message: string }>> => {
    const response = await apiClient.post<APIResponse<{ message: string }>>('/auth/logout/all/');

    // Clear tokens
    await apiClient.clearTokens();

    return response.data;
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<APIResponse<any>> => {
    const response = await apiClient.get<APIResponse<any>>('/users/me/');
    return response.data;
  },
};

export default authAPI;
