# HandyGH Backend API

A comprehensive backend API for the HandyGH marketplace platform, built with Node.js, Express, TypeScript, and PostgreSQL.

## 🚀 Features

### Core Functionality
- **User Management**: Customer, Provider, and Admin roles with OTP-based authentication
- **Service Discovery**: Advanced search and filtering with geolocation support
- **Booking System**: Complete booking workflow with status management
- **Payment Processing**: MTN MoMo integration with manual fallback
- **Messaging System**: In-app chat tied to bookings
- **Notification System**: Multi-channel notifications (email, SMS, push)
- **Dispute Resolution**: Comprehensive dispute management workflow
- **Admin Dashboard**: User management, transaction monitoring, and reporting
- **Audit Logging**: Tamper-evident logging for all critical actions

### Technical Features
- **Role-based Access Control**: Granular permissions for different user types
- **API Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive data validation with Zod
- **Error Handling**: Standardized error responses
- **Database Security**: Row Level Security (RLS) policies
- **Commission Management**: Automated commission calculation and payouts
- **Real-time Features**: WebSocket support for live updates

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd handygh-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Start PostgreSQL and Redis
   # Update DATABASE_URL in .env
   
   # Run database migrations
   npx prisma migrate deploy
   
   # Generate Prisma client
   npx prisma generate
   
   # Setup database with sample data
   node scripts/setup-database.js
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `REDIS_URL` | Redis connection string | - |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |

### Database Configuration

The application uses PostgreSQL with the following key features:
- **Row Level Security (RLS)** for data protection
- **Geospatial indexing** for location-based queries
- **Full-text search** capabilities
- **Audit logging** for compliance

### Supabase Integration

For cloud deployment, the application supports Supabase:
```bash
# Set Supabase credentials
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/otp/request` - Request OTP
- `POST /api/v1/auth/otp/verify` - Verify OTP
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - User logout

### Provider Endpoints
- `GET /api/v1/providers` - Search providers
- `GET /api/v1/providers/:id` - Get provider details
- `POST /api/v1/providers` - Create provider profile
- `PATCH /api/v1/providers/:id` - Update provider profile

### Booking Endpoints
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - Get user bookings
- `GET /api/v1/bookings/:id` - Get booking details
- `PATCH /api/v1/bookings/:id/accept` - Accept booking
- `PATCH /api/v1/bookings/:id/decline` - Decline booking
- `PATCH /api/v1/bookings/:id/status` - Update booking status

### Payment Endpoints
- `POST /api/v1/payments/momo/charge` - Initiate MoMo payment
- `POST /api/v1/payments/manual/confirm` - Manual payment confirmation
- `GET /api/v1/payments/history` - Payment history

### Messaging Endpoints
- `GET /api/v1/messages/bookings/:id/messages` - Get booking messages
- `POST /api/v1/messages/bookings/:id/messages` - Send message
- `PATCH /api/v1/messages/messages/:id` - Update message
- `DELETE /api/v1/messages/messages/:id` - Delete message

### Admin Endpoints
- `GET /api/v1/admin/dashboard` - Dashboard statistics
- `GET /api/v1/admin/users` - User management
- `GET /api/v1/admin/transactions` - Transaction management
- `GET /api/v1/admin/reports/export` - Export reports

### Dispute Endpoints
- `POST /api/v1/disputes` - Create dispute
- `GET /api/v1/disputes` - Get disputes (admin)
- `PATCH /api/v1/disputes/:id/resolve` - Resolve dispute

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- OTP verification for phone numbers
- Password hashing with bcrypt

### Data Protection
- Row Level Security (RLS) policies
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Audit & Compliance
- Comprehensive audit logging
- Tamper-evident log hashing
- User action tracking
- Data retention policies

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run all tests with coverage
npm run test:coverage
```

## 📊 Monitoring & Logging

### Logging
- Structured JSON logging
- Request/response logging
- Error tracking with Sentry
- Performance monitoring

### Metrics
- API response times
- Database query performance
- Error rates
- User activity metrics

## 🚀 Deployment

### Docker Deployment
```bash
# Build Docker image
docker build -t handygh-backend .

# Run with Docker Compose
docker-compose up -d
```

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Rate limiting configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### v1.0.0
- Initial release
- Core marketplace functionality
- Payment integration
- Admin dashboard
- Dispute resolution system