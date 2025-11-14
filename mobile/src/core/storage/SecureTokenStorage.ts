import { Platform } from 'react-native';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Web fallback storage
const WEB_STORAGE_KEY = 'handygh_auth_tokens';
const SECURE_STORAGE_KEY = 'handygh_auth_tokens';

/**
 * Lazy load expo-secure-store (Expo-compatible secure storage)
 */
async function getSecureStore() {
  try {
    const SecureStore = await import('expo-secure-store');
    return SecureStore.default || SecureStore;
  } catch (error) {
    console.warn('[SecureTokenStorage] expo-secure-store not available:', error);
    return null;
  }
}

export class SecureTokenStorage {
  /**
   * Save authentication tokens securely using Expo SecureStore (native) or localStorage (web)
   */
  static async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web fallback using localStorage
        localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify({ accessToken, refreshToken }));
      } else {
        // Native platforms use Expo SecureStore - lazy load with error handling
        try {
          const SecureStore = await getSecureStore();
          if (SecureStore) {
            await SecureStore.setItemAsync(
              SECURE_STORAGE_KEY,
              JSON.stringify({ accessToken, refreshToken })
            );
            return;
          }
        } catch (secureStoreError) {
          console.warn('[SecureTokenStorage] SecureStore not available, using fallback:', secureStoreError);
        }

        // Fallback to localStorage if SecureStore is not available (e.g., in Expo Go without secure store)
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify({ accessToken, refreshToken }));
        } else {
          throw new Error('No storage mechanism available');
        }
      }
    } catch (error) {
      console.error('[SecureTokenStorage] Error saving tokens:', error);
      throw new Error('Failed to save authentication tokens');
    }
  }

  /**
   * Retrieve authentication tokens from Expo SecureStore (native) or localStorage (web)
   */
  static async getTokens(): Promise<AuthTokens | null> {
    try {
      if (Platform.OS === 'web') {
        // Web fallback using localStorage
        const data = localStorage.getItem(WEB_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
      } else {
        // Native platforms use Expo SecureStore - lazy load with error handling
        try {
          const SecureStore = await getSecureStore();
          if (SecureStore) {
            const data = await SecureStore.getItemAsync(SECURE_STORAGE_KEY);
            return data ? JSON.parse(data) : null;
          }
        } catch (secureStoreError) {
          console.warn('[SecureTokenStorage] SecureStore not available, trying localStorage fallback:', secureStoreError);
        }

        // Fallback to localStorage if SecureStore is not available
        if (typeof localStorage !== 'undefined') {
          const data = localStorage.getItem(WEB_STORAGE_KEY);
          return data ? JSON.parse(data) : null;
        }

        return null;
      }
    } catch (error) {
      console.error('[SecureTokenStorage] Error retrieving tokens:', error);
      return null;
    }
  }

  /**
   * Clear authentication tokens from Expo SecureStore (native) or localStorage (web)
   */
  static async clearTokens(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web fallback using localStorage
        localStorage.removeItem(WEB_STORAGE_KEY);
      } else {
        // Native platforms use Expo SecureStore - lazy load with error handling
        try {
          const SecureStore = await getSecureStore();
          if (SecureStore) {
            await SecureStore.deleteItemAsync(SECURE_STORAGE_KEY);
            return;
          }
        } catch (secureStoreError) {
          console.warn('[SecureTokenStorage] SecureStore not available, using localStorage fallback:', secureStoreError);
        }

        // Fallback to localStorage if SecureStore is not available
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(WEB_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('[SecureTokenStorage] Error clearing tokens:', error);
      throw new Error('Failed to clear authentication tokens');
    }
  }

  /**
   * Check if tokens exist in Keychain (native) or localStorage (web)
   */
  static async hasTokens(): Promise<boolean> {
    const tokens = await this.getTokens();
    return tokens !== null;
  }
}
