
# HandyGH - Local Services Marketplace

A trustworthy, mobile-first web platform that connects customers with local service providers in Ghana.

## Features

- **User Management**: OTP-based authentication, role-based access (customer/provider/admin)
- **Provider Services**: Service listing, geospatial search, ratings and reviews
- **Booking System**: Real-time booking management with status tracking
- **Payment Integration**: MTN MoMo integration with manual fallback
- **Messaging**: In-app chat for bookings
- **Admin Dashboard**: User management, transaction monitoring, dispute resolution

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis, BullMQ
- **Authentication**: JWT with OTP verification
- **Payments**: MTN MoMo API
- **File Storage**: AWS S3
- **Testing**: Jest, Supertest

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd handygh-marketplace
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

4. Set up the database:
\`\`\`bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Open Prisma Studio
npm run db:studio
\`\`\`

5. Start the development servers:

Backend (API):
\`\`\`bash
cd backend
npm run dev
\`\`\`

Frontend (Next.js):
\`\`\`bash
npm run dev
\`\`\`

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api-docs

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── providers/         # Provider pages
│   └── admin/             # Admin panel
├── backend/               # Express.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript types
├── components/            # React components
├── lib/                   # Shared utilities
├── prisma/               # Database schema and migrations
└── tests/                # Test files
\`\`\`

## API Documentation

The API follows RESTful conventions and includes:

- **Authentication**: `/api/v1/auth/*`
- **Users**: `/api/v1/users/*`
- **Providers**: `/api/v1/providers/*`
- **Bookings**: `/api/v1/bookings/*`
- **Payments**: `/api/v1/payments/*`
- **Messages**: `/api/v1/messages/*`
- **Reviews**: `/api/v1/reviews/*`
- **Admin**: `/api/v1/admin/*`

Full API documentation is available at `/api-docs` when running the development server.

## Development Roadmap

### Phase 1: MVP (Weeks 1-8)
- [x] Project setup and database schema
- [ ] Authentication system with OTP
- [ ] Provider management and search
- [ ] Booking system
- [ ] Payment integration (MTN MoMo)
- [ ] Messaging and reviews
- [ ] Admin dashboard
- [ ] Testing and security

### Phase 2: Enhancement (Post-MVP)
- [ ] Mobile apps (React Native)
- [ ] Multi-region support
- [ ] Advanced analytics
- [ ] Additional payment methods
- [ ] Recurring bookings

## Testing

Run tests:
\`\`\`bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
\`\`\`

## Deployment

The application is designed for deployment on:
- **Frontend**: Vercel
- **Backend**: Railway/Render
- **Database**: PostgreSQL (managed service)
- **Cache**: Redis (managed service)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.
