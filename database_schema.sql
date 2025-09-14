-- HandyGH Database Schema
-- PostgreSQL Database Creation Script
-- This script creates all tables, indexes, and constraints for the HandyGH application

-- Create database (run this first if creating a new database)
-- CREATE DATABASE handygh_db;

-- Connect to the database
-- \c handygh_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (enums)
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'PROVIDER', 'ADMIN');
CREATE TYPE price_type AS ENUM ('HOURLY', 'FIXED');
CREATE TYPE booking_status AS ENUM ('REQUESTED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE transaction_status AS ENUM ('INITIATED', 'SUCCESS', 'FAILED', 'REFUNDED');
CREATE TYPE dispute_status AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED');

-- Create users table
CREATE TABLE users (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'cuid_' || substr(md5(random()::text), 1, 20),
    role user_role DEFAULT 'CUSTOMER',
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create providers table
CREATE TABLE providers (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'cuid_' || substr(md5(random()::text), 1, 20),
    user_id VARCHAR(25) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255),
    categories TEXT[],
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    verified BOOLEAN DEFAULT false,
    verification_doc_url TEXT,
    rating_avg DECIMAL(3, 2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create provider_services table
CREATE TABLE provider_services (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'cuid_' || substr(md5(random()::text), 1, 20),
    provider_id VARCHAR(25) NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price_type price_type NOT NULL,
    price_amount DECIMAL(12, 2) NOT NULL,
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'cuid_' || substr(md5(random()::text), 1, 20),
    booking_ref VARCHAR(50) UNIQUE NOT NULL DEFAULT 'BK_' || substr(md5(random()::text), 1, 10),
    customer_id VARCHAR(25) NOT NULL REFERENCES users(id),
    provider_id VARCHAR(25) NOT NULL REFERENCES providers(id),
    provider_service_id VARCHAR(25) NOT NULL REFERENCES provider_services(id),
    status booking_status DEFAULT 'REQUESTED',
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    address TEXT NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    commission_amount DECIMAL(12, 2),
    payment_status payment_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE transactions (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'cuid_' || substr(md5(random()::text), 1, 20),
    booking_id VARCHAR(25) NOT NULL REFERENCES bookings(id),
    txn_provider VARCHAR(100), -- MTN MoMo transaction ID
    payer_id VARCHAR(25),
    payee_id VARCHAR(25),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GHS',
    status transaction_status DEFAULT 'INITIATED',
    metadata JSONB, -- Store provider-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'cuid_' || substr(md5(random()::text), 1, 20),
    booking_id VARCHAR(25) UNIQUE NOT NULL REFERENCES bookings(id),
    customer_id VARCHAR(25) NOT NULL REFERENCES users(id),
    provider_id VARCHAR(25) NOT NULL REFERENCES providers(id),
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'cuid_' || substr(md5(random()::text), 1, 20),
    booking_id VARCHAR(25) NOT NULL REFERENCES bookings(id),
    sender_id VARCHAR(25) NOT NULL,
    content TEXT NOT NULL,
    attachments TEXT[], -- URLs to uploaded files
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create disputes table
CREATE TABLE disputes (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'cuid_' || substr(md5(random()::text), 1, 20),
    booking_id VARCHAR(25) UNIQUE NOT NULL REFERENCES bookings(id),
    reason VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    evidence TEXT[], -- URLs to uploaded evidence
    status dispute_status DEFAULT 'OPEN',
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create refresh_tokens table
CREATE TABLE refresh_tokens (
    id VARCHAR(25) PRIMARY KEY DEFAULT 'cuid_' || substr(md5(random()::text), 1, 20),
    user_id VARCHAR(25) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_providers_verified ON providers(verified);
CREATE INDEX idx_providers_rating_avg ON providers(rating_avg);
CREATE INDEX idx_providers_categories ON providers USING GIN(categories);
CREATE INDEX idx_providers_location ON providers(latitude, longitude);

CREATE INDEX idx_provider_services_provider_id ON provider_services(provider_id);
CREATE INDEX idx_provider_services_is_active ON provider_services(is_active);
CREATE INDEX idx_provider_services_price_type ON provider_services(price_type);

CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_scheduled_start ON bookings(scheduled_start);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_booking_ref ON bookings(booking_ref);

CREATE INDEX idx_transactions_booking_id ON transactions(booking_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_txn_provider ON transactions(txn_provider);

CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

CREATE INDEX idx_messages_booking_id ON messages(booking_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_disputes_booking_id ON disputes(booking_id);
CREATE INDEX idx_disputes_status ON disputes(status);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update provider rating when review is added
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE providers 
    SET 
        rating_avg = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM reviews 
            WHERE provider_id = NEW.provider_id
        ),
        rating_count = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE provider_id = NEW.provider_id
        )
    WHERE id = NEW.provider_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_provider_rating_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

-- Insert sample data (optional - for testing)
INSERT INTO users (id, role, name, email, phone, password_hash) VALUES
('user_1', 'CUSTOMER', 'John Doe', 'john@example.com', '+233241234567', '$2b$10$example_hash'),
('user_2', 'PROVIDER', 'Jane Smith', 'jane@example.com', '+233241234568', '$2b$10$example_hash'),
('user_3', 'ADMIN', 'Admin User', 'admin@handygh.com', '+233241234569', '$2b$10$example_hash');

INSERT INTO providers (id, user_id, business_name, categories, address, verified, rating_avg, rating_count) VALUES
('provider_1', 'user_2', 'Elite Cleaners', ARRAY['Cleaning', 'Home Services'], 'Accra, Ghana', true, 4.9, 124);

INSERT INTO provider_services (id, provider_id, title, description, price_type, price_amount, duration_minutes) VALUES
('service_1', 'provider_1', 'House Cleaning', 'Complete house cleaning service', 'FIXED', 150.00, 120),
('service_2', 'provider_1', 'Office Cleaning', 'Professional office cleaning', 'HOURLY', 25.00, 60);

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO handygh_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO handygh_user;

-- Comments for documentation
COMMENT ON TABLE users IS 'Main user table storing customer, provider, and admin accounts';
COMMENT ON TABLE providers IS 'Provider profiles linked to users with business information';
COMMENT ON TABLE provider_services IS 'Services offered by providers with pricing';
COMMENT ON TABLE bookings IS 'Service bookings between customers and providers';
COMMENT ON TABLE transactions IS 'Payment transactions for bookings';
COMMENT ON TABLE reviews IS 'Customer reviews and ratings for completed bookings';
COMMENT ON TABLE messages IS 'Communication between customers and providers';
COMMENT ON TABLE disputes IS 'Dispute resolution for problematic bookings';
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for user authentication';

-- End of schema
