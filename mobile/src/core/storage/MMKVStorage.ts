import { Platform } from 'react-native';

// Platform-specific storage implementation
let storage: any;

try {
  if (Platform.OS === 'web') {
    // Web fallback using localStorage
    storage = {
      set: (key: string, value: any) => {
        try {
          if (typeof value === 'string') {
            localStorage.setItem(key, value);
          } else if (typeof value === 'number') {
            localStorage.setItem(key, String(value));
          } else if (typeof value === 'boolean') {
            localStorage.setItem(key, String(value));
          }
        } catch (error) {
          console.error('Error setting localStorage:', error);
        }
      },
      getString: (key: string) => {
        try {
          return localStorage.getItem(key) ?? undefined;
        } catch (error) {
          console.error('Error getting localStorage:', error);
          return undefined;
        }
      },
      getNumber: (key: string) => {
        try {
          const value = localStorage.getItem(key);
          return value ? Number(value) : undefined;
        } catch (error) {
          console.error('Error getting localStorage:', error);
          return undefined;
        }
      },
      getBoolean: (key: string) => {
        try {
          const value = localStorage.getItem(key);
          return value === 'true' ? true : value === 'false' ? false : undefined;
        } catch (error) {
          console.error('Error getting localStorage:', error);
          return undefined;
        }
      },
      delete: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error deleting localStorage:', error);
        }
      },
      contains: (key: string) => {
        try {
          return localStorage.getItem(key) !== null;
        } catch (error) {
          console.error('Error checking localStorage:', error);
          return false;
        }
      },
      clearAll: () => {
        try {
          localStorage.clear();
        } catch (error) {
          console.error('Error clearing localStorage:', error);
        }
      },
      getAllKeys: () => {
        try {
          return Object.keys(localStorage);
        } catch (error) {
          console.error('Error getting localStorage keys:', error);
          return [];
        }
      },
    };
  } else {
    // Native platforms use MMKV
    const { MMKV } = require('react-native-mmkv');
    storage = new MMKV({
      id: 'handygh-app-storage',
      encryptionKey: 'handygh-secure-key-2024', // In production, use a more secure key
    });
  }
} catch (error) {
  console.error('Error initializing storage:', error);
  // Fallback to in-memory storage if all else fails
  const memoryStorage = new Map<string, any>();
  storage = {
    set: (key: string, value: any) => memoryStorage.set(key, value),
    getString: (key: string) => {
      const value = memoryStorage.get(key);
      return typeof value === 'string' ? value : undefined;
    },
    getNumber: (key: string) => {
      const value = memoryStorage.get(key);
      return typeof value === 'number' ? value : undefined;
    },
    getBoolean: (key: string) => {
      const value = memoryStorage.get(key);
      return typeof value === 'boolean' ? value : undefined;
    },
    delete: (key: string) => memoryStorage.delete(key),
    contains: (key: string) => memoryStorage.has(key),
    clearAll: () => memoryStorage.clear(),
    getAllKeys: () => Array.from(memoryStorage.keys()),
  };
}

export { storage };

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

  /**
   * Get item (for Zustand persist compatibility)
   */
  static getItem(key: string): string | null {
    return storage.getString(key) ?? null;
  }

  /**
   * Set item (for Zustand persist compatibility)
   */
  static setItem(key: string, value: string): void {
    storage.set(key, value);
  }

  /**
   * Remove item (for Zustand persist compatibility)
   */
  static removeItem(key: string): void {
    storage.delete(key);
  }
}
