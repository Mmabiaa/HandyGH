# HandyGH API - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Start the Server

```bash
cd backend
python manage.py runserver
```

### 2. Access Documentation

Open in your browser:
- **Swagger UI:** http://localhost:8000/api/docs/
- **ReDoc:** http://localhost:8000/api/redoc/

### 3. Test Authentication Flow

#### Step 1: Request OTP
```bash
curl -X POST http://localhost:8000/api/v1/auth/otp/request/ \
  -H "Content-Type: application/json" \
  -d '{"phone": "+233241234567"}'
```

#### Step 2: Verify OTP (use the OTP from console/logs)
```bash
curl -X POST http://localhost:8000/api/v1/auth/otp/verify/ \
  -H "Content-Type: application/json" \
  -d '{"phone": "+233241234567", "otp": "123456"}'
```

Save the `access_token` from the response!

#### Step 3: Use the API
```bash
curl -X GET http://localhost:8000/api/v1/users/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📚 Common Endpoints

### Search Providers
```bash
GET /api/v1/providers/?category=plumber&latitude=5.6037&longitude=-0.1870&radius_km=5
```

### Create Booking
```bash
POST /api/v1/bookings/
{
  "provider_service_id": "uuid",
  "scheduled_start": "2025-01-20T10:00:00Z",
  "duration_hours": 2.0,
  "address": "123 Main St, Accra"
}
```

### Submit Review
```bash
POST /api/v1/bookings/{booking_id}/reviews/
{
  "rating": 5,
  "comment": "Excellent service!"
}
```

## 🔑 Authentication

All authenticated endpoints require:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Access tokens expire after 15 minutes. Use the refresh token to get a new one:
```bash
POST /api/v1/auth/token/refresh/
{
  "refresh_token": "YOUR_REFRESH_TOKEN"
}
```

## 📖 Full Documentation

- **Complete API Reference:** `backend/API_DOCUMENTATION.md`
- **Postman Collection:** `backend/HandyGH_API.postman_collection.json`
- **Implementation Summary:** `backend/API_DOCUMENTATION_SUMMARY.md`

## 🛠️ Tools

### Swagger UI (Interactive)
http://localhost:8000/api/docs/
- Try endpoints directly in browser
- See request/response schemas
- Test authentication

### Postman Collection
1. Import `HandyGH_API.postman_collection.json`
2. Run "Request OTP" → "Verify OTP"
3. Token is automatically saved
4. Explore 35 pre-configured requests

## ⚡ Quick Tips

1. **Phone Format:** Use `+233XXXXXXXXX` or `0XXXXXXXXX`
2. **OTP in Development:** Check console logs for OTP code
3. **Token Management:** Postman collection auto-saves tokens
4. **Error Messages:** All validation errors are clear and actionable
5. **Rate Limits:** 5 OTP requests per hour, 1000 API calls per hour

## 🎯 Next Steps

1. ✅ Test authentication flow
2. ✅ Create a provider profile
3. ✅ Search for providers
4. ✅ Create a booking
5. ✅ Process payment
6. ✅ Submit a review

Happy coding! 🚀
