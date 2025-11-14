# API Client and Service Layer

This directory contains the API client implementation and service modules for the HandyGH Mobile Application.

## Structure

```
api/
├── client.ts              # Axios instance with interceptors
├── types.ts               # TypeScript interfaces for API requests/responses
├── services/
│   ├── AuthService.ts     # Authentication and OTP services
│   ├── ProviderService.ts # Provider discovery and management
│   ├── BookingService.ts  # Booking creation and management
│   ├── PaymentService.ts  # Mobile Money payment integration
│   └── __tests__/         # Unit tests for all services
└── index.ts               # Public API exports
```

## Features

### API Client (`client.ts`)

- **Axios Instance**: Configured with base URL, timeout (30s), and default headers
- **Request Interceptor**: Automatically injects authentication tokens from secure storage
- **Response Interceptor**: Handles token refresh on 401 errors
- **Retry Logic**: Exponential backoff for failed requests (max 3 attempts)
- **Error Handling**: Comprehensive error handling for network, auth, and server errors
- **Type Safety**: Fully typed API client interface

### Services

#### AuthService
- `requestOTP(phoneNumber)` - Request OTP code for phone verification
- `verifyOTP(phoneNumber, code)` - Verify OTP and receive auth tokens
- `refreshToken(refreshToken)` - Refresh expired access token
- `logout()` - Logout and clear stored tokens
- `isAuthenticated()` - Check if user has valid tokens

#### ProviderService
- `getProviders(params)` - Get providers with filters (category, location, search)
- `getProviderById(id)` - Get detailed provider information
- `getProviderServices(id)` - Get services offered by provider
- `getProviderReviews(id, page)` - Get provider reviews with pagination
- `favoriteProvider(id)` - Add provider to favorites
- `unfavoriteProvider(id)` - Remove provider from favorites
- `searchProviders(query)` - Search providers by query
- `getFeaturedProviders()` - Get featured providers
- `getNearbyProviders(lat, lng, radius)` - Get providers by location

#### BookingService
- `createBooking(data)` - Create new booking
- `getBookings(status)` - Get all bookings, optionally filtered by status
- `getBookingById(id)` - Get booking details
- `updateBookingStatus(id, status)` - Update booking status
- `cancelBooking(id, reason)` - Cancel booking with reason
- `checkAvailability(params)` - Check provider availability for date
- `getActiveBookings()` - Get active bookings
- `submitReview(bookingId, rating, comment)` - Submit review for completed booking

#### PaymentService
- `initiateMoMoPayment(data)` - Initiate Mobile Money payment
- `verifyPayment(transactionId)` - Verify payment status
- `getPaymentMethods()` - Get user's saved payment methods
- `addPaymentMethod(method)` - Add new payment method
- `deletePaymentMethod(id)` - Delete payment method
- `setDefaultPaymentMethod(id)` - Set default payment method
- `pollPaymentStatus(transactionId)` - Poll payment status until completion

## Usage

```typescript
import { AuthService, ProviderService, BookingService, PaymentService } from '@core/api';

// Authentication
const otpResponse = await AuthService.requestOTP('+233241234567');
const authResponse = await AuthService.verifyOTP('+233241234567', '123456');

// Provider Discovery
const providers = await ProviderService.getProviders({ category: 'plumbing' });
const provider = await ProviderService.getProviderById('provider-id');

// Booking Creation
const booking = await BookingService.createBooking({
  providerId: 'provider-id',
  serviceId: 'service-id',
  scheduledDate: '2025-11-15',
  scheduledTime: '10:00',
  location: { /* location data */ },
});

// Payment
const payment = await PaymentService.initiateMoMoPayment({
  amount: 100,
  currency: 'GHS',
  phoneNumber: '+233241234567',
  provider: 'mtn',
  bookingId: 'booking-id',
});
```

## Testing

All services have comprehensive unit tests with 90%+ coverage:

```bash
npm test -- src/core/api
```

Tests cover:
- ✅ Successful API calls
- ✅ Error handling
- ✅ Retry logic
- ✅ Token refresh flow
- ✅ Query parameter construction
- ✅ Payment polling

## Requirements Covered

- **Requirement 1.5, 1.7**: OTP authentication flow
- **Requirement 2.2**: Provider discovery and filtering
- **Requirement 4.11**: Booking creation and MoMo payment integration
- **Requirement 13.2**: Token refresh and session management
- **Requirement 16.8**: Exponential backoff retry logic
- **Requirement 18.2**: Comprehensive unit tests for API services
