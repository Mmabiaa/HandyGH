// src/types/request.d.ts

import { Role } from './common.d';
import { PriceType, BookingStatus, PaymentStatus } from './booking.d';
import { User } from './user.d';
import { ProviderService } from './provider.d';

// Request types for authentication
export interface OtpRequest {
  phone: string;
}

export interface OtpVerifyRequest {
  phone: string;
  otp: string;
}

export interface RefreshTokenRequest {
  token: string;
}

// Request types for user management
export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
}

// Request types for provider management
export interface CreateProviderRequest {
  businessName: string;
  categories: string[];
  latitude: number;
  longitude: number;
  address: string;
}

export interface UpdateProviderRequest {
  businessName?: string;
  categories?: string[];
  latitude?: number;
  longitude?: number;
  address?: string;
}

// Request types for booking management
export interface CreateBookingRequest {
  providerId: string;
  providerServiceId: string;
  scheduledStart: Date;
  scheduledEnd?: Date;
  address: string;
}

// Request types for payment management
export interface PaymentRequest {
  bookingId: string;
  amount: number;
}

// Request types for messaging
export interface SendMessageRequest {
  bookingId: string;
  content: string;
  attachments?: string[];
}

// Request types for review management
export interface CreateReviewRequest {
  bookingId: string;
  rating: number;
  comment?: string;
}