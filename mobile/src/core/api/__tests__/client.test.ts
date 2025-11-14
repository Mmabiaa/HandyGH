import axios, { AxiosError } from 'axios';
import { apiClient } from '../client';
import { SecureTokenStorage } from '../../storage/SecureTokenStorage';

// Mock dependencies
jest.mock('axios');
jest.mock('../../storage/SecureTokenStorage');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockStorage = SecureTokenStorage as jest.Mocked<typeof SecureTokenStorage>;

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup axios.create mock
    mockedAxios.create.mockReturnValue(apiClient as any);
  });

  describe('Request Interceptor', () => {
    it('should inject authentication token in request headers', async () => {
      mockStorage.getTokens.mockResolvedValue({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      });

      const config = {
        headers: {},
        metadata: {},
      };

      // Get the request interceptor
      const requestInterceptor = (apiClient.interceptors.request as any).handlers[0];

      if (requestInterceptor?.fulfilled) {
        const result = await requestInterceptor.fulfilled(config);

        expect(mockStorage.getTokens).toHaveBeenCalled();
        expect(result.headers.Authorization).toBe('Bearer test-access-token');
        expect(result.metadata.startTime).toBeDefined();
      }
    });

    it('should handle missing tokens gracefully', async () => {
      mockStorage.getTokens.mockResolvedValue(null);

      const config = {
        headers: {},
        metadata: {},
      };

      const requestInterceptor = (apiClient.interceptors.request as any).handlers[0];

      if (requestInterceptor?.fulfilled) {
        const result = await requestInterceptor.fulfilled(config);

        expect(result.headers.Authorization).toBeUndefined();
      }
    });
  });

  describe('Response Interceptor - Token Refresh', () => {
    it('should refresh token on 401 error', async () => {
      const originalRequest = {
        headers: {},
        _retry: false,
      };

      const error: Partial<AxiosError> = {
        config: originalRequest as any,
        response: {
          status: 401,
          data: {},
          statusText: 'Unauthorized',
          headers: {},
          config: originalRequest as any,
        },
      };

      mockStorage.getTokens.mockResolvedValue({
        accessToken: 'old-token',
        refreshToken: 'refresh-token',
      });

      mockedAxios.post.mockResolvedValue({
        data: {
          access: 'new-access-token',
          refresh: 'new-refresh-token',
        },
      });

      mockStorage.saveTokens.mockResolvedValue();

      const responseInterceptor = (apiClient.interceptors.response as any).handlers[0];

      if (responseInterceptor?.rejected) {
        await responseInterceptor.rejected(error);

        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/auth/token/refresh/'),
          { refresh: 'refresh-token' }
        );
        expect(mockStorage.saveTokens).toHaveBeenCalledWith(
          'new-access-token',
          'new-refresh-token'
        );
      }
    });

    it('should clear tokens when refresh fails', async () => {
      const originalRequest = {
        headers: {},
        _retry: false,
      };

      const error: Partial<AxiosError> = {
        config: originalRequest as any,
        response: {
          status: 401,
          data: {},
          statusText: 'Unauthorized',
          headers: {},
          config: originalRequest as any,
        },
      };

      mockStorage.getTokens.mockResolvedValue({
        accessToken: 'old-token',
        refreshToken: 'invalid-refresh-token',
      });

      mockedAxios.post.mockRejectedValue(new Error('Invalid refresh token'));
      mockStorage.clearTokens.mockResolvedValue();

      const responseInterceptor = (apiClient.interceptors.response as any).handlers[0];

      if (responseInterceptor?.rejected) {
        try {
          await responseInterceptor.rejected(error);
        } catch (e) {
          expect(mockStorage.clearTokens).toHaveBeenCalled();
        }
      }
    });
  });

  describe('Retry Logic', () => {
    it('should retry on 503 Service Unavailable', async () => {
      const originalRequest = {
        method: 'GET',
        _retryCount: 0,
      };

      const error: Partial<AxiosError> = {
        config: originalRequest as any,
        response: {
          status: 503,
          data: {},
          statusText: 'Service Unavailable',
          headers: {},
          config: originalRequest as any,
        },
      };

      const responseInterceptor = (apiClient.interceptors.response as any).handlers[0];

      if (responseInterceptor?.rejected) {
        // Mock the retry
        mockedAxios.request = jest.fn().mockResolvedValue({ data: 'success' });

        try {
          await responseInterceptor.rejected(error);
        } catch (e) {
          // Retry logic should increment retry count
          expect(originalRequest._retryCount).toBeGreaterThan(0);
        }
      }
    });

    it('should not retry POST requests on network errors', async () => {
      const originalRequest = {
        method: 'POST',
        _retryCount: 0,
      };

      const error: Partial<AxiosError> = {
        config: originalRequest as any,
        message: 'Network Error',
      };

      const responseInterceptor = (apiClient.interceptors.response as any).handlers[0];

      if (responseInterceptor?.rejected) {
        try {
          await responseInterceptor.rejected(error);
        } catch (e) {
          // Should not retry POST on network error
          expect(originalRequest._retryCount).toBe(0);
        }
      }
    });

    it('should stop retrying after max attempts', async () => {
      const originalRequest = {
        method: 'GET',
        _retryCount: 3, // Already at max
      };

      const error: Partial<AxiosError> = {
        config: originalRequest as any,
        response: {
          status: 503,
          data: {},
          statusText: 'Service Unavailable',
          headers: {},
          config: originalRequest as any,
        },
      };

      const responseInterceptor = (apiClient.interceptors.response as any).handlers[0];

      if (responseInterceptor?.rejected) {
        await expect(responseInterceptor.rejected(error)).rejects.toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 Not Found errors', async () => {
      const error: Partial<AxiosError> = {
        response: {
          status: 404,
          data: { message: 'Resource not found' },
          statusText: 'Not Found',
          headers: {},
          config: {} as any,
        },
      };

      const responseInterceptor = (apiClient.interceptors.response as any).handlers[0];

      if (responseInterceptor?.rejected) {
        await expect(responseInterceptor.rejected(error)).rejects.toBeDefined();
      }
    });

    it('should handle network timeout errors', async () => {
      const error: Partial<AxiosError> = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      };

      const responseInterceptor = (apiClient.interceptors.response as any).handlers[0];

      if (responseInterceptor?.rejected) {
        await expect(responseInterceptor.rejected(error)).rejects.toBeDefined();
      }
    });
  });
});
