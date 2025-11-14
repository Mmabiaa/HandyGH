import { MMKVStorage } from './MMKVStorage';

/**
 * Repository for caching provider data in MMKV
 * Provides fast access to provider information when offline
 */

const PROVIDER_CACHE_KEY = 'cached_providers';
const PROVIDER_DETAIL_PREFIX = 'provider_detail_';
const CATEGORIES_CACHE_KEY = 'cached_categories';
const CACHE_TIMESTAMP_KEY = 'cache_timestamp_';

export interface CachedProvider {
  id: string;
  businessName: string;
  rating: number;
  totalReviews: number;
  profilePhoto?: string;
  coverPhoto?: string;
  categories: string[];
  isVerified: boolean;
  cachedAt: number;
}

export interface CachedCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  cachedAt: number;
}

export class ProviderCacheRepository {
  /**
   * Cache a list of providers
   */
  static async cacheProviders(providers: CachedProvider[]): Promise<void> {
    const providersWithTimestamp = providers.map(p => ({
      ...p,
      cachedAt: Date.now(),
    }));

    await MMKVStorage.set(PROVIDER_CACHE_KEY, JSON.stringify(providersWithTimestamp));
    await MMKVStorage.set(
      CACHE_TIMESTAMP_KEY + 'providers',
      Date.now().toString()
    );
  }

  /**
   * Get cached providers
   */
  static async getCachedProviders(): Promise<CachedProvider[] | null> {
    const cached = await MMKVStorage.getString(PROVIDER_CACHE_KEY);
    if (!cached) return null;

    try {
      return JSON.parse(cached);
    } catch (error) {
      console.error('Error parsing cached providers:', error);
      return null;
    }
  }

  /**
   * Cache a single provider detail
   */
  static async cacheProviderDetail(providerId: string, data: any): Promise<void> {
    const cacheData = {
      ...data,
      cachedAt: Date.now(),
    };

    await MMKVStorage.set(
      PROVIDER_DETAIL_PREFIX + providerId,
      JSON.stringify(cacheData)
    );
  }

  /**
   * Get cached provider detail
   */
  static async getCachedProviderDetail(providerId: string): Promise<any | null> {
    const cached = await MMKVStorage.getString(PROVIDER_DETAIL_PREFIX + providerId);
    if (!cached) return null;

    try {
      return JSON.parse(cached);
    } catch (error) {
      console.error('Error parsing cached provider detail:', error);
      return null;
    }
  }

  /**
   * Cache service categories
   */
  static async cacheCategories(categories: CachedCategory[]): Promise<void> {
    const categoriesWithTimestamp = categories.map(c => ({
      ...c,
      cachedAt: Date.now(),
    }));

    await MMKVStorage.set(
      CATEGORIES_CACHE_KEY,
      JSON.stringify(categoriesWithTimestamp)
    );
    await MMKVStorage.set(
      CACHE_TIMESTAMP_KEY + 'categories',
      Date.now().toString()
    );
  }

  /**
   * Get cached categories
   */
  static async getCachedCategories(): Promise<CachedCategory[] | null> {
    const cached = await MMKVStorage.getString(CATEGORIES_CACHE_KEY);
    if (!cached) return null;

    try {
      return JSON.parse(cached);
    } catch (error) {
      console.error('Error parsing cached categories:', error);
      return null;
    }
  }

  /**
   * Check if cache is stale (older than 24 hours)
   */
  static async isCacheStale(cacheType: 'providers' | 'categories'): Promise<boolean> {
    const timestamp = await MMKVStorage.getString(CACHE_TIMESTAMP_KEY + cacheType);
    if (!timestamp) return true;

    const cacheAge = Date.now() - parseInt(timestamp, 10);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    return cacheAge > maxAge;
  }

  /**
   * Clear all provider cache
   */
  static async clearCache(): Promise<void> {
    await MMKVStorage.delete(PROVIDER_CACHE_KEY);
    await MMKVStorage.delete(CATEGORIES_CACHE_KEY);
    await MMKVStorage.delete(CACHE_TIMESTAMP_KEY + 'providers');
    await MMKVStorage.delete(CACHE_TIMESTAMP_KEY + 'categories');

    // Clear individual provider details
    const allKeys = await MMKVStorage.getAllKeys();
    for (const key of allKeys) {
      if (key.startsWith(PROVIDER_DETAIL_PREFIX)) {
        await MMKVStorage.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{
    providersCount: number;
    categoriesCount: number;
    providerDetailsCount: number;
    lastUpdated: {
      providers: number | null;
      categories: number | null;
    };
  }> {
    const providers = await this.getCachedProviders();
    const categories = await this.getCachedCategories();
    const allKeys = await MMKVStorage.getAllKeys();
    const providerDetailsCount = allKeys.filter((key: string) =>
      key.startsWith(PROVIDER_DETAIL_PREFIX)
    ).length;

    const providersTimestamp = await MMKVStorage.getString(
      CACHE_TIMESTAMP_KEY + 'providers'
    );
    const categoriesTimestamp = await MMKVStorage.getString(
      CACHE_TIMESTAMP_KEY + 'categories'
    );

    return {
      providersCount: providers?.length ?? 0,
      categoriesCount: categories?.length ?? 0,
      providerDetailsCount,
      lastUpdated: {
        providers: providersTimestamp ? parseInt(providersTimestamp, 10) : null,
        categories: categoriesTimestamp
          ? parseInt(categoriesTimestamp, 10)
          : null,
      },
    };
  }
}
