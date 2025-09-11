-- Location: supabase/migrations/20250911003026_handygh_service_platform.sql
-- Schema Analysis: Fresh project - no existing schema
-- Integration Type: Complete new schema
-- Dependencies: None - creating complete service booking platform

-- 1. Create custom types first
CREATE TYPE public.user_role AS ENUM ('customer', 'provider', 'admin');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'pending', 'suspended');
CREATE TYPE public.service_status AS ENUM ('active', 'inactive', 'draft');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

-- 2. User profiles table (extends auth.users)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    user_type public.user_role NOT NULL DEFAULT 'customer'::public.user_role,
    status public.user_status DEFAULT 'active'::public.user_status,
    profile_picture_url TEXT,
    stripe_customer_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Provider profiles table (additional info for providers)
CREATE TABLE public.provider_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_description TEXT,
    experience_years INTEGER DEFAULT 0,
    service_radius INTEGER DEFAULT 10, -- kilometers
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 4. Service categories table
CREATE TABLE public.service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT, -- For UI icons
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Services table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GHS',
    duration_minutes INTEGER DEFAULT 60,
    status public.service_status DEFAULT 'draft'::public.service_status,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Service bookings table
CREATE TABLE public.service_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    booking_number TEXT UNIQUE NOT NULL,
    
    -- Booking details
    service_name TEXT NOT NULL, -- Store service name at booking time
    service_description TEXT,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    
    -- Location details
    service_address JSONB NOT NULL,
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    additional_charges DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GHS',
    
    -- Status and tracking
    status public.booking_status DEFAULT 'pending'::public.booking_status,
    payment_status public.payment_status DEFAULT 'pending'::public.payment_status,
    payment_intent_id TEXT,
    
    -- Additional information
    special_instructions TEXT,
    customer_notes TEXT,
    provider_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

-- 7. Payment transactions table
CREATE TABLE public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.service_bookings(id) ON DELETE CASCADE,
    payment_intent_id TEXT,
    stripe_charge_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'GHS',
    status public.payment_status NOT NULL,
    transaction_type TEXT DEFAULT 'payment' CHECK (transaction_type IN ('payment', 'refund')),
    gateway TEXT DEFAULT 'stripe',
    gateway_transaction_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Reviews and ratings table
CREATE TABLE public.service_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.service_bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(booking_id) -- One review per booking
);

-- 9. Create indexes for better performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_user_type ON public.user_profiles(user_type);
CREATE INDEX idx_provider_profiles_user_id ON public.provider_profiles(user_id);
CREATE INDEX idx_services_provider_id ON public.services(provider_id);
CREATE INDEX idx_services_category_id ON public.services(category_id);
CREATE INDEX idx_service_bookings_customer_id ON public.service_bookings(customer_id);
CREATE INDEX idx_service_bookings_provider_id ON public.service_bookings(provider_id);
CREATE INDEX idx_service_bookings_scheduled_date ON public.service_bookings(scheduled_date);
CREATE INDEX idx_service_bookings_status ON public.service_bookings(status);
CREATE INDEX idx_payment_transactions_booking_id ON public.payment_transactions(booking_id);
CREATE INDEX idx_service_reviews_provider_id ON public.service_reviews(provider_id);

-- 10. Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;

-- 11. Create helper functions BEFORE RLS policies
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

-- 12. RLS Policies using safe patterns

