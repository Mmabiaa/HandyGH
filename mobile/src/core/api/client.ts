import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { SecureTokenStorage } from '../storage';

// API Configuration
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

const defaultConfig: ApiConfig = {
  baseURL: __DEV__ ? 'http://localhost:8000' : 'https://api.handygh.com',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Retry configuration
interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

// Create Axios instance
const createApiClient = (config: ApiConfig = defaultConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: config.headers,
  });

  // Request interceptor for authentication token injection
  instance.interceptors.request.use(
    async (config) => {
      try {
        const tokens = await SecureTokenStorage.getTokens();

        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }

        // Add request timestamp for debugging
        config.metadata = { startTime: Date.now() };

        return config;
      } catch (error) {
        console.error('Error in request interceptor:', error);
        return config;
      }
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling and token refresh
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response time in development
      if (__DEV__ && response.config.metadata?.startTime) {
        const duration = Date.now() - response.config.metadata.startTime;
        console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
      }

      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & {
        _retry?: boolean;
        _retryCount?: number;
        _skipTokenRefresh?: boolean;
      };

      // Handle 401 Unauthorized - Token refresh
      // Requirement 13.1, 16.7: Token refresh and session expiration handling
      if (error.response?.status === 401 && !originalRequest._retry && !originalRequest._skipTokenRefresh) {
        originalRequest._retry = true;

        try {
          const tokens = await SecureTokenStorage.getTokens();

          if (tokens?.refreshToken) {
            // Attempt to refresh the token
            const refreshResponse = await axios.post(
              `${defaultConfig.baseURL}/api/v1/auth/token/refresh/`,
              { refresh: tokens.refreshToken },
              {
                // Skip token refresh for the refresh request itself
                _skipTokenRefresh: true,
              } as any
            );

            const { access: newAccessToken, refresh: newRefreshToken } = refreshResponse.data;

            // Save new tokens
            await SecureTokenStorage.saveTokens(
              newAccessToken,
              newRefreshToken || tokens.refreshToken
            );

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            return instance(originalRequest);
          } else {
            // No refresh token available - user needs to login
            await handleSessionExpired();
            return Promise.reject(new Error('Session expired. Please login again.'));
          }
        } catch (refreshError: any) {
          // Token refresh failed - clear tokens and handle session expiration
          console.error('Token refresh failed:', refreshError);

          await handleSessionExpired();

          // Return a more specific error
          const sessionError = new Error('Session expired. Please login again.');
          (sessionError as any).code = 'SESSION_EXPIRED';
          return Promise.reject(sessionError);
        }
      }

      // Handle retry logic with exponential backoff
      if (shouldRetry(error, originalRequest)) {
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

        const delay = calculateRetryDelay(originalRequest._retryCount);
        await sleep(delay);

        return instance(originalRequest);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Helper function to determine if request should be retried
const shouldRetry = (
  error: AxiosError,
  config: AxiosRequestConfig & { _retryCount?: number }
): boolean => {
  const retryCount = config._retryCount || 0;

  // Don't retry if max attempts reached
  if (retryCount >= defaultRetryConfig.maxAttempts) {
    return false;
  }

  // Don't retry if no response (network error) and it's not a GET request
  if (!error.response && config.method?.toUpperCase() !== 'GET') {
    return false;
  }

  // Retry on specific status codes
  if (error.response?.status && defaultRetryConfig.retryableStatusCodes.includes(error.response.status)) {
    return true;
  }

  // Retry on network errors for GET requests
  if (!error.response && config.method?.toUpperCase() === 'GET') {
    return true;
  }

  return false;
};

// Calculate retry delay with exponential backoff
const calculateRetryDelay = (retryCount: number): number => {
  return defaultRetryConfig.delayMs * Math.pow(defaultRetryConfig.backoffMultiplier, retryCount - 1);
};

// Sleep utility for retry delays
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Session expiration handler
// Requirement 16.7: Session expiration handling
let sessionExpiredCallback: (() => void) | null = null;

/**
 * Register callback to be called when session expires
 * This allows the app to handle navigation to login screen
 */
export const onSessionExpired = (callback: () => void) => {
  sessionExpiredCallback = callback;
};

/**
 * Handle session expiration
 * Clears tokens and triggers callback
 */
const handleSessionExpired = async () => {
  try {
    // Clear tokens
    await SecureTokenStorage.clearTokens();

    // Trigger callback if registered
    if (sessionExpiredCallback) {
      sessionExpiredCallback();
    }
  } catch (error) {
    console.error('Error handling session expiration:', error);
  }
};

// Create and export the API client instance
export const apiClient = createApiClient();

// Export type-safe API client interface
export interface ApiClient {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

// Wrapper functions for type-safe API calls
export const api: ApiClient = {
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },

  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },

  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },

  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },

  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },
};

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
    _skipTokenRefresh?: boolean;
  }
}
