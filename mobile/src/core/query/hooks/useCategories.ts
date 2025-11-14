import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api } from '../../api';
import { queryKeys } from '../queryKeys';

// Service category type
export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  isActive: boolean;
}

/**
 * Hook to fetch all service categories
 */
export const useCategories = (
  options?: Omit<UseQueryOptions<ServiceCategory[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: async () => {
      const response = await api.get<ServiceCategory[]>('/api/v1/services/categories/');
      return response;
    },
    // Categories change infrequently, so we can cache them longer
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    ...options,
  });
};

/**
 * Hook to fetch a single category by ID
 */
export const useCategory = (
  categoryId: string,
  options?: Omit<UseQueryOptions<ServiceCategory>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: queryKeys.categories.detail(categoryId),
    queryFn: async () => {
      const response = await api.get<ServiceCategory>(`/api/v1/services/categories/${categoryId}/`);
      return response;
    },
    enabled: !!categoryId,
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
};
