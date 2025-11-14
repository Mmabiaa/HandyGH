import * as Sentry from '@sentry/react-native';
// react-native-toast-message requires native modules not available in Expo Go
// Using mock for Expo Go compatibility
import Toast from '../utils/toastMock';
import {
  AppError,
  NetworkError,
  AuthenticationError,
  ValidationError,
  PaymentError,
  ServerError,
  TimeoutError,
} from './AppError';

/**
 * Global error handler configuration
 */
interface ErrorHandlerConfig {
  enableSentry: boolean;
  enableToast: boolean;
  logToConsole: boolean;
}

const defaultConfig: ErrorHandlerConfig = {
  enableSentry: true,
  enableToast: true,
  logToConsole: __DEV__,
};

/**
 * Global error handler for the application
 */
class GlobalErrorHandler {
  private config: ErrorHandlerConfig;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Main error handling method
   */
  handle(error: Error, context?: Record<string, any>): void {
    // Log to console in development
    if (this.config.logToConsole) {
      console.error('[GlobalErrorHandler]', error, context);
    }

    // Log to Sentry
    if (this.config.enableSentry) {
      this.logToSentry(error, context);
    }

    // Show user-friendly message
    if (this.config.enableToast) {
      this.showUserMessage(error);
    }

    // Handle specific error types
    if (error instanceof NetworkError) {
      this.handleNetworkError(error);
    } else if (error instanceof AuthenticationError) {
      this.handleAuthError(error);
    } else if (error instanceof ValidationError) {
      this.handleValidationError(error);
    } else if (error instanceof PaymentError) {
      this.handlePaymentError(error);
    }
  }

  /**
   * Handle network errors
   */
  private handleNetworkError(_error: NetworkError): void {
    // Network errors are handled by the network status banner
    // Additional logic can be added here if needed
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(_error: AuthenticationError): void {
    // Authentication errors trigger logout and navigation
    // This is handled by the API interceptor
  }

  /**
   * Handle validation errors
   */
  private handleValidationError(error: ValidationError): void {
    // Validation errors are typically handled inline in forms
    // Show a general toast for validation errors
    if (this.config.enableToast) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: error.userMessage,
        position: 'top',
        visibilityTime: 4000,
      });
    }
  }

  /**
   * Handle payment errors
   */
  private handlePaymentError(error: PaymentError): void {
    // Payment errors need special attention
    if (this.config.logToConsole) {
      console.error('[PaymentError]', {
        provider: error.paymentProvider,
        message: error.message,
      });
    }
  }

  /**
   * Log error to Sentry
   */
  private logToSentry(error: Error, context?: Record<string, any>): void {
    try {
      const tags: Record<string, string> = {
        errorType: error.name,
      };

      if (error instanceof AppError) {
        tags.errorCode = error.code;
        tags.recoverable = error.recoverable.toString();
      }

      Sentry.captureException(error, {
        tags,
        extra: {
          ...context,
          ...(error instanceof AppError ? error.metadata : {}),
        },
      });
    } catch (sentryError) {
      console.error('[Sentry] Failed to log error:', sentryError);
    }
  }

  /**
   * Show user-friendly error message
   */
  private showUserMessage(error: Error): void {
    let message = 'Something went wrong. Please try again.';
    let type: 'error' | 'info' = 'error';

    if (error instanceof AppError) {
      message = error.userMessage;
      type = error.recoverable ? 'error' : 'error';
    }

    Toast.show({
      type,
      text1: 'Error',
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
    });
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export singleton instance
export const globalErrorHandler = new GlobalErrorHandler();

/**
 * Helper function to handle errors consistently
 */
export function handleError(error: unknown, context?: Record<string, any>): void {
  if (error instanceof Error) {
    globalErrorHandler.handle(error, context);
  } else {
    globalErrorHandler.handle(
      new AppError(
        'UNKNOWN_ERROR',
        String(error),
        'An unexpected error occurred.',
        true
      ),
      context
    );
  }
}

/**
 * Convert Axios errors to AppError instances
 */
export function convertAxiosError(error: any): AppError {
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new TimeoutError(error.message);
  }

  if (!error.response) {
    return new NetworkError(error.message, { originalError: error.code });
  }

  const { status, data } = error.response;

  switch (status) {
    case 401:
    case 403:
      return new AuthenticationError(
        data?.message || 'Authentication failed',
        { status }
      );

    case 404:
      return new AppError(
        'NOT_FOUND',
        data?.message || 'Resource not found',
        'The requested resource was not found.',
        true,
        { status }
      );

    case 422:
      return new ValidationError(
        data?.message || 'Validation failed',
        data?.errors || {}
      );

    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(data?.message || 'Server error', status);

    default:
      return new AppError(
        'API_ERROR',
        data?.message || 'An error occurred',
        'Something went wrong. Please try again.',
        true,
        { status, data }
      );
  }
}
