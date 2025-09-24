import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database connection configuration
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'handygh',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },
};

// Supabase RLS (Row Level Security) policies
export const rlsPolicies = {
  users: `
    -- Users can only see their own data
    CREATE POLICY "Users can view own profile" ON users
      FOR SELECT USING (auth.uid()::text = id);
    
    -- Users can update their own profile
    CREATE POLICY "Users can update own profile" ON users
      FOR UPDATE USING (auth.uid()::text = id);
  `,
  
  providers: `
    -- Providers can view their own profile
    CREATE POLICY "Providers can view own profile" ON providers
      FOR SELECT USING (auth.uid()::text = user_id);
    
    -- Providers can update their own profile
    CREATE POLICY "Providers can update own profile" ON providers
      FOR UPDATE USING (auth.uid()::text = user_id);
  `,
  
  bookings: `
    -- Users can view bookings they're involved in
    CREATE POLICY "Users can view own bookings" ON bookings
      FOR SELECT USING (
        auth.uid()::text = customer_id OR 
        auth.uid()::text = (SELECT user_id FROM providers WHERE id = provider_id)
      );
    
    -- Customers can create bookings
    CREATE POLICY "Customers can create bookings" ON bookings
      FOR INSERT WITH CHECK (auth.uid()::text = customer_id);
    
    -- Providers can update bookings they're assigned to
    CREATE POLICY "Providers can update assigned bookings" ON bookings
      FOR UPDATE USING (
        auth.uid()::text = (SELECT user_id FROM providers WHERE id = provider_id)
      );
  `,
  
  messages: `
    -- Users can view messages from their bookings
    CREATE POLICY "Users can view booking messages" ON messages
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM bookings 
          WHERE id = messages.booking_id 
          AND (customer_id = auth.uid()::text OR 
               provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()::text))
        )
      );
    
    -- Users can send messages to their bookings
    CREATE POLICY "Users can send booking messages" ON messages
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM bookings 
          WHERE id = messages.booking_id 
          AND (customer_id = auth.uid()::text OR 
               provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()::text))
        )
      );
  `,
  
  transactions: `
    -- Users can view their own transactions
    CREATE POLICY "Users can view own transactions" ON transactions
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM bookings 
          WHERE id = transactions.booking_id 
          AND (customer_id = auth.uid()::text OR 
               provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()::text))
        )
      );
  `,
  
  disputes: `
    -- Users can view disputes for their bookings
    CREATE POLICY "Users can view own disputes" ON disputes
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM bookings 
          WHERE id = disputes.booking_id 
          AND (customer_id = auth.uid()::text OR 
               provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()::text))
        )
      );
    
    -- Users can create disputes for their bookings
    CREATE POLICY "Users can create disputes" ON disputes
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM bookings 
          WHERE id = disputes.booking_id 
          AND (customer_id = auth.uid()::text OR 
               provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()::text))
        )
      );
  `
};

// Database initialization function
export async function initializeDatabase() {
  try {
    // Enable RLS on all tables
    const tables = ['users', 'providers', 'bookings', 'messages', 'transactions', 'disputes', 'reviews'];
    
    for (const table of tables) {
      await supabase.rpc('enable_rls', { table_name: table });
    }
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
