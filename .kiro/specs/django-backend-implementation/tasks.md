# Implementation Plan - Django Backend for HandyGH

## Task List

- [-] 1. Project Setup and Core Infrastructure
  - Initialize Django project with proper structure
  - Configure settings for multiple environments (dev, test, prod)
  - Set up database configuration with SQLite for development
  - Configure Django REST Framework with JWT authentication
  - Set up logging and error handling middleware
  - _Requirements: 1.1, 1.2, 11.1, 11.4, 12.1_

- [x] 1.1 Create Django project structure
  - Create `backend/` directory with `handygh/` project
  - Set up `apps/` directory for modular applications
  - Create `core/` directory for shared utilities
  - Configure `settings/` package with base, development, production, and test settings
  - _Requirements: 13.1, 13.2_

- [ ] 1.2 Configure dependencies and requirements
  - Create `requirements/base.txt` with Django, DRF, and core dependencies
  - Create `requirements/development.txt` with dev tools (pytest, black, flake8)
  - Create `requirements/production.txt` with production dependencies (gunicorn, psycopg2)
  - Set up virtual environment and install dependencies
  - _Requirements: 13.1_

- [ ] 1.3 Set up environment configuration
  - Create `.env.example` with all required environment variables
  - Install python-decouple for environment variable management
  - Configure SECRET_KEY, DEBUG, DATABASE_URL, and JWT settings
  - _Requirements: 11.4, 11.5_

- [ ] 1.4 Configure Django REST Framework
  - Add DRF to INSTALLED_APPS
  - Configure authentication classes (JWT)
  - Set up default permission classes
  - Configure pagination and throttling
  - Set up exception handling
  - _Requirements: 11.1, 11.2, 11.3_

- [-] 2. Authentication System Implementation
  - Create authentication app with OTP and JWT functionality
  - Implement OTP generation, storage, and verification
  - Implement JWT token issuance and refresh mechanism
  - Add rate limiting for OTP requests
  - Create authentication API endpoints
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2.1 Create User model
  - Create custom User model extending AbstractBaseUser
  - Add fields: id (UUID), phone, email, name, role, is_active
  - Implement custom UserManager
  - Create and run migrations
  - _Requirements: 1.2, 2.1, 2.2, 13.1, 13.5_

- [-] 2.2 Implement OTP functionality
  - Create OTPToken model with phone, code_hash, expiry, attempts
  - Implement OTPService with generate_otp(), verify_otp(), check_rate_limit()
  - Add OTP hashing using bcrypt
  - Implement OTP expiration logic (10 minutes)
  - Add rate limiting (5 requests per hour per phone)
  - _Requirements: 1.1, 1.3, 1.4, 11.2_

- [ ] 2.3 Implement JWT token management
  - Create RefreshToken model to store refresh tokens
  - Implement JWTService with create_tokens(), refresh_tokens(), revoke_token()
  - Configure JWT settings (15min access, 7 days refresh)
  - Add token hashing before storage
  - _Requirements: 1.2, 1.5, 11.1, 11.3_

- [ ] 2.4 Create authentication API endpoints
  - POST /api/v1/auth/otp/request/ - Request OTP
  - POST /api/v1/auth/otp/verify/ - Verify OTP and issue tokens
  - POST /api/v1/auth/token/refresh/ - Refresh access token
  - POST /api/v1/auth/logout/ - Revoke refresh token
  - Add request/response serializers
  - _Requirements: 1.1, 1.2, 1.5_

- [ ] 2.5 Write authentication tests
  - Unit tests for OTPService (generation, verification, rate limiting)
  - Unit tests for JWTService (token creation, refresh, revocation)
  - Integration tests for OTP flow (request → verify → tokens)
  - API tests for all authentication endpoints
  - Test rate limiting and security constraints
  - _Requirements: 14.3, 14.4_

- [ ] 3. User Profile Management
  - Create users app for profile management
  - Implement user CRUD operations
  - Add role-based permissions
  - Create user profile API endpoints
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3.1 Create UserProfile model
  - Extend User model with additional profile fields
  - Add profile_picture_url, address, preferences
  - Create and run migrations
  - _Requirements: 2.1, 2.2, 13.1_

- [ ] 3.2 Implement UserService
  - Create UserService with CRUD operations
  - Add get_user(), update_user(), deactivate_user()
  - Implement role validation logic
  - _Requirements: 2.2, 2.3, 2.5_

