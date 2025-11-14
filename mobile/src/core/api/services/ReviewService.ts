/**
 * Review Service
 * Handles review and rating operations
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9
 */

import { api } from '../client';
import { Review, PaginatedResponse } from '../types';

export interface RatingBreakdown {
  average: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface SubmitReviewRequest {
  rating: number;
  comment: string;
}

export interface ReviewQueryParams {
  providerId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'recent' | 'highest' | 'lowest';
}

/**
 * Review Service
 */
export class ReviewService {
  private static readonly BASE_PATH = '/api/v1/reviews';

  /**
   * Submit a review for a completed booking
   * Requirement 7.5: Send POST request with rating and review data
   */
  static async submitReview(
    bookingId: string,
    rating: number,
    comment: string
  ): Promise<Review> {
    const data: SubmitReviewRequest = {
      rating,
      comment,
    };

    return api.post<Review>(`/api/v1/bookings/${bookingId}/review/`, data);
  }

  /**
   * Get reviews for a specific provider
   * Requirement 7.7: Display all reviews with pagination
   */
  static async getProviderReviews(
    providerId: string,
    params?: Omit<ReviewQueryParams, 'providerId'>
  ): Promise<PaginatedResponse<Review>> {
    const queryParams = new URLSearchParams({
      provider_id: providerId,
      ...(params?.page && { page: params.page.toString() }),
      ...(params?.pageSize && { page_size: params.pageSize.toString() }),
      ...(params?.sortBy && { sort_by: params.sortBy }),
    });

    return api.get<PaginatedResponse<Review>>(
      `${this.BASE_PATH}/?${queryParams.toString()}`
    );
  }

  /**
   * Get rating breakdown for a provider
   * Requirement 7.8: Display rating summary with distribution
   */
  static async getProviderRatingBreakdown(
    providerId: string
  ): Promise<RatingBreakdown> {
    return api.get<RatingBreakdown>(
      `${this.BASE_PATH}/breakdown/?provider_id=${providerId}`
    );
  }

  /**
   * Get a specific review by ID
   */
  static async getReviewById(reviewId: string): Promise<Review> {
    return api.get<Review>(`${this.BASE_PATH}/${reviewId}/`);
  }

  /**
   * Get reviews written by the current user
   */
  static async getMyReviews(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<Review>> {
    return api.get<PaginatedResponse<Review>>(
      `${this.BASE_PATH}/my-reviews/?page=${page}&page_size=${pageSize}`
    );
  }

  /**
   * Update a review (if allowed by backend)
   */
  static async updateReview(
    reviewId: string,
    rating: number,
    comment: string
  ): Promise<Review> {
    const data: SubmitReviewRequest = {
      rating,
      comment,
    };

    return api.patch<Review>(`${this.BASE_PATH}/${reviewId}/`, data);
  }

  /**
   * Delete a review (if allowed by backend)
   */
  static async deleteReview(reviewId: string): Promise<void> {
    return api.delete(`${this.BASE_PATH}/${reviewId}/`);
  }
}
