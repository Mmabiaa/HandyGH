import { MMKV } from 'react-native-mmkv';

// Create MMKV instance for fast key-value storage
export const storage = new MMKV({
  id: 'handygh-app-storage',
  encryptionKey: 'handygh-secure-key-2024', // In production, use a more secure key
});

// Storage keys
export const StorageKeys = {
  USER_PREFERENCES: 'user_preferences',
  CACHED_PROVIDERS: 'cached_providers',
  CACHED_CATEGORIES: 'cached_categories',
  LAST_SYNC_TIME: 'last_sync_time',
  OFFLINE_QUEUE: 'offline_queue',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Type-safe storage utilities
export class MMKVStorage {
  /**
   * Set a string value
   */
  static set(key: string, value: string): void {
    storage.set(key, value);
  }

  /**
   * Get a string value
   */
  static getString(key: string): string | undefined {
    return storage.getString(key);
  }

  /**
   * Set a number value
   */
  static setNumber(key: string, value: number): void {
    storage.set(key, value);
  }

  /**
   * Get a number value
   */
  static getNumber(key: string): number | undefined {
    return storage.getNumber(key);
  }

  /**
   * Set a boolean value
   */
  static setBoolean(key: string, value: boolean): void {
    storage.set(key, value);
  }

  /**
   * Get a boolean value
   */
  static getBoolean(key: string): boolean | undefined {
    return storage.getBoolean(key);
  }

  /**
   * Set an object (will be JSON stringified)
   */
  static setObject<T>(key: string, value: T): void {
    storage.set(key, JSON.stringify(value));
  }

  /**
   * Get an object (will be JSON parsed)
   */
  static getObject<T>(key: string): T | undefined {
    const value = storage.getString(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch (error) {
        console.error(`Error parsing object for key ${key}:`, error);
        return undefined;
      }
    }
    return undefined;
  }

  /**
   * Delete a value
   */
  static delete(key: string): void {
    storage.delete(key);
  }

  /**
   * Check if a key exists
   */
  static contains(key: string): boolean {
    return storage.contains(key);
  }

  /**
   * Clear all storage
   */
  static clearAll(): void {
    storage.clearAll();
  }

  /**
   * Get all keys
   */
  static getAllKeys(): string[] {
    return storage.getAllKeys();
  }
}
