# HandyGH API Documentation

## Overview

The HandyGH API is a RESTful API that enables customers to find and book local service providers. The API supports authentication, provider search, booking management, payments, reviews, messaging, and administrative operations.

**Base URL:** `http://localhost:8000/api/v1/`

**API Documentation:** 
- Swagger UI: `http://localhost:8000/api/docs/`
- ReDoc: `http://localhost:8000/api/redoc/`

## Authentication

The API uses JWT (JSON Web Token) authentication with OTP (One-Time Password) verification.

### Authentication Flow

1. **Request OTP** - Send phone number to receive OTP
2. **Verify OTP** - Submit OTP to receive JWT tokens
3. **Use Access Token** - Include access token in Authorization header
4. **Refresh Token** - Use refresh token to get new access token when expired

### Request OTP

```http
POST /api/v1/auth/otp/request/
Content-Type: application/json

{
  "phone": "+233241234567"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "OTP sent successfully",
    "expires_in_minutes": 10
  },
  "meta": {}
}
```

### Verify OTP

```http
POST /api/v1/auth/otp/verify/
Content-Type: application/json

{
  "phone": "+233241234567",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": "uuid",
      "phone": "+233241234567",
      "name": "John Doe",
      "role": "CUSTOMER"
    }
  },
  "meta": {}
}
```

### Using Access Token

Include the access token in the Authorization header for all authenticated requests:

```http
GET /api/v1/users/me/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### Refresh Access Token

```http
POST /api/v1/auth/token/refresh/
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Logout

```http
POST /api/v1/auth/logout/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

## User Management

### Get Current User Profile

```http
GET /api/v1/users/me/
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "phone": "+233241234567",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "CUSTOMER",
    "is_active": true,
    "created_at": "2025-01-15T10:00:00Z",
    "profile": {
      "profile_picture_url": "https://...",
      "address": "Accra, Ghana",
      "preferences": {}
    }
  },
  "meta": {}
}
```

### Update Current User Profile

```http
PATCH /api/v1/users/me/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "John Doe Updated",
  "email": "john.updated@example.com"
}
```

## Provider Management

### Search Providers

```http
GET /api/v1/providers/?category=plumber&latitude=5.6037&longitude=-0.1870&radius_km=5&min_rating=4.0&verified_only=true
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `category` (optional): Category slug to filter by
- `latitude` (optional): Search center latitude
- `longitude` (optional): Search center longitude
- `radius_km` (optional): Search radius in kilometers (default: 5.0)
- `min_rating` (optional): Minimum rating filter (0.0 to 5.0)
- `verified_only` (optional): Only return verified providers (true/false)
- `sort_by` (optional): Sort order - rating, distance, price (default: rating)
- `min_price` (optional): Minimum price filter
- `max_price` (optional): Maximum price filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "business_name": "Kofi's Plumbing Services",
      "categories": ["plumber"],
      "location": {
        "latitude": "5.6037",
        "longitude": "-0.1870",
        "address": "Accra, Ghana"
      },
      "verified": true,
      "rating_avg": "4.5",
      "rating_count": 25,
      "distance_km": 2.3,
      "services": [
        {
          "id": "uuid",
          "title": "Pipe Repair",
          "price_type": "FIXED",
          "price_amount": "150.00",
          "price_display": "GHS 150.00 (Fixed)"
        }
      ]
    }
  ],
  "meta": {
    "count": 1,
    "filters": {
      "category": "plumber",
      "latitude": "5.6037",
      "longitude": "-0.1870",
      "radius_km": 5.0,
      "min_rating": 4.0,
      "verified_only": true,
      "sort_by": "rating"
    }
  }
}
```

### Get Provider Details

```http
GET /api/v1/providers/{provider_id}/
Authorization: Bearer {access_token}
```

### Create Provider Profile

```http
POST /api/v1/providers/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "business_name": "Kofi's Plumbing Services",
  "categories": ["plumber"],
  "latitude": "5.6037",
  "longitude": "-0.1870",
  "address": "Accra, Ghana",
  "verification_doc_url": "https://..."
}
```

### Add Service to Provider

```http
POST /api/v1/providers/{provider_id}/services/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "category_id": "uuid",
  "title": "Pipe Repair",
  "description": "Professional pipe repair service",
  "price_type": "FIXED",
  "price_amount": "150.00",
  "duration_estimate_min": 120
}
```

## Booking Management

### Create Booking

```http
POST /api/v1/bookings/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "provider_service_id": "uuid",
  "scheduled_start": "2025-01-20T10:00:00Z",
  "duration_hours": 2.0,
  "address": "123 Main St, Accra",
  "notes": "Please bring necessary tools"
}
```

**Response:**
```json
{
  "id": "uuid",
  "booking_ref": "BK-20250115-ABCD",
  "customer": {...},
  "provider": {...},
  "provider_service": {...},
  "status": "REQUESTED",
  "scheduled_start": "2025-01-20T10:00:00Z",
  "scheduled_end": "2025-01-20T12:00:00Z",
  "address": "123 Main St, Accra",
  "notes": "Please bring necessary tools",
  "total_amount": "300.00",
  "commission_amount": "30.00",
  "payment_status": "PENDING",
  "created_at": "2025-01-15T10:00:00Z"
}
```

### List Bookings

```http
GET /api/v1/bookings/?status=CONFIRMED&payment_status=PAID
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `status` (optional): Filter by booking status (REQUESTED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, DISPUTED)
- `payment_status` (optional): Filter by payment status (PENDING, AUTHORIZED, PAID, FAILED, REFUNDED)