- [ ] 3.3 Create user API endpoints
  - GET /api/v1/users/me/ - Get current user profile
  - PATCH /api/v1/users/me/ - Update current user profile
  - GET /api/v1/users/{id}/ - Get user by ID (admin only)
  - Add serializers with role-based field visibility
  - _Requirements: 2.1, 2.2, 2.4_

- [ ] 3.4 Implement custom permissions
  - Create IsCustomer, IsProvider, IsAdmin permission classes
  - Create IsOwnerOrAdmin permission class
  - Apply permissions to user endpoints
  - _Requirements: 2.5, 11.1_

- [ ] 3.5 Write user management tests
  - Unit tests for UserService methods
  - API tests for user endpoints with different roles
  - Test permission enforcement
  - _Requirements: 14.3, 14.4_

- [ ] 4. Provider Profile and Services
  - Create providers app for provider management
  - Implement provider profile CRUD
  - Add service management functionality
  - Implement provider search with filters
  - Create provider API endpoints
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 4.1 Create Provider and ProviderService models
  - Create Provider model with business_name, categories, location, verified, rating_avg
  - Create ProviderService model with title, description, price_type, price_amount
  - Create ServiceCategory model for categorization
  - Add proper foreign key relationships
  - Create and run migrations
  - _Requirements: 3.1, 3.2, 3.3, 13.1, 13.2, 13.3_

- [ ] 4.2 Implement ProviderService class
  - Create ProviderService with create_provider(), update_provider(), verify_provider()
  - Add validation for provider data
  - Implement provider verification logic
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 4.3 Implement ServiceManagementService
  - Create ServiceManagementService with CRUD for provider services
  - Add add_service(), update_service(), deactivate_service()
  - Implement service validation
  - _Requirements: 3.2, 3.3, 3.5_

- [ ] 4.4 Implement ProviderSearchService
  - Create search() method with category, location, radius, rating filters
  - Implement distance calculation using Haversine formula
  - Add sorting by rating, distance, price
  - Optimize queries with select_related and prefetch_related
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 4.5 Create provider API endpoints
  - POST /api/v1/providers/ - Create provider profile
  - GET /api/v1/providers/ - Search providers with filters
  - GET /api/v1/providers/{id}/ - Get provider details
  - PATCH /api/v1/providers/{id}/ - Update provider
  - POST /api/v1/providers/{id}/services/ - Add service
  - GET /api/v1/providers/{id}/services/ - List services
  - Add comprehensive serializers
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2_

- [ ] 4.6 Write provider tests
  - Unit tests for ProviderService and ServiceManagementService
  - Unit tests for search algorithm with various filters
  - API tests for all provider endpoints
  - Test distance calculation accuracy
  - _Requirements: 14.3, 14.4_

- [ ] 5. Booking System Implementation
  - Create bookings app for booking management
  - Implement booking creation with validation
  - Add availability checking logic
  - Implement booking status state machine
  - Create booking API endpoints
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 5.1 Create Booking model
  - Create Booking model with all required fields
  - Add status field with choices (REQUESTED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, DISPUTED)
  - Create BookingStatusHistory model for audit trail
  - Add indexes on status, scheduled_start, customer, provider
  - Create and run migrations
  - _Requirements: 5.1, 5.2, 13.1, 13.3, 13.4_

- [ ] 5.2 Implement AvailabilityService
  - Create check_availability() method
  - Implement conflict detection algorithm
  - Check for overlapping bookings with same provider
  - Use database transactions for race condition prevention
  - _Requirements: 5.4_

- [ ] 5.3 Implement BookingService
  - Create create_booking() with availability check
  - Add generate_booking_ref() for unique references
  - Implement validate_booking_data()
  - Add calculate_booking_amount()
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 5.4 Implement BookingStateMachine
  - Create state transition validation
  - Implement accept_booking(), decline_booking(), complete_booking()
  - Add status change logging to BookingStatusHistory
  - Validate allowed transitions
  - _Requirements: 5.3, 5.5_

- [ ] 5.5 Create booking API endpoints
  - POST /api/v1/bookings/ - Create booking
  - GET /api/v1/bookings/ - List bookings (filtered by role)
  - GET /api/v1/bookings/{id}/ - Get booking details
  - PATCH /api/v1/bookings/{id}/accept/ - Provider accepts
  - PATCH /api/v1/bookings/{id}/decline/ - Provider declines
  - PATCH /api/v1/bookings/{id}/status/ - Update status
  - Add role-based filtering and permissions
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 5.6 Write booking tests
  - Unit tests for AvailabilityService (conflict detection)
  - Unit tests for BookingService (creation, validation)
  - Unit tests for BookingStateMachine (state transitions)
  - API tests for all booking endpoints
  - Test concurrent booking scenarios
  - _Requirements: 14.3, 14.4_