-- Pattern 1: Core user table (user_profiles) - Simple only, no functions
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin access to user profiles
CREATE POLICY "admin_full_access_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Pattern 2: Simple user ownership for provider profiles
CREATE POLICY "users_manage_own_provider_profiles"
ON public.provider_profiles
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admin access to provider profiles
CREATE POLICY "admin_full_access_provider_profiles"
ON public.provider_profiles
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Pattern 4: Public read, private write for service categories
CREATE POLICY "public_can_read_service_categories"
ON public.service_categories
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_service_categories"
ON public.service_categories
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Services - providers manage their own, customers can read active ones
CREATE POLICY "providers_manage_own_services"
ON public.services
FOR ALL
TO authenticated
USING (
    provider_id IN (
        SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    provider_id IN (
        SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "customers_can_read_active_services"
ON public.services
FOR SELECT
TO authenticated
USING (status = 'active'::public.service_status);

CREATE POLICY "admin_full_access_services"
ON public.services
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Service bookings - customers and providers can see their own bookings
CREATE POLICY "customers_manage_own_bookings"
ON public.service_bookings
FOR ALL
TO authenticated
USING (customer_id = auth.uid())
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "providers_view_their_bookings"
ON public.service_bookings
FOR SELECT
TO authenticated
USING (
    provider_id IN (
        SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "providers_update_their_bookings"
ON public.service_bookings
FOR UPDATE
TO authenticated
USING (
    provider_id IN (
        SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    provider_id IN (
        SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "admin_full_access_service_bookings"
ON public.service_bookings
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Payment transactions - users can see their own transactions
CREATE POLICY "users_view_own_payment_transactions"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (
    booking_id IN (
        SELECT id FROM public.service_bookings 
        WHERE customer_id = auth.uid() 
        OR provider_id IN (
            SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "admin_full_access_payment_transactions"
ON public.payment_transactions
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Service reviews - customers write reviews, everyone can read
CREATE POLICY "customers_manage_own_reviews"
ON public.service_reviews
FOR ALL
TO authenticated
USING (customer_id = auth.uid())
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "public_can_read_reviews"
ON public.service_reviews
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_full_access_reviews"
ON public.service_reviews
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- 13. Create trigger function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name, user_type)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer')::public.user_role
  );
  RETURN NEW;
END;
$$;

-- 14. Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 15. Insert sample service categories
INSERT INTO public.service_categories (name, description, icon_name, sort_order) VALUES
('Plumbing', 'Plumbing repairs and installations', 'Wrench', 1),
('Electrical', 'Electrical repairs and installations', 'Zap', 2),
('Cleaning', 'Home and office cleaning services', 'Sparkles', 3),
('Carpentry', 'Wood work and furniture repair', 'Hammer', 4),
('Painting', 'Interior and exterior painting', 'Paintbrush', 5),
('Appliance Repair', 'Home appliance repair and maintenance', 'Settings', 6),
('HVAC', 'Heating, ventilation, and air conditioning', 'Wind', 7),
('Gardening', 'Landscaping and garden maintenance', 'TreePine', 8),
('Moving', 'Moving and transportation services', 'Truck', 9),
('General Handyman', 'General maintenance and repair work', 'Wrench', 10);

-- 16. Complete Mock Data with auth.users creation
DO $$
DECLARE
    customer_uuid UUID := gen_random_uuid();
    provider_uuid UUID := gen_random_uuid();
    admin_uuid UUID := gen_random_uuid();
    provider_profile_id UUID;
    plumbing_category_id UUID;
    electrical_category_id UUID;
    cleaning_category_id UUID;
    service1_id UUID;
    service2_id UUID;
    booking_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (customer_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'customer@handygh.com', crypt('customer123', gen_salt('bf', 10)), now(), now(), now(),
         '{"first_name": "John", "last_name": "Doe", "user_type": "customer"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (provider_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'provider@handygh.com', crypt('provider123', gen_salt('bf', 10)), now(), now(), now(),
         '{"first_name": "Samuel", "last_name": "Asante", "user_type": "provider"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '+233241234567', '', '', null),
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@handygh.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"first_name": "Admin", "last_name": "User", "user_type": "admin"}'::jsonb, 
         '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Get category IDs for services
    SELECT id INTO plumbing_category_id FROM public.service_categories WHERE name = 'Plumbing';
    SELECT id INTO electrical_category_id FROM public.service_categories WHERE name = 'Electrical';
    SELECT id INTO cleaning_category_id FROM public.service_categories WHERE name = 'Cleaning';

    -- Create provider profile
    INSERT INTO public.provider_profiles (id, user_id, business_name, business_description, experience_years, rating, total_reviews, verification_status)
    VALUES (
        gen_random_uuid(),
        provider_uuid,
        'Asante Plumbing & Electrical',
        'Professional plumbing and electrical services in Accra. Over 10 years of experience in residential and commercial projects.',
        10,
        4.8,
        127,
        'verified'
    ) RETURNING id INTO provider_profile_id;

    -- Create sample services
    INSERT INTO public.services (id, provider_id, category_id, name, description, base_price, duration_minutes, status)
    VALUES 
        (gen_random_uuid(), provider_profile_id, plumbing_category_id, 'Pipe Repair & Installation', 'Professional pipe repair and new installation services', 150.00, 120, 'active'::public.service_status),
        (gen_random_uuid(), provider_profile_id, electrical_category_id, 'Electrical Wiring & Fixtures', 'Complete electrical wiring and fixture installation', 200.00, 180, 'active'::public.service_status),
        (gen_random_uuid(), provider_profile_id, cleaning_category_id, 'Deep Home Cleaning', 'Comprehensive deep cleaning for homes and apartments', 80.00, 180, 'active'::public.service_status)
    RETURNING id INTO service1_id;

    -- Create a sample booking
    INSERT INTO public.service_bookings (
        id, customer_id, provider_id, service_id, booking_number,
        service_name, service_description, scheduled_date, scheduled_time,
        service_address, base_price, total_amount, status, special_instructions
    )
    VALUES (
        booking_uuid,
        customer_uuid,
        provider_profile_id,
        service1_id,
        'BK-2025-' || LPAD((EXTRACT(epoch FROM NOW())::INTEGER % 100000)::TEXT, 5, '0'),
        'Pipe Repair & Installation',
        'Professional pipe repair and new installation services',
        CURRENT_DATE + INTERVAL '3 days',
        '14:00:00'::TIME,
        '{"address": "123 Liberation Road", "city": "Accra", "region": "Greater Accra", "landmark": "Near Osu Castle"}'::JSONB,
        150.00,
        150.00,
        'confirmed'::public.booking_status,
        'Kitchen sink pipe needs repair. Please bring necessary tools.'
    );

    -- Create sample review
    INSERT INTO public.service_reviews (booking_id, customer_id, provider_id, service_id, rating, review_text)
    VALUES (
        booking_uuid,
        customer_uuid,
        provider_profile_id,
        service1_id,
        5,
        'Excellent service! Samuel arrived on time and fixed the pipe quickly. Very professional and cleaned up after the work. Highly recommended!'
    );

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;