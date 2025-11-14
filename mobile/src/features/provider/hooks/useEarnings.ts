import { useQuery } from '@tanstack/react-query';
import { EarningsService } from '../../../core/api/services/EarningsService';

/**
 * Hook to fetch earnings data
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */
export const useEarnings = (period: 'week' | 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: ['earnings', period],
    queryFn: () => EarningsService.getEarnings(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch transaction history
 * Requirement 10.6
 */
export const useTransactions = (
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  status?: string
) => {
  return useQuery({
    queryKey: ['transactions', page, pageSize, search, status],
    queryFn: () => EarningsService.getTransactions(page, pageSize, search, status),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch transaction details
 * Requirement 10.6
 */
export const useTransactionDetails = (id: string) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => EarningsService.getTransactionById(id),
    enabled: !!id,
  });
};
