import { AxiosError } from 'axios';

/**
 * Error response structure from API
 */
interface APIErrorResponse {
  success: boolean;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
}

/**
 * Handle API errors and return user-friendly messages
 */
export const handleAPIError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const response = error.response?.data as APIErrorResponse;

    // Handle specific status codes
    if (error.response) {
      switch (error.response.status) {
        case 400:
          // Validation errors
          if (response.errors) {
            const firstError = Object.values(response.errors)[0];
            return firstError?.[0] || 'Invalid request';
          }
          return response.error || response.message || 'Invalid request';

        case 401:
          return 'Please login again';

        case 403:
          return 'You do not have permission to perform this action';

        case 404:
          return 'Resource not found';

        case 429:
          return 'Too many requests. Please try again later';

        case 500:
        case 502:
        case 503:
          return 'Server error. Please try again later';

        default:
          return response.error || response.message || 'Something went wrong';
      }
    } else if (error.request) {
      // No response received
      return 'No internet connection. Please check your network';
    } else {
      // Request setup error
      return 'Request failed. Please try again';
    }
  }

  // Generic error
  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return !error.response && !!error.request;
  }
  return false;
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
};

/**
 * Extract validation errors from API response
 */
export const extractValidationErrors = (error: unknown): Record<string, string> => {
  if (error instanceof AxiosError) {
    const response = error.response?.data as APIErrorResponse;
    if (response.errors) {
      const validationErrors: Record<string, string> = {};
      Object.entries(response.errors).forEach(([field, messages]) => {
        validationErrors[field] = messages[0];
      });
      return validationErrors;
    }
  }
  return {};
};