- [ ] 6. Payment Processing System
  - Create payments app for transaction management
  - Implement payment initiation and processing
  - Add commission calculation
  - Create payment webhook handler
  - Implement manual payment confirmation
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 6.1 Create Transaction model
  - Create Transaction model with booking, amount, status, txn_provider
  - Add Commission model for configuration
  - Create indexes on booking_id, status, txn_provider
  - Create and run migrations
  - _Requirements: 6.1, 6.2, 13.1, 13.3_

- [ ] 6.2 Implement CommissionService
  - Create calculate_commission() method
  - Add get_commission_rate() with configurable rates
  - Implement commission calculation logic
  - _Requirements: 6.4_

- [ ] 6.3 Implement PaymentService
  - Create initiate_payment() method
  - Add process_payment_success(), process_payment_failure()
  - Implement transaction creation and status updates
  - Add idempotency checking for webhooks
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 6.4 Implement MoMoService (mock for development)
  - Create MoMoService interface
  - Implement MockMoMoService for development
  - Add charge() method that simulates payment
  - Prepare for real MTN MoMo integration
  - _Requirements: 6.1, 6.5_

- [ ] 6.5 Create payment API endpoints
  - POST /api/v1/payments/momo/charge/ - Initiate payment
  - POST /api/v1/payments/webhook/momo/ - Webhook handler
  - POST /api/v1/payments/manual/confirm/ - Manual confirmation
  - GET /api/v1/payments/transactions/ - List transactions
  - Add webhook signature verification
  - _Requirements: 6.1, 6.2, 6.5_

- [ ] 6.6 Write payment tests
  - Unit tests for CommissionService calculations
  - Unit tests for PaymentService methods
  - Unit tests for webhook idempotency
  - API tests for payment endpoints
  - Test payment flow integration with bookings
  - _Requirements: 14.3, 14.4_

- [ ] 7. Reviews and Ratings System
  - Create reviews app for rating management
  - Implement review creation and validation
  - Add rating aggregation logic
  - Create review API endpoints
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 7.1 Create Review model
  - Create Review model with booking, customer, provider, rating, comment
  - Add unique constraint on booking_id
  - Add check constraint for rating (1-5)
  - Create indexes
  - Create and run migrations
  - _Requirements: 7.1, 7.2, 7.5, 13.1, 13.5_

- [ ] 7.2 Implement ReviewService
  - Create create_review() with validation
  - Add validate_review_eligibility() (booking must be completed)
  - Implement prevent_duplicate_reviews()
  - _Requirements: 7.1, 7.2, 7.5_

- [ ] 7.3 Implement RatingAggregationService
  - Create update_provider_rating() method
  - Calculate average rating from all reviews
  - Update provider.rating_avg and provider.rating_count
  - Use database aggregation functions
  - _Requirements: 7.3_

- [ ] 7.4 Create review API endpoints
  - POST /api/v1/bookings/{id}/reviews/ - Submit review
  - GET /api/v1/providers/{id}/reviews/ - Get provider reviews
  - GET /api/v1/reviews/{id}/ - Get review details
  - Add pagination for review lists
  - _Requirements: 7.1, 7.4_

- [ ] 7.5 Write review tests
  - Unit tests for ReviewService validation
  - Unit tests for RatingAggregationService calculations
  - API tests for review endpoints
  - Test duplicate review prevention
  - Test rating aggregation accuracy
  - _Requirements: 14.3, 14.4_

- [ ] 8. Messaging System
  - Create messaging app for in-app chat
  - Implement message creation and retrieval
  - Add attachment support
  - Create messaging API endpoints
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 8.1 Create Message model
  - Create Message model with booking, sender, content, attachments
  - Add created_at timestamp
  - Create indexes on booking_id, sender_id, created_at
  - Create and run migrations
  - _Requirements: 8.1, 8.2, 13.1, 13.4_

- [ ] 8.2 Implement MessagingService
  - Create send_message() method
  - Add get_booking_messages() with pagination
  - Implement access control (only booking participants)
  - Add attachment URL validation
  - _Requirements: 8.1, 8.2, 8.4_

