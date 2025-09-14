# HandyGH Backend Integration Setup Guide

This guide will help you set up the backend to match the database schema and integrate it with the frontend.

## 🗄️ Database Setup

### 1. Create PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U your_username

# Create database
CREATE DATABASE handygh_db;

# Connect to the database
\c handygh_db;

# Run the schema
\i database_schema.sql
```

### 2. Environment Variables
Create a `.env` file in `handygh-backend/` with:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/handygh_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRATION="15m"

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:5173"

# Redis (for OTP storage)
REDIS_URL="redis://localhost:6379"

# AWS S3 (optional)
S3_ACCESS_KEY="your-s3-access-key"
S3_SECRET_KEY="your-s3-secret-key"
S3_REGION="us-east-1"
S3_BUCKET="handygh-uploads"
```

## 🔧 Backend Setup

### 1. Install Dependencies
```bash
cd handygh-backend
npm install
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Run Database Migrations
```bash
npx prisma db push
```

### 4. Start the Backend Server
```bash
npm run dev
```

The backend will be available at `http://localhost:3000`

## 🧪 Testing the Integration

### 1. Run Integration Test
```bash
cd handygh-backend
node test-integration.js
```

### 2. Test API Endpoints
```bash
# Test registration
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "customer",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+233241234567",
    "password": "TestPassword123!"
  }'

# Test login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "TestPassword123!"
  }'
```

## 🎨 Frontend Integration

### 1. Update Environment Variables
In `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:4001
```

### 2. Start Frontend
```bash
cd frontend
npm start
```

The frontend will be available at `http://localhost:5173`

## 🔄 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh tokens
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/otp/request` - Request OTP
- `POST /api/v1/auth/otp/verify` - Verify OTP

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

### Providers
- `GET /api/v1/providers` - Get all providers
- `GET /api/v1/providers/:id` - Get provider by ID
- `POST /api/v1/providers` - Create provider profile

### Bookings
- `GET /api/v1/bookings` - Get user bookings
- `POST /api/v1/bookings` - Create booking
- `PUT /api/v1/bookings/:id/status` - Update booking status

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check if PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **JWT_SECRET Error**
   - Make sure JWT_SECRET is set in .env
   - Use a strong, random secret key

3. **CORS Errors**
   - Check CORS_ORIGIN in backend .env
   - Ensure frontend URL matches

4. **Prisma Client Error**
   - Run `npx prisma generate`
   - Check if schema.prisma is valid

5. **Port Already in Use**
   - Change PORT in backend .env
   - Kill existing processes on port 3000

### Database Schema Verification

The backend now uses snake_case field names to match the database schema:
- `password_hash` instead of `passwordHash`
- `user_id` instead of `userId`
- `created_at` instead of `createdAt`
- `updated_at` instead of `updatedAt`

## 🚀 Production Deployment

### 1. Environment Variables
Set production environment variables:
- Use strong JWT secrets
- Configure production database URL
- Set up Redis for production
- Configure AWS S3 for file storage

### 2. Database
- Run migrations: `npx prisma migrate deploy`
- Set up database backups
- Configure connection pooling

### 3. Security
- Enable HTTPS
- Configure CORS properly
- Set up rate limiting
- Use environment-specific secrets

## 📊 Monitoring

### 1. Logs
- Backend logs are available in console
- Use Winston for structured logging
- Monitor error rates

### 2. Health Checks
- Implement health check endpoints
- Monitor database connectivity
- Check Redis connectivity

## 🎯 Next Steps

1. **Complete API Implementation**
   - Implement all booking endpoints
   - Add payment processing
   - Set up real-time messaging

2. **Frontend Integration**
   - Test all forms and flows
   - Implement error handling
   - Add loading states

3. **Testing**
   - Write unit tests
   - Add integration tests
   - Set up CI/CD pipeline

4. **Documentation**
   - Complete API documentation
   - Add Swagger/OpenAPI specs
   - Create user guides

---

## ✅ Verification Checklist

- [ ] Database created and schema applied
- [ ] Backend environment variables configured
- [ ] Backend server running on port 3000
- [ ] Frontend environment variables updated
- [ ] Frontend running on port 5173
- [ ] Registration endpoint working
- [ ] Login endpoint working
- [ ] JWT authentication functional
- [ ] Frontend can communicate with backend
- [ ] No CORS errors
- [ ] Database operations working

Once all items are checked, your HandyGH application should be fully integrated and functional! 🎉
