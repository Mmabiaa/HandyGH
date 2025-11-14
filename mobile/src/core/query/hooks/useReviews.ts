/**
 * Review Query Hooks
 * React Query hooks for review and rating operations
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9
 */

import { useQuery, useInfiniteQuery, useMutation, useQueryClient, UseQueryResult, UseInfiniteQueryResult, UseMutationResult } from '@tanstack/react-query';
import { ReviewService, RatingBreakdown, ReviewQueryParams } from '../../api/services/ReviewService';
import { Review, PaginatedResponse } from '../../api/types';
import { queryKeys } from '../queryKeys';

/**
 * Hook to fetch provider reviews with infinite scroll pagination
 * Requirement 7.7: Display all reviews with pagination
 */
export function useProviderReviews(
  providerId: string,
  params?: Omit<ReviewQueryParams, 'providerId' | 'page'>
): UseInfiniteQueryResult<PaginatedResponse<Review>> {
  return useInfiniteQuery({
    queryKey: queryKeys.reviews.list(providerId, params),
    queryFn: ({ pageParam = 1 }) =>
      ReviewService.getProviderReviews(providerId, { ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.next ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!providerId,
  });
}

/**
 * Hook to fetch provider rating breakdown
 * Requirement 7.8: Display rating summary with distribution
 */
export function useProviderRatingBreakdown(
  providerId: string
): UseQueryResult<RatingBreakdown> {
  return useQuery({
    queryKey: queryKeys.reviews.breakdown(providerId),
    queryFn: () => ReviewService.getProviderRatingBreakdown(providerId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!providerId,
  });
}

/**
 * Hook to fetch a specific review by ID
 */
export function useReview(reviewId: string): UseQueryResult<Review> {
  return useQuery({
    queryKey: queryKeys.reviews.detail(reviewId),
    queryFn: () => ReviewService.getReviewById(reviewId),
    staleTime: 5 * 60 * 1000,
    enabled: !!reviewId,
  });
}

/**
 * Hook to fetch reviews written by the current user
 */
export function useMyReviews(
  page: number = 1,
  pageSize: number = 10
): UseQueryResult<PaginatedResponse<Review>> {
  return useQuery({
    queryKey: queryKeys.reviews.myReviews(page, pageSize),
    queryFn: () => ReviewService.getMyReviews(page, pageSize),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to submit a review for a booking
 * Requirement 7.5: Send POST request with rating and review data
 */
export function useSubmitReview(): UseMutationResult<
  Review,
  Error,
  { bookingId: string; rating: number; comment: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, rating, comment }) =>
      ReviewService.submitReview(bookingId, rating, comment),
    onSuccess: (newReview, variables) => {
      // Invalidate provider reviews to refetch
      if (newReview.providerId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews.list(newReview.providerId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews.breakdown(newReview.providerId) });
      }

      // Invalidate booking details to show the new review
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(variables.bookingId) });

      // Invalidate my reviews
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.myReviews() });
    },
  });
}

/**
 * Hook to update an existing review
 */
export function useUpdateReview(): UseMutationResult<
  Review,
  Error,
  { reviewId: string; rating: number; comment: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, rating, comment }) =>
      ReviewService.updateReview(reviewId, rating, comment),
    onSuccess: (updatedReview) => {
      // Update the review in cache
      queryClient.setQueryData(
        queryKeys.reviews.detail(updatedReview.id),
        updatedReview
      );

      // Invalidate provider reviews
      if (updatedReview.providerId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews.list(updatedReview.providerId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews.breakdown(updatedReview.providerId) });
      }

      // Invalidate my reviews
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.myReviews() });
    },
  });
}

/**
 * Hook to delete a review
 */
export function useDeleteReview(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => ReviewService.deleteReview(reviewId),
    onSuccess: () => {
      // Invalidate all review queries
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
  });
}
