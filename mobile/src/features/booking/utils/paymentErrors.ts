/**
 * Payment Error Handling Utilities
 *
 * Provides payment-specific error messages and handling logic.
 *
 * Requirements:
 * - 16.1: User-friendly error messages
 * - 16.2: Network error handling with retry options
 */

export enum PaymentErrorCode {
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_PHONE = 'INVALID_PHONE',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  TRANSACTION_DECLINED = 'TRANSACTION_DECLINED',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  DUPLICATE_TRANSACTION = 'DUPLICATE_TRANSACTION',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface PaymentError {
  code: PaymentErrorCode;
  message: string;
  userMessage: string;
  retryable: boolean;
  suggestedAction?: string;
}

/**
 * Parse error from API response or exception
 */
export const parsePaymentError = (error: any): PaymentError => {
  // Network errors
  if (error.message?.includes('Network') || error.code === 'ECONNABORTED') {
    return {
      code: PaymentErrorCode.NETWORK_ERROR,
      message: error.message,
      userMessage: 'Unable to connect to payment service. Please check your internet connection.',
      retryable: true,
      suggestedAction: 'Check your connection and try again',
    };
  }

  // Timeout errors
  if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
    return {
      code: PaymentErrorCode.TIMEOUT,
      message: error.message,
      userMessage: 'Payment request timed out. This may take a few minutes to process.',
      retryable: true,
      suggestedAction: 'Wait a moment and check your transaction history',
    };
  }

  // API error responses
  if (error.response?.data) {
    const { code, message } = error.response.data;

    switch (code) {
      case 'INSUFFICIENT_FUNDS':
        return {
          code: PaymentErrorCode.INSUFFICIENT_FUNDS,
          message,
          userMessage: 'Insufficient funds in your mobile money account.',
          retryable: false,
          suggestedAction: 'Top up your account or use a different payment method',
        };

      case 'INVALID_PHONE':
      case 'INVALID_PHONE_NUMBER':
        return {
          code: PaymentErrorCode.INVALID_PHONE,
          message,
          userMessage: 'The phone number provided is not valid for mobile money.',
          retryable: false,
          suggestedAction: 'Check your phone number and try again',
        };

      case 'PROVIDER_ERROR':
      case 'PROVIDER_UNAVAILABLE':
        return {
          code: PaymentErrorCode.PROVIDER_ERROR,
          message,
          userMessage: 'Mobile money provider is currently unavailable.',
          retryable: true,
          suggestedAction: 'Try again in a few minutes or use a different provider',
        };

      case 'TRANSACTION_DECLINED':
      case 'PAYMENT_DECLINED':
        return {
          code: PaymentErrorCode.TRANSACTION_DECLINED,
          message,
          userMessage: 'Transaction was declined by your mobile money provider.',
          retryable: false,
          suggestedAction: 'Contact your provider or use a different payment method',
        };

      case 'VERIFICATION_FAILED':
        return {
          code: PaymentErrorCode.VERIFICATION_FAILED,
          message,
          userMessage: 'Unable to verify payment status.',
          retryable: true,
          suggestedAction: 'Check your transaction history or contact support',
        };

      case 'INVALID_AMOUNT':
        return {
          code: PaymentErrorCode.INVALID_AMOUNT,
          message,
          userMessage: 'Payment amount is invalid.',
          retryable: false,
          suggestedAction: 'Please contact support',
        };

      case 'DUPLICATE_TRANSACTION':
        return {
          code: PaymentErrorCode.DUPLICATE_TRANSACTION,
          message,
          userMessage: 'This transaction has already been processed.',
          retryable: false,
          suggestedAction: 'Check your booking history',
        };

      default:
        return {
          code: PaymentErrorCode.UNKNOWN_ERROR,
          message: message || 'Unknown error',
          userMessage: 'An unexpected error occurred during payment.',
          retryable: true,
          suggestedAction: 'Try again or contact support',
        };
    }
  }

  // Default unknown error
  return {
    code: PaymentErrorCode.UNKNOWN_ERROR,
    message: error.message || 'Unknown error',
    userMessage: 'An unexpected error occurred during payment.',
    retryable: true,
    suggestedAction: 'Try again or contact support',
  };
};

/**
 * Get user-friendly error message for display
 */
export const getPaymentErrorMessage = (error: any): string => {
  const paymentError = parsePaymentError(error);
  return paymentError.userMessage;
};

/**
 * Check if error is retryable
 */
export const isPaymentErrorRetryable = (error: any): boolean => {
  const paymentError = parsePaymentError(error);
  return paymentError.retryable;
};

/**
 * Get suggested action for error
 */
export const getPaymentErrorAction = (error: any): string | undefined => {
  const paymentError = parsePaymentError(error);
  return paymentError.suggestedAction;
};

/**
 * Format error for alert display
 */
export interface PaymentErrorAlert {
  title: string;
  message: string;
  buttons: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

export const formatPaymentErrorAlert = (
  error: any,
  onRetry?: () => void,
  onChangeMethod?: () => void,
  onCancel?: () => void
): PaymentErrorAlert => {
  const paymentError = parsePaymentError(error);

  const buttons: PaymentErrorAlert['buttons'] = [];

  // Add retry button if error is retryable
  if (paymentError.retryable && onRetry) {
    buttons.push({
      text: 'Try Again',
      onPress: onRetry,
    });
  }

  // Add change method button
  if (onChangeMethod) {
    buttons.push({
      text: 'Change Payment Method',
      onPress: onChangeMethod,
    });
  }

  // Add cancel button
  buttons.push({
    text: 'Cancel',
    onPress: onCancel,
    style: 'cancel',
  });

  return {
    title: 'Payment Failed',
    message: `${paymentError.userMessage}\n\n${paymentError.suggestedAction || ''}`,
    buttons,
  };
};

/**
 * Timeout configuration for payment operations
 */
export const PAYMENT_TIMEOUTS = {
  INITIATION: 30000, // 30 seconds
  VERIFICATION_POLL_INTERVAL: 3000, // 3 seconds
  VERIFICATION_MAX_ATTEMPTS: 10, // 30 seconds total
  VERIFICATION_TOTAL: 30000, // 30 seconds
};

/**
 * Check if payment verification has timed out
 */
export const hasPaymentVerificationTimedOut = (
  startTime: number,
  timeout: number = PAYMENT_TIMEOUTS.VERIFICATION_TOTAL
): boolean => {
  return Date.now() - startTime > timeout;
};

/**
 * Create timeout error
 */
export const createTimeoutError = (): PaymentError => {
  return {
    code: PaymentErrorCode.TIMEOUT,
    message: 'Payment verification timeout',
    userMessage: 'Payment verification is taking longer than expected.',
    retryable: true,
    suggestedAction: 'Check your transaction history or contact support',
  };
};
