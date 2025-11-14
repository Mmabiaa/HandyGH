/**
 * Synchronous storage adapter for Zustand persist
 * Works with both sync (MMKV) and async (AsyncStorage) storage
 */

import { MMKVStorage } from './MMKVStorage';

// Cache for AsyncStorage values to enable synchronous access
const storageCache = new Map<string, string>();

/**
 * Initialize storage cache on app start
 */
export async function initializeStorageCache() {
  try {
    const keys = await MMKVStorage.getAllKeys();
    for (const key of keys) {
      const value = await MMKVStorage.getString(key);
      if (value) {
        storageCache.set(key, value);
      }
    }
  } catch (error) {
    console.warn('[ZustandStorageAdapter] Error initializing cache:', error);
  }
}

/**
 * Synchronous storage adapter for Zustand
 * Uses cache for reads, async writes update cache
 */
export const zustandStorage = {
  setItem: (name: string, value: string): void => {
    // Update cache immediately for synchronous access
    storageCache.set(name, value);
    // Write asynchronously in background
    MMKVStorage.set(name, value).catch((error) => {
      console.error('[ZustandStorageAdapter] Error setting item:', error);
      storageCache.delete(name); // Remove from cache on error
    });
  },
  getItem: (name: string): string | null => {
    // Return from cache (synchronous)
    const cached = storageCache.get(name);
    if (cached !== undefined) {
      return cached;
    }
    // If not in cache, try to get it (this will be async but Zustand handles it)
    // For now, return null and let Zustand handle the async case
    return null;
  },
  removeItem: (name: string): void => {
    // Remove from cache immediately
    storageCache.delete(name);
    // Remove asynchronously in background
    MMKVStorage.delete(name).catch((error) => {
      console.error('[ZustandStorageAdapter] Error removing item:', error);
    });
  },
};
