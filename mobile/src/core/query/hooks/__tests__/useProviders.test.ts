import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProviders, useProvider, useFavoriteProvider } from '../useProviders';
import { ProviderService } from '../../../api/services';
import type { Provider, PaginatedResponse } from '../../../api/types';

// Mock ProviderService
jest.mock('../../../api/services/ProviderService', () => ({
  ProviderService: {
    getProviders: jest.fn(),
    getProviderById: jest.fn(),
    getProviderServices: jest.fn(),
    getProviderReviews: jest.fn(),
    favoriteProvider: jest.fn(),
    unfavoriteProvider: jest.fn(),
  },
}));

describe('useProviders hooks', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  const mockProvider: Provider = {
    id: 'provider-1',
    businessName: 'Test Provider',
    businessDescription: 'Test description',
    categories: ['plumbing'],
    rating: 4.5,
    totalReviews: 100,
    totalServices: 250,
    responseRate: 95,
    responseTime: 30,
    isVerified: true,
    serviceArea: {
      type: 'radius',
      center: { latitude: 5.6037, longitude: -0.1870 },
      radius: 10,
    },
    availability: {
      schedule: {} as any,
      exceptions: [],
      timezone: 'GMT',
    },
  };

  const mockPaginatedResponse: PaginatedResponse<Provider> = {
    count: 1,
    next: null,
    previous: null,
    results: [mockProvider],
  };

  beforeEach(() => {
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Create wrapper with QueryClientProvider
    wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('useProviders', () => {
    it('should fetch providers successfully', async () => {
      (ProviderService.getProviders as jest.Mock).mockResolvedValueOnce(mockPaginatedResponse);

      const { result } = renderHook(() => useProviders({}), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPaginatedResponse);
      expect(ProviderService.getProviders).toHaveBeenCalledWith({});
    });

    it('should fetch providers with query parameters', async () => {
      const params = { category: 'plumbing', search: 'test' };
      (ProviderService.getProviders as jest.Mock).mockResolvedValueOnce(mockPaginatedResponse);

      const { result } = renderHook(() => useProviders(params), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(ProviderService.getProviders).toHaveBeenCalledWith(params);
    });

    it('should handle errors', async () => {
      const error = new Error('Failed to fetch providers');
      (ProviderService.getProviders as jest.Mock).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useProviders({}), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useProvider', () => {
    it('should fetch single provider successfully', async () => {
      (ProviderService.getProviderById as jest.Mock).mockResolvedValueOnce(mockProvider);

      const { result } = renderHook(() => useProvider('provider-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockProvider);
      expect(ProviderService.getProviderById).toHaveBeenCalledWith('provider-1');
    });

    it('should not fetch if providerId is empty', () => {
      const { result } = renderHook(() => useProvider(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(ProviderService.getProviderById).not.toHaveBeenCalled();
    });
  });

  describe('useFavoriteProvider', () => {
    it('should favorite a provider successfully', async () => {
      (ProviderService.favoriteProvider as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useFavoriteProvider(), { wrapper });

      await waitFor(() => {
        result.current.mutate('provider-1');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(ProviderService.favoriteProvider).toHaveBeenCalledWith('provider-1');
    });

    it('should handle favorite errors', async () => {
      const error = new Error('Failed to favorite');
      (ProviderService.favoriteProvider as jest.Mock).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useFavoriteProvider(), { wrapper });

      await waitFor(() => {
        result.current.mutate('provider-1');
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(error);
    });
  });
});
