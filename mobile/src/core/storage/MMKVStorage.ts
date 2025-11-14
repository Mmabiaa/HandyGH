import { Platform } from 'react-native';

// In-memory storage fallback
const createMemoryStorage = () => {
  const memoryStorage = new Map<string, any>();
  return {
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
};

// Web fallback using localStorage
const createWebStorage = () => ({
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
});

// Lazy load storage - use AsyncStorage (Expo-compatible) as primary, MMKV as fallback
let storageInstance: any = null;

/**
 * Create AsyncStorage adapter (Expo-compatible)
 */
async function createAsyncStorage() {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const storage = AsyncStorage.default || AsyncStorage;

    return {
      set: async (key: string, value: any) => {
        try {
          const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
          await storage.setItem(key, stringValue);
        } catch (error) {
          console.error('[MMKVStorage] Error setting AsyncStorage:', error);
        }
      },
      getString: async (key: string) => {
        try {
          return await storage.getItem(key) ?? undefined;
        } catch (error) {
          console.error('[MMKVStorage] Error getting AsyncStorage:', error);
          return undefined;
        }
      },
      getNumber: async (key: string) => {
        try {
          const value = await storage.getItem(key);
          return value ? Number(value) : undefined;
        } catch (error) {
          console.error('[MMKVStorage] Error getting AsyncStorage:', error);
          return undefined;
        }
      },
      getBoolean: async (key: string) => {
        try {
          const value = await storage.getItem(key);
          return value === 'true' ? true : value === 'false' ? false : undefined;
        } catch (error) {
          console.error('[MMKVStorage] Error getting AsyncStorage:', error);
          return undefined;
        }
      },
      delete: async (key: string) => {
        try {
          await storage.removeItem(key);
        } catch (error) {
          console.error('[MMKVStorage] Error deleting AsyncStorage:', error);
        }
      },
      contains: async (key: string) => {
        try {
          const value = await storage.getItem(key);
          return value !== null;
        } catch (error) {
          console.error('[MMKVStorage] Error checking AsyncStorage:', error);
          return false;
        }
      },
      clearAll: async () => {
        try {
          await storage.clear();
        } catch (error) {
          console.error('[MMKVStorage] Error clearing AsyncStorage:', error);
        }
      },
      getAllKeys: async () => {
        try {
          return await storage.getAllKeys();
        } catch (error) {
          console.error('[MMKVStorage] Error getting AsyncStorage keys:', error);
          return [];
        }
      },
    };
  } catch (error) {
    console.warn('[MMKVStorage] AsyncStorage not available:', error);
    return null;
  }
}

async function getStorage() {
  if (storageInstance) {
    return storageInstance;
  }

  try {
    if (Platform.OS === 'web') {
      storageInstance = createWebStorage();
      return storageInstance;
    }

    // Try AsyncStorage first (Expo-compatible)
    const asyncStorage = await createAsyncStorage();
    if (asyncStorage) {
      storageInstance = asyncStorage;
      return storageInstance;
    }

    // Fallback to MMKV if available (for development builds)
    try {
      const { MMKV } = require('react-native-mmkv');
      storageInstance = new MMKV({
        id: 'handygh-app-storage',
        encryptionKey: 'handygh-secure-key-2024',
      });
      return storageInstance;
    } catch (mmkvError) {
      console.warn('[MMKVStorage] MMKV not available, using memory storage:', mmkvError);
      storageInstance = createMemoryStorage();
      return storageInstance;
    }
  } catch (error) {
    console.error('[MMKVStorage] Error initializing storage, using memory fallback:', error);
    storageInstance = createMemoryStorage();
    return storageInstance;
  }
}

// Export storage - note: methods are async for AsyncStorage compatibility
// For synchronous access, use the MMKVStorage class methods which handle async internally
export const storage = new Proxy({} as any, {
  get(_target, prop) {
    const instance = getStorage();
    const method = instance[prop as keyof typeof instance];
    // If it's a function and storage is async, wrap it to handle promises
    if (typeof method === 'function') {
      return (...args: any[]) => {
        const result = method.apply(instance, args);
        // If result is a promise, return it; otherwise return a resolved promise
        return result instanceof Promise ? result : Promise.resolve(result);
      };
    }
    return method;
  },
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
// Note: Methods handle both sync (MMKV) and async (AsyncStorage) storage transparently
export class MMKVStorage {
  /**
   * Set a string value
   */
  static async set(key: string, value: string): Promise<void> {
    const storage = await getStorage();
    await storage.set(key, value);
  }

  /**
   * Get a string value
   */
  static async getString(key: string): Promise<string | undefined> {
    const storage = await getStorage();
    return await storage.getString(key);
  }

  /**
   * Set a number value
   */
  static async setNumber(key: string, value: number): Promise<void> {
    const storage = await getStorage();
    await storage.set(key, value);
  }

  /**
   * Get a number value
   */
  static async getNumber(key: string): Promise<number | undefined> {
    const storage = await getStorage();
    return await storage.getNumber(key);
  }

  /**
   * Set a boolean value
   */
  static async setBoolean(key: string, value: boolean): Promise<void> {
    const storage = await getStorage();
    await storage.set(key, value);
  }

  /**
   * Get a boolean value
   */
  static async getBoolean(key: string): Promise<boolean | undefined> {
    const storage = await getStorage();
    return await storage.getBoolean(key);
  }

  /**
   * Set an object (will be JSON stringified)
   */
  static async setObject<T>(key: string, value: T): Promise<void> {
    const storage = await getStorage();
    await storage.set(key, JSON.stringify(value));
  }

  /**
   * Get an object (will be JSON parsed)
   */
  static async getObject<T>(key: string): Promise<T | undefined> {
    const storage = await getStorage();
    const value = await storage.getString(key);
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
  static async delete(key: string): Promise<void> {
    const storage = await getStorage();
    await storage.delete(key);
  }

  /**
   * Check if a key exists
   */
  static async contains(key: string): Promise<boolean> {
    const storage = await getStorage();
    return await storage.contains(key);
  }

  /**
   * Clear all storage
   */
  static async clearAll(): Promise<void> {
    const storage = await getStorage();
    await storage.clearAll();
  }

  /**
   * Get all keys
   */
  static async getAllKeys(): Promise<string[]> {
    const storage = await getStorage();
    return await storage.getAllKeys();
  }

  /**
   * Get item (for Zustand persist compatibility)
   */
  static async getItem(key: string): Promise<string | null> {
    const storage = await getStorage();
    const value = await storage.getString(key);
    return value ?? null;
  }

  /**
   * Set item (for Zustand persist compatibility)
   */
  static async setItem(key: string, value: string): Promise<void> {
    const storage = await getStorage();
    await storage.set(key, value);
  }

  /**
   * Remove item (for Zustand persist compatibility)
   */
  static async removeItem(key: string): Promise<void> {
    const storage = await getStorage();
    await storage.delete(key);
  }
}
