import { Platform } from 'react-native';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Web fallback storage
const WEB_STORAGE_KEY = 'handygh_auth_tokens';

export class SecureTokenStorage {
  private static readonly SERVICE_NAME = 'com.handygh.app';
  private static readonly USERNAME = 'auth_tokens';

  /**
   * Save authentication tokens securely using Keychain (native) or localStorage (web)
   */
  static async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web fallback using localStorage
        localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify({ accessToken, refreshToken }));
      } else {
        // Native platforms use Keychain
        const Keychain = require('react-native-keychain');
        await Keychain.setGenericPassword(
          this.USERNAME,
          JSON.stringify({ accessToken, refreshToken }),
          {
            service: this.SERVICE_NAME,
            accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
          }
        );
      }
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw new Error('Failed to save authentication tokens');
    }
  }

  /**
   * Retrieve authentication tokens from Keychain (native) or localStorage (web)
   */
  static async getTokens(): Promise<AuthTokens | null> {
    try {
      if (Platform.OS === 'web') {
        // Web fallback using localStorage
        const data = localStorage.getItem(WEB_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
      } else {
        // Native platforms use Keychain
        const Keychain = require('react-native-keychain');
        const credentials = await Keychain.getGenericPassword({
          service: this.SERVICE_NAME,
        });

        if (credentials && credentials.password) {
          return JSON.parse(credentials.password) as AuthTokens;
        }

        return null;
      }
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      return null;
    }
  }

  /**
   * Clear authentication tokens from Keychain (native) or localStorage (web)
   */
  static async clearTokens(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web fallback using localStorage
        localStorage.removeItem(WEB_STORAGE_KEY);
      } else {
        // Native platforms use Keychain
        const Keychain = require('react-native-keychain');
        await Keychain.resetGenericPassword({
          service: this.SERVICE_NAME,
        });
      }
    } catch (error) {
      console.error('Error clearing tokens:', error);
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
