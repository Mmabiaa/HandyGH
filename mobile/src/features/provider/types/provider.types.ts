/**
 * Provider Types
 *
 * Type definitions for providers, services, and related entities
 *
 * @requirements Req 2, Req 3
 */

/**
 * Service Category
 */
export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

/**
 * Location
 */
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  region?: string;
}

/**
 * Service offered by provider
 */
export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  priceType: 'HOURLY' | 'FIXED';
  price: number;
  duration?: number; // in minutes
  isActive: boolean;
  createdAt: string;
}

/**
 * Provider Rating
 */
export interface Rating {
  average: number;
  count: number;
  distribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

/**
 * Provider Profile
 */
export interface Provider {
  id: string;
  userId: string;
  businessName: string;
  description?: string;
  categories: string[];
  location: Location;
  verified: boolean;
  rating: Rating;
  services: Service[];
  profilePhoto?: string;
  coverPhoto?: string;
  phone?: string;
  email?: string;
  availability?: {
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
    friday?: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Provider Search Filters
 */
export interface ProviderFilters {
  category?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
  minRating?: number;
  maxPrice?: number;
  verified?: boolean;
  search?: string;
  sortBy?: 'distance' | 'rating' | 'price';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Provider List Response
 */
export interface ProviderListResponse {
  results: Provider[];
  count: number;
  next?: string;
  previous?: string;
}

/**
 * Provider with distance (for search results)
 */
export interface ProviderWithDistance extends Provider {
  distance?: number; // in kilometers
}
