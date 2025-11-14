// Common types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  address: string;
  city: string;
  region: string;
  coordinates: Coordinates;
  placeId?: string;
}

// Auth types
export interface OTPRequest {
  phoneNumber: string;
}

export interface OTPResponse {
  message: string;
  phoneNumber: string;
}

export interface OTPVerifyRequest {
  phoneNumber: string;
  code: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    email?: string;
    role: 'customer' | 'provider';
    isVerified: boolean;
  };
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
  refresh?: string;
}

// Provider types
export interface ProviderQueryParams {
  category?: string;
  search?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  minRating?: number;
  page?: number;
  pageSize?: number;
}

export interface Provider {
  id: string;
  businessName: string;
  businessDescription: string;
  profilePhoto?: string;
  coverPhoto?: string;
  categories: string[];
  rating: number;
  totalReviews: number;
  totalServices: number;
  responseRate: number;
  responseTime: number;
  isVerified: boolean;
  serviceArea: ServiceArea;
  availability: Availability;
}

export interface ServiceArea {
  type: 'radius' | 'regions';
  center?: Coordinates;
  radius?: number;
  regions?: string[];
}

export interface Availability {
  schedule: WeeklySchedule;
  exceptions: DateException[];
  timezone: string;
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isAvailable: boolean;
  slots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}

export interface DateException {
  date: string;
  isAvailable: boolean;
  reason?: string;
}

export interface Service {
  id: string;
  providerId: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  currency: 'GHS';
  duration: number;
  images: string[];
  isActive: boolean;
  addOns?: ServiceAddOn[];
}

export interface ServiceAddOn {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment: string;
  response?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
}

// Booking types
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ON_THE_WAY = 'on_the_way',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  status: BookingStatus;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  location: Location;
  locationNotes?: string;
  totalAmount: number;
  currency: 'GHS';
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  addOns: ServiceAddOn[];
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  customer?: any;
  provider?: Provider;
  service?: Service;
  review?: Review;
}

export interface CreateBookingRequest {
  providerId: string;
  serviceId: string;
  scheduledDate: string;
  scheduledTime: string;
  location: Location;
  locationNotes?: string;
  addOns?: string[];
  notes?: string;
}

export interface UpdateBookingRequest {
  status?: BookingStatus;
  cancellationReason?: string;
}

export interface AvailabilityQueryParams {
  providerId: string;
  date: string;
  serviceId?: string;
}

// Payment types
export interface PaymentMethod {
  id: string;
  type: 'momo' | 'card' | 'cash';
  provider?: 'mtn' | 'vodafone' | 'airteltigo';
  phoneNumber?: string;
  isDefault: boolean;
}

export interface MoMoPaymentRequest {
  amount: number;
  currency: 'GHS';
  phoneNumber: string;
  provider: 'mtn' | 'vodafone' | 'airteltigo';
  bookingId: string;
}

export interface PaymentResponse {
  transactionId: string;
  status: PaymentStatus;
  reference: string;
  message: string;
}

export interface PaymentStatusResponse {
  transactionId: string;
  status: PaymentStatus;
  message: string;
}
