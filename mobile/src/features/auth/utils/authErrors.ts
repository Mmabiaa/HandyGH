/**
 * Authentication Error Classes
 * Requirement 16.2: Authentication error handling
 */

/**
 * Base Authentication Error
 */
export class AuthError extends Error {
  constructor(
    public code: string,
    public message: string,
    public userMessage: string,
    public recoverable: boolean = true,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Network Error
 * Thrown when network connectivity issues occur
 */
export class NetworkError extends AuthError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(
      'NETWORK_ERROR',
      message,
      'Unable to connect. Please check your internet connection.',
      true,
      metadata
    );
    this.name = 'NetworkError';
  }
}

/**
 * Validation Error
 * Thrown when input validation fails
 */
export class ValidationError extends AuthError {
  constructor(message: string, public fields: Record<string, string>) {
    super(
      'VALIDATION_ERROR',
      message,
      'Please check your input and try again.',
      true,
      { fields }
    );
    this.name = 'ValidationError';
  }
}

/**
 * Session Expired Error
 * Thrown when user session expires
 * Requirement 16.7: Session expiration handling
 */
export class SessionExpiredError extends AuthError {
  constructor(message: string = 'Your session has expired') {
    super(
      'SESSION_EXPIRED',
      message,
      'Your session has expired. Please sign in again.',
      true
    );
    this.name = 'SessionExpiredError';
  }
}

/**
 * Token Refresh Error
 * Thrown when token refresh fails
 */
export class TokenRefreshError extends AuthError {
  constructor(message: string = 'Failed to refresh authentication token') {
    super(
      'TOKEN_REFRESH_FAILED',
      message,
      'Authentication failed. Please sign in again.',
      false
    );
    this.name = 'TokenRefreshError';
  }
}

/**
 * Invalid Credentials Error
 * Thrown when authentication credentials are invalid
 */
export class InvalidCredentialsError extends AuthError {
  constructor(message: string = 'Invalid credentials') {
    super(
      'INVALID_CREDENTIALS',
      message,
      'Invalid phone number or OTP code. Please try again.',
      true
    );
    this.name = 'InvalidCredentialsError';
  }
}

/**
 * Rate Limit Error
 * Thrown when too many requests are made
 */
export class RateLimitError extends AuthError {
  constructor(message: string, public retryAfter?: number) {
    super(
      'RATE_LIMIT',
      message,
      message,
      true,
      { retryAfter }
    );
    this.name = 'RateLimitError';
  }
}

/**
 * Error handler utility
 * Maps API errors to appropriate error classes
 */
export const handleAuthError = (error: any): AuthError => {
  // Network errors
  if (!error.response) {
    return new NetworkError('Network request failed');
  }

  const status = error.response?.status;
  const data = error.response?.data;

  // Map status codes to error types
  switch (status) {
    case 400:
      return new ValidationError(
        data?.message || 'Invalid request',
        data?.errors || {}
      );

    case 401:
      if (data?.code === 'token_not_valid') {
        return new SessionExpiredError();
      }
      return new InvalidCredentialsError(data?.message);

    case 429:
      return new RateLimitError(
        data?.message || 'Too many requests',
        data?.retryAfter
      );

    case 500:
    case 502:
    case 503:
    case 504:
      return new AuthError(
        'SERVER_ERROR',
        'Server error',
        'Server is temporarily unavailable. Please try again later.',
        true
      );

    default:
      return new AuthError(
        'UNKNOWN_ERROR',
        data?.message || 'An unexpected error occurred',
        'Something went wrong. Please try again.',
        true
      );
  }
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  if (error instanceof AuthError) {
    return error.userMessage;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Check if error is recoverable
 */
export const isRecoverableError = (error: any): boolean => {
  if (error instanceof AuthError) {
    return error.recoverable;
  }

  // Network errors are generally recoverable
  if (!error.response) {
    return true;
  }

  // 5xx errors are recoverable (server issues)
  const status = error.response?.status;
  return status >= 500 && status < 600;
};
