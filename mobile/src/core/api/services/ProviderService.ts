import { api } from '../client';
import {
  Provider,
  ProviderQueryParams,
  Service,
  Review,
  PaginatedResponse,
} from '../types';

/**
 * Provider Service
 * Handles provider discovery, details, services, and reviews
 */
export class ProviderService {
  private static readonly BASE_PATH = '/api/v1/providers';

  /**
   * Get list of providers with optional filters
   * Requirement 2.2: Retrieve featured and filtered providers
   */
  static async getProviders(params: ProviderQueryParams = {}): Promise<PaginatedResponse<Provider>> {
    const queryParams = new URLSearchParams();

    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (params.latitude) queryParams.append('latitude', params.latitude.toString());
    if (params.longitude) queryParams.append('longitude', params.longitude.toString());
    if (params.radius) queryParams.append('radius', params.radius.toString());
    if (params.minRating) queryParams.append('min_rating', params.minRating.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('page_size', params.pageSize.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${this.BASE_PATH}/?${queryString}` : `${this.BASE_PATH}/`;

    return api.get<PaginatedResponse<Provider>>(url);
  }

  /**
   * Get provider by ID
   * Requirement 2.2: Retrieve detailed provider information
   */
  static async getProviderById(id: string): Promise<Provider> {
    return api.get<Provider>(`${this.BASE_PATH}/${id}/`);
  }

  /**
   * Get services offered by a provider
   */
  static async getProviderServices(id: string): Promise<Service[]> {
    return api.get<Service[]>(`${this.BASE_PATH}/${id}/services/`);
  }

  /**
   * Get reviews for a provider
   */
  static async getProviderReviews(
    id: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Review>> {
    return api.get<PaginatedResponse<Review>>(
      `${this.BASE_PATH}/${id}/reviews/?page=${page}&page_size=${pageSize}`
    );
  }

  /**
   * Add provider to favorites
   */
  static async favoriteProvider(id: string): Promise<void> {
    return api.post(`${this.BASE_PATH}/${id}/favorite/`);
  }

  /**
   * Remove provider from favorites
   */
  static async unfavoriteProvider(id: string): Promise<void> {
    return api.delete(`${this.BASE_PATH}/${id}/favorite/`);
  }

  /**
   * Search providers by query
   */
  static async searchProviders(
    query: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Provider>> {
    return this.getProviders({
      search: query,
      page,
      pageSize,
    });
  }

  /**
   * Get featured providers
   */
  static async getFeaturedProviders(): Promise<Provider[]> {
    const response = await api.get<PaginatedResponse<Provider>>(
      `${this.BASE_PATH}/?featured=true`
    );
    return response.results;
  }

  /**
   * Get providers by category
   */
  static async getProvidersByCategory(
    categoryId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Provider>> {
    return this.getProviders({
      category: categoryId,
      page,
      pageSize,
    });
  }

  /**
   * Get nearby providers based on location
   */
  static async getNearbyProviders(
    latitude: number,
    longitude: number,
    radius: number = 10,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Provider>> {
    return this.getProviders({
      latitude,
      longitude,
      radius,
      page,
      pageSize,
    });
  }
}
