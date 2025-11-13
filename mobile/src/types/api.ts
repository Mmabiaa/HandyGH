/**
 * API Response Types
 */

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Authentication Types
 */

export interface OTPRequestData {
  phone: string;
}

export interface OTPVerifyData {
  phone: string;
  otp: string;
  name?: string;
  email?: string;
  role?: 'CUSTOMER' | 'PROVIDER';
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

/**
 * User Types
 */

export interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Provider Types
 */

export interface Provider {
  id: string;
  user: User;
  business_name: string;
  description?: string;
  categories: string[];
  latitude: number;
  longitude: number;
  address: string;
  verified: boolean;
  is_active: boolean;
  rating_avg: string;
  rating_count: number;
  services: ProviderService[];
  distance?: number;
  min_price?: string;
  created_at: string;
  updated_at: string;
}

export interface ProviderService {
  id: string;
  provider: string;
  category: ServiceCategory;
  title: string;
  description: string;
  price_type: 'FIXED' | 'HOURLY';
  price_amount: string;
  duration_estimate_min?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  is_active: boolean;
}

/**
 * Booking Types
 */

export interface Booking {
  id: string;
  booking_ref: string;
  customer: User;
  provider: Provider;
  provider_service: ProviderService;
  status: BookingStatus;
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string;
  actual_end?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  total_amount: string;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export type BookingStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

/**
 * Payment Types
 */

export interface Transaction {
  id: string;
  booking: string;
  transaction_ref: string;
  payment_method: 'MOMO' | 'CASH' | 'CARD';
  amount: string;
  commission_amount: string;
  provider_amount: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  payment_phone?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Review Types
 */

export interface Review {
  id: string;
  booking: string;
  provider: string;
  customer: User;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Message Types
 */

export interface Message {
  id: string;
  booking: string;
  sender: User;
  content: string;
  attachments?: string[];
  is_read: boolean;
  created_at: string;
}

/**
 * Dispute Types
 */

export interface Dispute {
  id: string;
  booking: Booking;
  raised_by: User;
  reason: DisputeReason;
  description: string;
  evidence?: Record<string, any>;
  status: DisputeStatus;
  resolution?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export type DisputeReason =
  | 'QUALITY'
  | 'INCOMPLETE'
  | 'PRICING'
  | 'BEHAVIOR'
  | 'NO_SHOW'
  | 'OTHER';

export type DisputeStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';

/**
 * Search/Filter Types
 */

export interface ProviderSearchParams {
  category?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  min_rating?: number;
  verified_only?: boolean;
  min_price?: number;
  max_price?: number;
  sort_by?: 'rating' | 'distance' | 'price';
  page?: number;
  page_size?: number;
}

export interface BookingFilterParams {
  status?: BookingStatus;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}
