import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PayoutService } from '../../../core/api/services/PayoutService';

/**
 * Hook to fetch banking information
 * Requirement 10.9
 */
export const useBankingInfo = () => {
  return useQuery({
    queryKey: ['banking-info'],
    queryFn: () => PayoutService.getBankingInfo(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch payout schedule
 * Requirement 10.9
 */
export const usePayoutSchedule = () => {
  return useQuery({
    queryKey: ['payout-schedule'],
    queryFn: () => PayoutService.getPayoutSchedule(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch payout history
 * Requirement 10.9
 */
export const usePayouts = (page: number = 1, pageSize: number = 20) => {
  return useQuery({
    queryKey: ['payouts', page, pageSize],
    queryFn: () => PayoutService.getPayouts(page, pageSize),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch available balance
 * Requirement 10.10
 */
export const useAvailableBalance = () => {
  return useQuery({
    queryKey: ['available-balance'],
    queryFn: () => PayoutService.getAvailableBalance(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to request payout
 * Requirement 10.10
 */
export const useRequestPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: PayoutService.requestPayout,
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      queryClient.invalidateQueries({ queryKey: ['available-balance'] });
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
    },
  });
};

/**
 * Hook to add banking information
 * Requirement 10.9
 */
export const useAddBankingInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: PayoutService.addBankingInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banking-info'] });
    },
  });
};

/**
 * Hook to update banking information
 * Requirement 10.9
 */
export const useUpdateBankingInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      PayoutService.updateBankingInfo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banking-info'] });
    },
  });
};

/**
 * Hook to delete banking information
 * Requirement 10.9
 */
export const useDeleteBankingInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: PayoutService.deleteBankingInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banking-info'] });
    },
  });
};
