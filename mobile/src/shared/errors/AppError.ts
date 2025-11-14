/**
 * Base error class for application-specific errors
 */
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public userMessage: string,
    public recoverable: boolean = true,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Network-related errors (connectivity, timeout, etc.)
 */
export class NetworkError extends AppError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(
      'NETWORK_ERROR',
      message,
      'Unable to connect. Please check your internet connection.',
      true,
      metadata
    );
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Authentication and authorization errors
 */
export class AuthenticationError extends AppError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(
      'AUTH_ERROR',
      message,
      'Your session has expired. Please sign in again.',
      true,
      metadata
    );
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Validation errors for form inputs and data
 */
export class ValidationError extends AppError {
  constructor(message: string, public fields: Record<string, string>) {
    super(
      'VALIDATION_ERROR',
      message,
      'Please check your input and try again.',
      true,
      { fields }
    );
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Payment processing errors
 */
export class PaymentError extends AppError {
  constructor(message: string, public paymentProvider?: string) {
    super(
      'PAYMENT_ERROR',
      message,
      'Payment failed. Please try again or use a different payment method.',
      true,
      { paymentProvider }
    );
    this.name = 'PaymentError';
    Object.setPrototypeOf(this, PaymentError.prototype);
  }
}

/**
 * Server errors (5xx responses)
 */
export class ServerError extends AppError {
  constructor(message: string, public statusCode?: number) {
    super(
      'SERVER_ERROR',
      message,
      'Something went wrong on our end. Please try again later.',
      true,
      { statusCode }
    );
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * Timeout errors
 */
export class TimeoutError extends AppError {
  constructor(message: string) {
    super(
      'TIMEOUT_ERROR',
      message,
      'Request timed out. Please try again.',
      true
    );
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Security-related errors
 */
export class SecurityError extends AppError {
  constructor(message: string) {
    super(
      'SECURITY_ERROR',
      message,
      'A security error occurred. Please contact support.',
      false
    );
    this.name = 'SecurityError';
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

/**
 * Not found errors (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(
      'NOT_FOUND_ERROR',
      `${resource} not found`,
      'The requested resource was not found.',
      true,
      { resource }
    );
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
