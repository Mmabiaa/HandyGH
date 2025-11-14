import { ProviderService } from '../ProviderService';
import { api } from '../../client';
import { Provider, PaginatedResponse, Service, Review } from '../../types';

// Mock dependencies
jest.mock('../../client');

describe('ProviderService', () => {
  const mockApi = api as jest.Mocked<typeof api>;

  const mockProvider: Provider = {
    id: 'provider-1',
    businessName: 'Test Provider',
    businessDescription: 'Test description',
    categories: ['plumbing'],
    rating: 4.5,
    totalReviews: 100,
    totalServices: 50,
    responseRate: 95,
    responseTime: 30,
    isVerified: true,
    serviceArea: {
      type: 'radius',
      radius: 10,
    },
    availability: {
      schedule: {} as any,
      exceptions: [],
      timezone: 'GMT',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProviders', () => {
    it('should fetch providers without filters', async () => {
      const mockResponse: PaginatedResponse<Provider> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockProvider],
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await ProviderService.getProviders();

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/providers/');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch providers with category filter', async () => {
      const mockResponse: PaginatedResponse<Provider> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockProvider],
      };

      mockApi.get.mockResolvedValue(mockResponse);

      await ProviderService.getProviders({ category: 'plumbing' });

      expect(mockApi.get).toHaveBeenCalledWith(
        '/api/v1/providers/?category=plumbing'
      );
    });

    it('should fetch providers with search query', async () => {
      const mockResponse: PaginatedResponse<Provider> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockProvider],
      };

      mockApi.get.mockResolvedValue(mockResponse);

      await ProviderService.getProviders({ search: 'plumber' });

      expect(mockApi.get).toHaveBeenCalledWith(
        '/api/v1/providers/?search=plumber'
      );
    });

    it('should fetch providers with location filters', async () => {
      const mockResponse: PaginatedResponse<Provider> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockProvider],
      };

      mockApi.get.mockResolvedValue(mockResponse);

      await ProviderService.getProviders({
        latitude: 5.6037,
        longitude: -0.1870,
        radius: 5,
      });

      expect(mockApi.get).toHaveBeenCalledWith(
        '/api/v1/providers/?latitude=5.6037&longitude=-0.187&radius=5'
      );
    });

    it('should fetch providers with pagination', async () => {
      const mockResponse: PaginatedResponse<Provider> = {
        count: 20,
        next: 'next-url',
        previous: null,
        results: [mockProvider],
      };

      mockApi.get.mockResolvedValue(mockResponse);

      await ProviderService.getProviders({ page: 2, pageSize: 10 });

      expect(mockApi.get).toHaveBeenCalledWith(
        '/api/v1/providers/?page=2&page_size=10'
      );
    });
  });

  describe('getProviderById', () => {
    it('should fetch provider by ID', async () => {
      mockApi.get.mockResolvedValue(mockProvider);

      const result = await ProviderService.getProviderById('provider-1');

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/providers/provider-1/');
      expect(result).toEqual(mockProvider);
    });

    it('should handle provider not found', async () => {
      const error = new Error('Provider not found');
      mockApi.get.mockRejectedValue(error);

      await expect(ProviderService.getProviderById('invalid-id')).rejects.toThrow(
        'Provider not found'
      );
    });
  });

  describe('getProviderServices', () => {
    it('should fetch services for a provider', async () => {
      const mockServices: Service[] = [
        {
          id: 'service-1',
          providerId: 'provider-1',
          name: 'Pipe Repair',
          description: 'Fix leaking pipes',
          categoryId: 'plumbing',
          price: 100,
          currency: 'GHS',
          duration: 60,
          images: [],
          isActive: true,
        },
      ];

      mockApi.get.mockResolvedValue(mockServices);

      const result = await ProviderService.getProviderServices('provider-1');

      expect(mockApi.get).toHaveBeenCalledWith(
        '/api/v1/providers/provider-1/services/'
      );
      expect(result).toEqual(mockServices);
    });
  });

  describe('getProviderReviews', () => {
    it('should fetch reviews for a provider', async () => {
      const mockReviews: PaginatedResponse<Review> = {
        count: 10,
        next: null,
        previous: null,
        results: [
          {
            id: 'review-1',
            bookingId: 'booking-1',
            customerId: 'customer-1',
            providerId: 'provider-1',
            rating: 5,
            comment: 'Great service!',
            createdAt: '2025-11-14T10:00:00Z',
            updatedAt: '2025-11-14T10:00:00Z',
          },
        ],
      };

      mockApi.get.mockResolvedValue(mockReviews);

      const result = await ProviderService.getProviderReviews('provider-1', 1, 10);

      expect(mockApi.get).toHaveBeenCalledWith(
        '/api/v1/providers/provider-1/reviews/?page=1&page_size=10'
      );
      expect(result).toEqual(mockReviews);
    });
  });

  describe('favoriteProvider', () => {
    it('should add provider to favorites', async () => {
      mockApi.post.mockResolvedValue({});

      await ProviderService.favoriteProvider('provider-1');

      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/v1/providers/provider-1/favorite/'
      );
    });
  });

  describe('unfavoriteProvider', () => {
    it('should remove provider from favorites', async () => {
      mockApi.delete.mockResolvedValue({});

      await ProviderService.unfavoriteProvider('provider-1');

      expect(mockApi.delete).toHaveBeenCalledWith(
        '/api/v1/providers/provider-1/favorite/'
      );
    });
  });

  describe('searchProviders', () => {
    it('should search providers by query', async () => {
      const mockResponse: PaginatedResponse<Provider> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockProvider],
      };

      mockApi.get.mockResolvedValue(mockResponse);

      await ProviderService.searchProviders('plumber', 1, 10);

      expect(mockApi.get).toHaveBeenCalledWith(
        '/api/v1/providers/?search=plumber&page=1&page_size=10'
      );
    });
  });

  describe('getFeaturedProviders', () => {
    it('should fetch featured providers', async () => {
      const mockResponse: PaginatedResponse<Provider> = {
        count: 1,
        next: null,
        previous: null,
        results: [mockProvider],
      };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await ProviderService.getFeaturedProviders();

      expect(mockApi.get).toHaveBeenCalledWith('/api/v1/providers/?featured=true');
      expect(result).toEqual([mockProvider]);
    });
  });
});
