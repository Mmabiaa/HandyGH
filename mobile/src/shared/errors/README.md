# Error Handling System

This directory contains the error handling infrastructure for the HandyGH Mobile Application.

## Overview

The error handling system provides:
- Custom error classes for different error types
- Global error handler with Sentry integration
- Retry logic with exponential backoff
- User-friendly error messages
- Error UI components

## Components

### Error Classes

**AppError** - Base error class for all application errors
- `code`: Error code for identification
- `message`: Technical error message
- `userMessage`: User-friendly error message
- `recoverable`: Whether the error is recoverable
- `metadata`: Additional error context

**NetworkError** - Network connectivity errors
**AuthenticationError** - Authentication/authorization errors
**ValidationError** - Form validation errors
**PaymentError** - Payment processing errors
**ServerError** - Server-side errors (5xx)
**TimeoutError** - Request timeout errors
**SecurityError** - Security-related errors
**NotFoundError** - Resource not found errors (404)

### Global Error Handler

The `globalErrorHandler` provides centralized error handling:

```typescript
import { handleError } from '@/shared/errors';

try {
  // Your code
} catch (error) {
  handleError(error, { context: 'additional info' });
}
```

Features:
- Logs errors to Sentry
- Shows user-friendly toast messages
- Handles specific error types appropriately
- Configurable logging and notifications

### Retry Utilities

The `withRetry` function provides automatic retry logic:

```typescript
import { withRetry } from '@/shared/errors';

const data = await withRetry(
  () => apiClient.get('/endpoint'),
  {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
  }
);
```

## Integration

### API Client

The API client automatically converts Axios errors to AppError instances:

```typescript
// Errors are automatically converted and handled
const data = await api.get('/endpoint');
```

### React Components

Use ErrorBoundary to catch React errors:

```typescript
import { ErrorBoundary } from '@/shared/components';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Form Validation

Use validation utilities for form inputs:

```typescript
import { useFormValidation, validationRules } from '@/shared/hooks';

const { values, errors, setValue, validate } = useFormValidation(
  { email: '', password: '' },
  {
    email: {
      rules: [validationRules.required(), validationRules.email()],
    },
    password: {
      rules: [validationRules.required(), validationRules.minLength(8)],
    },
  }
);
```

## Requirements Covered

- **16.1**: User-friendly error messages without technical details
- **16.2**: Network error handling with retry options
- **16.3**: Inline validation errors and error boundaries
- **16.4**: Sentry integration for error tracking
- **16.5**: Success feedback with animations
- **16.6**: Maintenance mode handling
- **16.7**: Session expiration handling
- **16.8**: Exponential backoff for retries
- **16.9**: Actionable error guidance

## Best Practices

1. Always use custom error classes instead of generic Error
2. Provide context when handling errors
3. Use retry logic for transient failures
4. Show user-friendly messages, not technical details
5. Log errors to Sentry for monitoring
6. Handle errors at appropriate levels (component, service, global)
