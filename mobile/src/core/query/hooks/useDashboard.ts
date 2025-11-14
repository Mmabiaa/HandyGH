/**
 * Dashboard Hooks
 * Custom hooks for provider dashboard data fetching
 *
 * Requirements: 8.1
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  ProviderDashboardService,
  DashboardData,
  DashboardMetrics,
  EarningsTrend,
  UpcomingBooking,
} from '../../api/services/ProviderDashboardService';
import { queryKeys } from '../queryKeys';

/**
 * Hook to fetch complete dashboard data
 * Requirement 8.1: Retrieve dashboard metrics
 */
export const useDashboardData = (): UseQueryResult<DashboardData> => {
  return useQuery<DashboardData>({
    queryKey: queryKeys.provider.dashboard(),
    queryFn: () => ProviderDashboardService.getDashboardData(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch dashboard metrics only
 * Requirements: 8.2, 8.3, 8.4
 */
export const useDashboardMetrics = (): UseQueryResult<DashboardMetrics> => {
  return useQuery<DashboardMetrics>({
    queryKey: queryKeys.provider.dashboardMetrics(),
    queryFn: () => ProviderDashboardService.getMetrics(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to fetch earnings trend
 * Requirement 8.3: Show earnings trend chart
 */
export const useEarningsTrend = (days: number = 30): UseQueryResult<EarningsTrend[]> => {
  return useQuery<EarningsTrend[]>({
    queryKey: queryKeys.provider.earningsTrend(days),
    queryFn: () => ProviderDashboardService.getEarningsTrend(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

/**
 * Hook to fetch upcoming bookings
 * Requirement 8.4: Display upcoming bookings
 */
export const useUpcomingBookings = (days: number = 7): UseQueryResult<UpcomingBooking[]> => {
  return useQuery<UpcomingBooking[]>({
    queryKey: queryKeys.provider.upcomingBookings(days),
    queryFn: () => ProviderDashboardService.getUpcomingBookings(days),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
