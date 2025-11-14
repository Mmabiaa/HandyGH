import { ProviderCacheRepository, CachedProvider, CachedCategory } from '../ProviderCacheRepository';
import { MMKVStorage } from '../MMKVStorage';

// Mock MMKVStorage
jest.mock('../MMKVStorage');

describe('ProviderCacheRepository', () => {
  const mockProviders: CachedProvider[] = [
    {
      id: 'provider-1',
      businessName: 'Test Provider',
      rating: 4.5,
      totalReviews: 100,
      categories: ['plumbing'],
      isVerified: true,
      cachedAt: Date.now(),
    },
  ];

  const mockCategories: CachedCategory[] = [
    {
      id: 'cat-1',
      name: 'Plumbing',
      icon: 'wrench',
      description: 'Plumbing services',
      cachedAt: Date.now(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cacheProviders', () => {
    it('should cache providers with timestamp', () => {
      ProviderCacheRepository.cacheProviders(mockProviders);

      expect(MMKVStorage.set).toHaveBeenCalledWith(
        'cached_providers',
        expect.any(String)
      );
      expect(MMKVStorage.set).toHaveBeenCalledWith(
        'cache_timestamp_providers',
        expect.any(String)
      );
    });
  });

  describe('getCachedProviders', () => {
    it('should return cached providers', () => {
      (MMKVStorage.getString as jest.Mock).mockReturnValue(
        JSON.stringify(mockProviders)
      );

      const result = ProviderCacheRepository.getCachedProviders();

      expect(result).toEqual(mockProviders);
    });

    it('should return null when no cache exists', () => {
      (MMKVStorage.getString as jest.Mock).mockReturnValue(null);

      const result = ProviderCacheRepository.getCachedProviders();

      expect(result).toBeNull();
    });

    it('should handle parse errors gracefully', () => {
      (MMKVStorage.getString as jest.Mock).mockReturnValue('invalid json');

      const result = ProviderCacheRepository.getCachedProviders();

      expect(result).toBeNull();
    });
  });

  describe('cacheProviderDetail', () => {
    it('should cache provider detail', () => {
      const providerDetail = { id: 'provider-1', name: 'Test' };

      ProviderCacheRepository.cacheProviderDetail('provider-1', providerDetail);

      expect(MMKVStorage.set).toHaveBeenCalledWith(
        'provider_detail_provider-1',
        expect.any(String)
      );
    });
  });

  describe('getCachedProviderDetail', () => {
    it('should return cached provider detail', () => {
      const providerDetail = { id: 'provider-1', name: 'Test' };
      (MMKVStorage.getString as jest.Mock).mockReturnValue(
        JSON.stringify(providerDetail)
      );

      const result = ProviderCacheRepository.getCachedProviderDetail('provider-1');

      expect(result).toEqual(providerDetail);
    });
  });

  describe('cacheCategories', () => {
    it('should cache categories with timestamp', () => {
      ProviderCacheRepository.cacheCategories(mockCategories);

      expect(MMKVStorage.set).toHaveBeenCalledWith(
        'cached_categories',
        expect.any(String)
      );
      expect(MMKVStorage.set).toHaveBeenCalledWith(
        'cache_timestamp_categories',
        expect.any(String)
      );
    });
  });

  describe('getCachedCategories', () => {
    it('should return cached categories', () => {
      (MMKVStorage.getString as jest.Mock).mockReturnValue(
        JSON.stringify(mockCategories)
      );

      const result = ProviderCacheRepository.getCachedCategories();

      expect(result).toEqual(mockCategories);
    });
  });

  describe('isCacheStale', () => {
    it('should return true for stale cache', () => {
      const oldTimestamp = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
      (MMKVStorage.getString as jest.Mock).mockReturnValue(
        oldTimestamp.toString()
      );

      const result = ProviderCacheRepository.isCacheStale('providers');

      expect(result).toBe(true);
    });

    it('should return false for fresh cache', () => {
      const recentTimestamp = Date.now() - 1 * 60 * 60 * 1000; // 1 hour ago
      (MMKVStorage.getString as jest.Mock).mockReturnValue(
        recentTimestamp.toString()
      );

      const result = ProviderCacheRepository.isCacheStale('providers');

      expect(result).toBe(false);
    });

    it('should return true when no timestamp exists', () => {
      (MMKVStorage.getString as jest.Mock).mockReturnValue(null);

      const result = ProviderCacheRepository.isCacheStale('providers');

      expect(result).toBe(true);
    });
  });

  describe('clearCache', () => {
    it('should clear all cache data', () => {
      (MMKVStorage.getAllKeys as jest.Mock).mockReturnValue([
        'provider_detail_1',
        'provider_detail_2',
        'other_key',
      ]);

      ProviderCacheRepository.clearCache();

      expect(MMKVStorage.delete).toHaveBeenCalledWith('cached_providers');
      expect(MMKVStorage.delete).toHaveBeenCalledWith('cached_categories');
      expect(MMKVStorage.delete).toHaveBeenCalledWith('provider_detail_1');
      expect(MMKVStorage.delete).toHaveBeenCalledWith('provider_detail_2');
      expect(MMKVStorage.delete).not.toHaveBeenCalledWith('other_key');
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      (MMKVStorage.getString as jest.Mock).mockImplementation((key: string) => {
        if (key === 'cached_providers') {
          return JSON.stringify(mockProviders);
        }
        if (key === 'cached_categories') {
          return JSON.stringify(mockCategories);
        }
        if (key === 'cache_timestamp_providers') {
          return '1234567890';
        }
        if (key === 'cache_timestamp_categories') {
          return '1234567891';
        }
        return null;
      });

      (MMKVStorage.getAllKeys as jest.Mock).mockReturnValue([
        'provider_detail_1',
        'provider_detail_2',
      ]);

      const stats = ProviderCacheRepository.getCacheStats();

      expect(stats.providersCount).toBe(1);
      expect(stats.categoriesCount).toBe(1);
      expect(stats.providerDetailsCount).toBe(2);
      expect(stats.lastUpdated.providers).toBe(1234567890);
      expect(stats.lastUpdated.categories).toBe(1234567891);
    });
  });
});