### Get Booking Details

```http
GET /api/v1/bookings/{booking_id}/
Authorization: Bearer {access_token}
```

### Provider Accept Booking

```http
PATCH /api/v1/bookings/{booking_id}/accept/
Authorization: Bearer {access_token}
```

### Provider Decline Booking

```http
PATCH /api/v1/bookings/{booking_id}/decline/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "reason": "Not available at that time"
}
```

### Update Booking Status

```http
PATCH /api/v1/bookings/{booking_id}/status/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "reason": "Started work"
}
```

## Payment Processing

### Initiate MoMo Payment

```http
POST /api/v1/payments/momo/charge/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "booking_id": "uuid",
  "phone": "+233241234567"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "status": "SUCCESS",
    "message": "Payment successful",
    "provider_ref": "MOMO-REF-123",
    "amount": "300.00"
  }
}
```

### Manual Payment Confirmation

```http
POST /api/v1/payments/manual/confirm/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "booking_id": "uuid",
  "transaction_ref": "MOMO-REF-123",
  "amount": "300.00",
  "payment_method": "MOMO",
  "notes": "Paid via MTN MoMo"
}
```

### List Transactions

```http
GET /api/v1/payments/transactions/
Authorization: Bearer {access_token}
```

## Reviews and Ratings

### Submit Review

```http
POST /api/v1/bookings/{booking_id}/reviews/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent service! Very professional and timely."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "booking": "uuid",
    "customer": {...},
    "provider": {...},
    "rating": 5,
    "comment": "Excellent service! Very professional and timely.",
    "created_at": "2025-01-15T10:00:00Z"
  },
  "message": "Review submitted successfully"
}
```

### Get Provider Reviews

```http
GET /api/v1/providers/{provider_id}/reviews/
Authorization: Bearer {access_token}
```

### Get Provider Rating Statistics

```http
GET /api/v1/providers/{provider_id}/rating-stats/
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "provider_id": "uuid",
    "average_rating": "4.5",
    "total_reviews": 25,
    "rating_distribution": {
      "5": 15,
      "4": 8,
      "3": 2,
      "2": 0,
      "1": 0
    }
  }
}
```

## Messaging

### Send Message

```http
POST /api/v1/bookings/{booking_id}/messages/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "content": "Hello, I have a question about the booking.",
  "attachments": ["https://..."]
}
```

### Get Booking Messages

```http
GET /api/v1/bookings/{booking_id}/messages/?limit=50&offset=0
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `limit` (optional): Number of messages to return
- `offset` (optional): Number of messages to skip

## Dispute Management

### Create Dispute

```http
POST /api/v1/disputes/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "booking_id": "uuid",
  "reason": "SERVICE_NOT_PROVIDED",
  "description": "The provider did not show up for the appointment.",
  "evidence": [
    {
      "type": "image",
      "url": "https://...",
      "description": "Screenshot of messages"
    }
  ]
}
```

### List Disputes

```http
GET /api/v1/disputes/?status=OPEN&ordering=-created_at
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `status` (optional): Filter by status (OPEN, INVESTIGATING, RESOLVED, CLOSED)
- `raised_by` (optional): Filter by user ID
- `ordering` (optional): Order by field (created_at, -created_at, updated_at, -updated_at)