- [ ] 8.3 Create messaging API endpoints
  - POST /api/v1/bookings/{id}/messages/ - Send message
  - GET /api/v1/bookings/{id}/messages/ - Get messages
  - Add permission checks for booking participants
  - Implement pagination
  - _Requirements: 8.1, 8.2_

- [ ] 8.4 Write messaging tests
  - Unit tests for MessagingService
  - API tests for messaging endpoints
  - Test access control enforcement
  - Test message ordering
  - _Requirements: 14.3, 14.4_

- [ ] 9. Dispute Management System
  - Create disputes app for dispute handling
  - Implement dispute creation with evidence
  - Add dispute resolution workflow
  - Create dispute API endpoints
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 9.1 Create Dispute model
  - Create Dispute model with booking, reason, description, evidence, status
  - Add status choices (OPEN, INVESTIGATING, RESOLVED, CLOSED)
  - Add unique constraint on booking_id
  - Create indexes
  - Create and run migrations
  - _Requirements: 9.1, 9.2, 13.1, 13.5_

- [ ] 9.2 Implement DisputeService
  - Create create_dispute() method
  - Add validate_dispute_window() (within 7 days)
  - Implement add_evidence()
  - _Requirements: 9.1, 9.2_

- [ ] 9.3 Implement DisputeResolutionService
  - Create update_dispute_status() (admin only)
  - Add resolve_dispute() with resolution text
  - Implement close_dispute()
  - _Requirements: 9.3, 9.4_

- [ ] 9.4 Create dispute API endpoints
  - POST /api/v1/disputes/ - Create dispute
  - GET /api/v1/disputes/ - List disputes
  - GET /api/v1/disputes/{id}/ - Get dispute details
  - PATCH /api/v1/disputes/{id}/ - Update dispute (admin)
  - POST /api/v1/disputes/{id}/resolve/ - Resolve dispute (admin)
  - _Requirements: 9.1, 9.3_

- [ ] 9.5 Write dispute tests
  - Unit tests for DisputeService validation
  - Unit tests for DisputeResolutionService
  - API tests for dispute endpoints
  - Test admin-only operations
  - Test dispute window validation
  - _Requirements: 14.3, 14.4_

- [ ] 10. Admin Dashboard Operations
  - Create admin_dashboard app for admin functionality
  - Implement user moderation features
  - Add reporting and analytics
  - Create data export functionality
  - Create admin API endpoints
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 10.1 Implement AdminReportService
  - Create get_dashboard_stats() for overview
  - Add get_user_statistics()
  - Implement get_booking_statistics()
  - Add get_transaction_statistics()
  - _Requirements: 10.1, 10.4_

- [ ] 10.2 Implement UserModerationService
  - Create suspend_user() method
  - Add activate_user() method
  - Implement revoke_all_sessions()
  - _Requirements: 10.2_

- [ ] 10.3 Implement DataExportService
  - Create export_transactions_csv() method
  - Add export_bookings_csv()
  - Implement export_users_csv()
  - Add date range filtering
  - _Requirements: 10.4_

- [ ] 10.4 Create admin API endpoints
  - GET /api/v1/admin/dashboard/stats/ - Dashboard statistics
  - GET /api/v1/admin/users/ - List all users
  - PATCH /api/v1/admin/users/{id}/suspend/ - Suspend user
  - PATCH /api/v1/admin/users/{id}/activate/ - Activate user
  - GET /api/v1/admin/reports/transactions/ - Transaction report
  - GET /api/v1/admin/reports/bookings/ - Booking report
  - GET /api/v1/admin/export/csv/ - Export data
  - Add IsAdmin permission to all endpoints
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 10.5 Write admin tests
  - Unit tests for AdminReportService
  - Unit tests for UserModerationService
  - Unit tests for DataExportService
  - API tests for admin endpoints
  - Test admin permission enforcement
  - _Requirements: 14.3, 14.4_

- [ ] 11. API Documentation and Validation
  - Set up OpenAPI/Swagger documentation
  - Add comprehensive API documentation
  - Implement request/response validation
  - Create API usage examples
  - _Requirements: 12.1, 12.2, 12.3, 14.1, 14.2_

- [ ] 11.1 Configure drf-yasg for Swagger
  - Install and configure drf-yasg
  - Set up schema view with API info
  - Add Swagger UI at /api/docs/
  - Add ReDoc UI at /api/redoc/
  - _Requirements: 14.1_

