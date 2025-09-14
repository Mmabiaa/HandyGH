# Frontend Integration Guide

This guide documents the migration from Supabase/Stripe to the Node.js/Prisma backend integration.

## Changes Made

### 1. API Client (`src/lib/apiClient.js`)
- Created centralized axios-based API client
- Automatic JWT token handling with refresh logic
- Error handling and retry mechanisms
- Base URL configuration via environment variables

### 2. Environment Variables (`.env`)
- Removed Supabase and Stripe environment variables
- Added backend API URL configuration
- Added WebSocket URL for real-time features

### 3. Services Updated

#### Booking Service (`src/services/bookingService.js`)
- Replaced all Supabase calls with REST API calls
- Added new methods for providers, messaging, and reviews
- Updated to use centralized API client

#### Auth Service (`src/services/authService.js`)
- Replaced Supabase auth with JWT-based authentication
- Added OTP verification support
- Updated profile management methods

#### Payment Service (`src/services/paymentService.js`)
- New service for MoMo payment integration
- Replaced Stripe with MTN MoMo payment processing
- Added payment verification and history methods

### 4. Components Updated

#### Payment Components
- **Removed**: `StripePaymentForm.jsx`
- **Added**: `MoMoPaymentForm.jsx`
- **Updated**: `PaymentStep.jsx` to use MoMo instead of Stripe

#### Context Providers
- **Removed**: `StripeContext.jsx`
- **Updated**: Auth context to use new backend authentication

### 5. Redux Store (`src/store/slices/apiSlice.js`)
- Updated base URL to use backend API
- Added comprehensive API endpoints for all features
- Updated token handling to use localStorage

### 6. WebSocket Client (`src/lib/wsClient.js`)
- New real-time communication client
- Automatic reconnection logic
- Event handlers for booking updates, messages, and notifications

## Backend Integration Points

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/verify-otp` - Verify OTP
- `POST /api/v1/auth/reset-password` - Reset password

### Booking Endpoints
- `GET /api/v1/bookings` - Get user bookings
- `GET /api/v1/bookings/:id` - Get booking details
- `POST /api/v1/bookings` - Create new booking
- `PATCH /api/v1/bookings/:id/status` - Update booking status
- `POST /api/v1/bookings/:id/messages` - Send message
- `GET /api/v1/bookings/:id/messages` - Get messages
- `POST /api/v1/bookings/:id/reviews` - Submit review

### Service Endpoints
- `GET /api/v1/services` - Get available services
- `GET /api/v1/categories` - Get service categories
- `GET /api/v1/providers` - Get providers
- `GET /api/v1/providers/:id` - Get provider details

### Payment Endpoints
- `POST /api/v1/payments/momo/charge` - Create MoMo payment
- `POST /api/v1/payments/momo/verify` - Verify MoMo payment
- `GET /api/v1/payments/status/:bookingId` - Get payment status
- `GET /api/v1/payments/history` - Get payment history
- `POST /api/v1/payments/refund/:bookingId` - Refund payment

## WebSocket Events

### Client to Server
- `join_booking` - Join booking room for real-time updates
- `leave_booking` - Leave booking room
- `send_message` - Send message to booking

### Server to Client
- `booking_update` - Booking status or details updated
- `new_message` - New message received
- `provider_notification` - Notification for providers
- `customer_notification` - Notification for customers

## Environment Setup

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:4001
```

### Backend (.env)
```env
CORS_ORIGIN=http://localhost:5173
```

## Testing Checklist

- [ ] User registration and login
- [ ] Service browsing and search
- [ ] Booking creation and management
- [ ] MoMo payment processing
- [ ] Real-time messaging
- [ ] Provider dashboard functionality
- [ ] Customer dashboard functionality
- [ ] Review submission
- [ ] WebSocket connectivity

## Common Issues and Solutions

### CORS Errors
- Ensure backend CORS is configured to allow frontend origin
- Check that CORS_ORIGIN environment variable is set correctly

### Authentication Issues
- Verify JWT tokens are being stored in localStorage
- Check that refresh token logic is working
- Ensure backend auth endpoints are accessible

### Payment Issues
- Verify MoMo integration is properly configured
- Check phone number formatting
- Ensure payment verification is working

### WebSocket Issues
- Check WebSocket server is running on correct port
- Verify authentication token is valid
- Check network connectivity

## Migration Notes

1. **Data Migration**: User data needs to be migrated from Supabase to the new backend
2. **File Storage**: Any file uploads need to be migrated to the new storage solution
3. **Email Templates**: Update email templates to match new backend structure
4. **Webhooks**: Update any webhook configurations to point to new backend

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Preview production build
npm run serve
```

## Deployment

1. Update environment variables for production
2. Build the frontend: `npm run build`
3. Deploy to your hosting platform
4. Ensure backend is deployed and accessible
5. Update CORS settings for production domain