### Get Dispute Details

```http
GET /api/v1/disputes/{dispute_id}/
Authorization: Bearer {access_token}
```

### Add Evidence to Dispute

```http
POST /api/v1/disputes/{dispute_id}/add-evidence/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "type": "image",
  "url": "https://...",
  "description": "Additional evidence"
}
```

### Resolve Dispute (Admin Only)

```http
POST /api/v1/disputes/{dispute_id}/resolve/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "resolution": "Refund issued to customer. Provider warned."
}
```

## Admin Dashboard

All admin endpoints require the user to have the ADMIN role.

### Get Dashboard Statistics

```http
GET /api/v1/admin/dashboard/stats/
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_users": 1250,
    "total_customers": 1000,
    "total_providers": 200,
    "total_admins": 5,
    "active_users": 1100,
    "total_bookings": 5000,
    "completed_bookings": 4500,
    "total_revenue": "150000.00",
    "platform_commission": "15000.00"
  }
}
```

### Get User Statistics

```http
GET /api/v1/admin/users/statistics/?start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer {access_token}
```

### Get Booking Statistics

```http
GET /api/v1/admin/reports/bookings/?start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer {access_token}
```

### Get Transaction Statistics

```http
GET /api/v1/admin/reports/transactions/?start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer {access_token}
```

### List All Users

```http
GET /api/v1/admin/users/?role=PROVIDER&is_active=true&search=john
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `role` (optional): Filter by role (CUSTOMER, PROVIDER, ADMIN)
- `is_active` (optional): Filter by active status (true/false)
- `search` (optional): Search by phone, email, or name

### Suspend User

```http
PATCH /api/v1/admin/users/{user_id}/suspend/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "reason": "Violation of terms of service"
}
```

### Activate User

```http
PATCH /api/v1/admin/users/{user_id}/activate/
Authorization: Bearer {access_token}
```

### Export Data to CSV

```http
GET /api/v1/admin/export/csv/?export_type=transactions&start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `export_type` (required): Type of data (users, bookings, transactions)
- `start_date` (optional): Start date for filtering (YYYY-MM-DD)
- `end_date` (optional): End date for filtering (YYYY-MM-DD)
- `role` (optional): For users export only
- `is_active` (optional): For users export only

## Error Handling

The API uses standard HTTP status codes and returns errors in a consistent format:

```json
{
  "success": false,
  "errors": {
    "field_name": ["Error message 1", "Error message 2"],
    "non_field_errors": ["General error message"]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z",
    "request_id": "uuid"
  }
}
```

### Common Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Anonymous users:** 100 requests per hour
- **Authenticated users:** 1000 requests per hour
- **OTP requests:** 5 requests per hour per phone number
- **OTP verification:** 10 requests per hour per phone number

When rate limit is exceeded, the API returns a `429 Too Many Requests` status code.

## Pagination

List endpoints support pagination using query parameters:

- `page` - Page number (default: 1)
- `page_size` - Number of items per page (default: 20, max: 100)

**Example:**
```http
GET /api/v1/bookings/?page=2&page_size=50
Authorization: Bearer {access_token}
```

**Response includes pagination metadata:**
```json
{
  "count": 150,
  "next": "http://localhost:8000/api/v1/bookings/?page=3",
  "previous": "http://localhost:8000/api/v1/bookings/?page=1",
  "results": [...]
}
```

## Best Practices

1. **Always use HTTPS in production** - Never send tokens over unencrypted connections
2. **Store tokens securely** - Use secure storage mechanisms (e.g., HttpOnly cookies, secure storage APIs)
3. **Refresh tokens before expiry** - Access tokens expire after 15 minutes
4. **Handle errors gracefully** - Check response status and handle errors appropriately
5. **Implement retry logic** - For transient errors (5xx status codes)
6. **Respect rate limits** - Implement exponential backoff when rate limited
7. **Validate input client-side** - Reduce unnecessary API calls
8. **Use appropriate HTTP methods** - GET for reading, POST for creating, PATCH for updating, DELETE for deleting

## Support

For API support and questions:
- Email: support@handygh.com
- Documentation: http://localhost:8000/api/docs/
- GitHub Issues: [Repository URL]
