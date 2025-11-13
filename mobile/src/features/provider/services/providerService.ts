/**
 * Provider Service
 *
 * Handles all provider-related API calls
 *
 * @requirements Req 2 (Provider Discovery)
 */

import { apiClient } from '@/api/client';
import {
  Provider,
  ProviderListResponse,
  ProviderFilters,
  ServiceCategory,
} from '../types/provider.types';

/**
 * Provider Service
 */
export const providerService = {
  /**
   * Search providers with filters
   */
  async searchProviders(filters: ProviderFilters): Promise<ProviderListResponse> {
    const params = new URLSearchParams();

    if (filters.category) params.append('category', filters.category);
    if (filters.latitude) params.append('latitude', filters.latitude.toString());
    if (filters.longitude) params.append('longitude', filters.longitude.toString());
    if (filters.radius) params.append('radius', filters.radius.toString());
    if (filters.minRating) params.append('min_rating', filters.minRating.toString());
    if (filters.maxPrice) params.append('max_price', filters.maxPrice.toString());
    if (filters.verified !== undefined) params.append('verified', filters.verified.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sort_by', filters.sortBy);
    if (filters.sortOrder) params.append('sort_order', filters.sortOrder);

    const response = await apiClient.get<ProviderListResponse>(
      `/providers/?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get provider by ID
   */
  async getProvider(id: string): Promise<Provider> {
    const response = await apiClient.get<Provider>(`/providers/${id}/`);
    return response.data;
  },

  /**
   * Get service categories
   */
  async getCategories(): Promise<ServiceCategory[]> {
    const response = await apiClient.get<ServiceCategory[]>('/services/categories/');
    return response.data;
  },

  /**
   * Get featured providers
   */
  async getFeaturedProviders(): Promise<Provider[]> {
    const response = await apiClient.get<ProviderListResponse>('/providers/?featured=true');
    return response.data.results;
  },

  /**
   * Get nearby providers
   */
  async getNearbyProviders(
    latitude: number,
    longitude: number,
    radius: number = 10
  ): Promise<Provider[]> {
    const response = await apiClient.get<ProviderListResponse>(
      `/providers/?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
    );
    return response.data.results;
  },
};
