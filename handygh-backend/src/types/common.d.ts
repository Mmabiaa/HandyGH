// src/types/common.d.ts

export type UUID = string;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface UserProfile {
  id: UUID;
  name?: string;
  email?: string;
  phone: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderProfile {
  id: UUID;
  userId: UUID;
  businessName?: string;
  categories: string[];
  location: Location;
  verified: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: Date;
}