- [ ] 11.2 Add API documentation to endpoints
  - Add docstrings to all ViewSets and APIViews
  - Use @swagger_auto_schema decorator for detailed docs
  - Document request/response schemas
  - Add example requests and responses
  - _Requirements: 14.1, 14.2_

- [ ] 11.3 Implement comprehensive validation
  - Add field-level validation in serializers
  - Implement custom validators for phone, email, etc.
  - Add business logic validation
  - Create clear error messages
  - _Requirements: 12.1, 12.2, 12.3_

- [ ] 11.4 Create API usage documentation
  - Write README with API overview
  - Document authentication flow
  - Add endpoint usage examples
  - Create Postman collection
  - _Requirements: 14.1, 14.2_

- [ ] 12. Testing and Quality Assurance
  - Set up pytest configuration
  - Create test fixtures and factories
  - Write comprehensive test suite
  - Set up code coverage reporting
  - Configure CI/CD for automated testing
  - _Requirements: 14.3, 14.4, 14.5_

- [ ] 12.1 Configure pytest and testing tools
  - Install pytest, pytest-django, pytest-cov
  - Create pytest.ini configuration
  - Set up test database configuration
  - Install factory_boy for test data
  - _Requirements: 14.3_

- [ ] 12.2 Create test fixtures and factories
  - Create UserFactory, ProviderFactory, BookingFactory
  - Add fixture files for common test data
  - Create helper functions for test setup
  - _Requirements: 14.3_

- [ ] 12.3 Run full test suite and achieve coverage goals
  - Run all unit tests
  - Run all integration tests
  - Run all API tests
  - Generate coverage report
  - Ensure ≥70% coverage for core business logic
  - _Requirements: 14.4, 14.5_

- [ ] 12.4 Set up code quality tools
  - Configure black for code formatting
  - Set up flake8 for linting
  - Configure isort for import sorting
  - Add pre-commit hooks
  - _Requirements: 14.5_

- [ ] 13. Deployment Preparation
  - Configure production settings
  - Set up database migrations
  - Create deployment documentation
  - Configure WSGI/ASGI server
  - Set up static file handling
  - _Requirements: 11.4, 11.5, 13.4_

- [ ] 13.1 Configure production settings
  - Create production.py settings file
  - Configure PostgreSQL database
  - Set up environment variables
  - Configure ALLOWED_HOSTS
  - Add security settings (SECURE_SSL_REDIRECT, etc.)
  - _Requirements: 11.4, 11.5_

- [ ] 13.2 Set up Gunicorn configuration
  - Install gunicorn
  - Create gunicorn_config.py
  - Configure workers and threads
  - Set up logging
  - _Requirements: 13.4_

- [ ] 13.3 Configure static and media files
  - Set up STATIC_ROOT and MEDIA_ROOT
  - Configure whitenoise for static files
  - Document media file handling
  - _Requirements: 13.4_

- [ ] 13.4 Create deployment documentation
  - Write deployment guide
  - Document environment variables
  - Add database migration instructions
  - Create troubleshooting guide
  - _Requirements: 14.1_

- [ ] 14. Final Integration and Documentation
  - Integrate all components
  - Perform end-to-end testing
  - Create comprehensive README
  - Document API endpoints
  - Create developer onboarding guide
  - _Requirements: 14.1, 14.2, 14.5_

- [ ] 14.1 Perform end-to-end integration testing
  - Test complete user flows (signup → booking → payment → review)
  - Test provider flows (registration → service creation → booking acceptance)
  - Test admin flows (user moderation → dispute resolution)
  - Verify all integrations work together
  - _Requirements: 14.4_

- [ ] 14.2 Create comprehensive README
  - Write project overview
  - Add installation instructions
  - Document development setup
  - Add API documentation links
  - Include troubleshooting section
  - _Requirements: 14.1_

- [ ] 14.3 Create developer onboarding guide
  - Document project structure
  - Explain architecture decisions
  - Add code style guidelines
  - Include testing guidelines
  - Document contribution workflow
  - _Requirements: 14.1, 14.2_

- [ ] 14.4 Final code review and cleanup
  - Review all code for consistency
  - Remove debug code and comments
  - Ensure all tests pass
  - Verify code coverage meets goals
  - Check for security vulnerabilities
  - _Requirements: 14.5_
