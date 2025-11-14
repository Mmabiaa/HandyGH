import { SecureTokenStorage } from '../storage/SecureTokenStorage';
import axios from 'axios';

/**
 * Token Manager
 * Handles token refresh and validation
 * Requirement 13.1: Token management and refresh logic
 */

interface TokenRefreshResponse {
  access: string;
  refresh?: string;
}

interface TokenValidationResult {
  isValid: boolean;
  needsRefresh: boolean;
  expiresIn?: number;
}

/**
 * Token Manager Class
 * Centralized token management with refresh logic
 */
export class TokenManager {
  private static refreshPromise: Promise<string> | null = null;
  private static readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

  /**
   * Get valid access token
   * Automatically refreshes if needed
   */
  static async getValidAccessToken(): Promise<string | null> {
    try {
      const tokens = await SecureTokenStorage.getTokens();

      if (!tokens?.accessToken) {
        return null;
      }

      // Check if token needs refresh
      const validation = this.validateToken(tokens.accessToken);

      if (!validation.isValid) {
        // Token is invalid, try to refresh
        if (tokens.refreshToken) {
          return await this.refreshAccessToken(tokens.refreshToken);
        }
        return null;
      }

      if (validation.needsRefresh) {
        // Token is about to expire, refresh in background
        if (tokens.refreshToken) {
          // Don't await, refresh in background
          this.refreshAccessToken(tokens.refreshToken).catch(error => {
            console.error('Background token refresh failed:', error);
          });
        }
      }

      return tokens.accessToken;
    } catch (error) {
      console.error('Error getting valid access token:', error);
      return null;
    }
  }

  /**
   * Refresh access token
   * Uses promise caching to prevent multiple simultaneous refresh requests
   */
  static async refreshAccessToken(refreshToken: string): Promise<string> {
    // If refresh is already in progress, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Create new refresh promise
    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      const newAccessToken = await this.refreshPromise;
      return newAccessToken;
    } finally {
      // Clear the promise after completion
      this.refreshPromise = null;
    }
  }

  /**
   * Perform actual token refresh
   */
  private static async performTokenRefresh(refreshToken: string): Promise<string> {
    try {
      const baseURL = __DEV__ ? 'http://localhost:8000' : 'https://api.handygh.com';

      const response = await axios.post<TokenRefreshResponse>(
        `${baseURL}/api/v1/auth/token/refresh/`,
        { refresh: refreshToken },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { access: newAccessToken, refresh: newRefreshToken } = response.data;

      // Save new tokens
      await SecureTokenStorage.saveTokens(
        newAccessToken,
        newRefreshToken || refreshToken
      );

      return newAccessToken;
    } catch (error: any) {
      console.error('Token refresh failed:', error);

      // If refresh fails with 401, clear tokens
      if (error.response?.status === 401) {
        await SecureTokenStorage.clearTokens();
      }

      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Validate JWT token
   * Checks expiration and validity
   */
  static validateToken(token: string): TokenValidationResult {
    try {
      // Decode JWT token (without verification)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { isValid: false, needsRefresh: false };
      }

      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp;

      if (!exp) {
        return { isValid: true, needsRefresh: false };
      }

      const now = Math.floor(Date.now() / 1000);
      const expiresIn = exp - now;

      // Token is expired
      if (expiresIn <= 0) {
        return { isValid: false, needsRefresh: true, expiresIn: 0 };
      }

      // Token is about to expire (within threshold)
      if (expiresIn * 1000 <= this.TOKEN_REFRESH_THRESHOLD) {
        return { isValid: true, needsRefresh: true, expiresIn };
      }

      // Token is valid
      return { isValid: true, needsRefresh: false, expiresIn };
    } catch (error) {
      console.error('Error validating token:', error);
      return { isValid: false, needsRefresh: false };
    }
  }

  /**
   * Check if user has valid tokens
   */
  static async hasValidTokens(): Promise<boolean> {
    try {
      const tokens = await SecureTokenStorage.getTokens();

      if (!tokens?.accessToken) {
        return false;
      }

      const validation = this.validateToken(tokens.accessToken);

      // If access token is invalid but we have refresh token, try to refresh
      if (!validation.isValid && tokens.refreshToken) {
        try {
          await this.refreshAccessToken(tokens.refreshToken);
          return true;
        } catch (error) {
          return false;
        }
      }

      return validation.isValid;
    } catch (error) {
      console.error('Error checking valid tokens:', error);
      return false;
    }
  }

  /**
   * Clear all tokens
   */
  static async clearTokens(): Promise<void> {
    await SecureTokenStorage.clearTokens();
    this.refreshPromise = null;
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp;

      if (!exp) {
        return null;
      }

      return new Date(exp * 1000);
    } catch (error) {
      console.error('Error getting token expiration:', error);
      return null;
    }
  }

  /**
   * Get time until token expiration in milliseconds
   */
  static getTimeUntilExpiration(token: string): number | null {
    const expiration = this.getTokenExpiration(token);

    if (!expiration) {
      return null;
    }

    return expiration.getTime() - Date.now();
  }
}
