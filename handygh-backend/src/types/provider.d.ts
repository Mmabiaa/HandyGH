// src/types/provider.d.ts

export interface Provider {
  id: string;
  userId: string;
  businessName?: string;
  categories: string[];
  latitude?: number;
  longitude?: number;
  address?: string;
  verified: boolean;
  verificationDocUrl?: string;
  ratingAvg: number;
  ratingCount: number;
  createdAt: Date;
}

export interface ProviderService {
  id: string;
  providerId: string;
  title: string;
  description?: string;
  priceType: PriceType;
  priceAmount: number;
  durationMinutes?: number;
  isActive: boolean;
  createdAt: Date;
}

export enum PriceType {
  HOURLY = "HOURLY",
  FIXED = "FIXED",
}