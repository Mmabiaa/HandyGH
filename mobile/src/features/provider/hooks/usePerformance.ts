import { useQuery } from '@tanstack/react-query';
import { PerformanceService } from '../../../core/api/services/PerformanceService';

/**
 * Hook to fetch performance metrics
 * Requirements: 10.7, 10.8
 */
export const usePerformanceMetrics = () => {
  return useQuery({
    queryKey: ['performance', 'metrics'],
    queryFn: () => PerformanceService.getMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch performance trend data
 * Requirement 10.8
 */
export const usePerformanceTrend = (days: number = 30) => {
  return useQuery({
    queryKey: ['performance', 'trend', days],
    queryFn: () => PerformanceService.getTrend(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
