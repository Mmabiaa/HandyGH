/**
 * Biometric Authentication Utility
 *
 * Provides biometric authentication functionality using Face ID,
 * Touch ID, or fingerprint authentication.
 *
 * Requirements: 13.5
 */

import * as LocalAuthentication from 'expo-local-authentication';

export type BiometryType = 'FaceID' | 'TouchID' | 'Fingerprint' | 'Iris' | null;

export interface BiometricAvailability {
  available: boolean;
  biometryType: BiometryType;
  error?: string;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

/**
 * BiometricAuth class for managing biometric authentication
 */
class BiometricAuthClass {
  /**
   * Check if biometric authentication is available on the device
   */
  async isAvailable(): Promise<BiometricAvailability> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();

      if (!hasHardware) {
        return {
          available: false,
          biometryType: null,
          error: 'Biometric hardware is not available on this device',
        };
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!isEnrolled) {
        return {
          available: false,
          biometryType: null,
          error: 'No biometric credentials are enrolled on this device',
        };
      }

      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const biometryType = this.getBiometryTypeFromSupported(supportedTypes);

      return {
        available: true,
        biometryType,
      };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return {
        available: false,
        biometryType: null,
        error: 'Failed to check biometric availability',
      };
    }
  }

  /**
   * Get biometry type from supported authentication types
   */
  private getBiometryTypeFromSupported(
    types: LocalAuthentication.AuthenticationType[]
  ): BiometryType {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'FaceID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Fingerprint';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    return null;
  }

  /**
   * Get the biometry type name for display
   */
  async getBiometryTypeName(): Promise<string> {
    const { available, biometryType } = await this.isAvailable();

    if (!available) {
      return 'Biometric Authentication';
    }

    switch (biometryType) {
      case 'FaceID':
        return 'Face ID';
      case 'TouchID':
        return 'Touch ID';
      case 'Fingerprint':
        return 'Fingerprint';
      case 'Iris':
        return 'Iris';
      default:
        return 'Biometric Authentication';
    }
  }

  /**
   * Authenticate user with biometrics
   */
  async authenticate(promptMessage?: string): Promise<BiometricAuthResult> {
    try {
      const { available } = await this.isAvailable();

      if (!available) {
        return {
          success: false,
          error: 'Biometric authentication is not available',
        };
      }

      const biometryTypeName = await this.getBiometryTypeName();

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || `Authenticate with ${biometryTypeName}`,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        return {
          success: true,
        };
      }

      // Handle different error types
      if (result.error === 'user_cancel') {
        return {
          success: false,
          error: 'Authentication cancelled',
        };
      }

      if (result.error === 'system_cancel') {
        return {
          success: false,
          error: 'Authentication cancelled by system',
        };
      }

      if (result.error === 'lockout') {
        return {
          success: false,
          error: 'Too many failed attempts. Please try again later.',
        };
      }

      if (result.error === 'not_enrolled') {
        return {
          success: false,
          error: 'No biometric credentials enrolled',
        };
      }

      return {
        success: false,
        error: 'Authentication failed. Please try again.',
      };
    } catch (error: any) {
      console.error('Biometric authentication error:', error);

      return {
        success: false,
        error: 'Authentication failed. Please try again.',
      };
    }
  }

  /**
   * Create biometric keys for secure operations
   * Note: expo-local-authentication doesn't support key creation
   * This is a placeholder for compatibility
   */
  async createKeys(): Promise<{ publicKey: string } | null> {
    console.log('[BiometricAuth] Key creation not supported with expo-local-authentication');
    return null;
  }

  /**
   * Delete biometric keys
   * Note: expo-local-authentication doesn't support key management
   * This is a placeholder for compatibility
   */
  async deleteKeys(): Promise<boolean> {
    console.log('[BiometricAuth] Key deletion not supported with expo-local-authentication');
    return true;
  }

  /**
   * Check if biometric keys exist
   * Note: expo-local-authentication doesn't support key management
   * This is a placeholder for compatibility
   */
  async biometricKeysExist(): Promise<boolean> {
    console.log('[BiometricAuth] Key checking not supported with expo-local-authentication');
    return false;
  }

  /**
   * Get security level of biometric authentication
   */
  async getSecurityLevel(): Promise<LocalAuthentication.SecurityLevel> {
    try {
      return await LocalAuthentication.getEnrolledLevelAsync();
    } catch (error) {
      console.error('Error getting security level:', error);
      return LocalAuthentication.SecurityLevel.NONE;
    }
  }
}

// Export singleton instance
export const BiometricAuth = new BiometricAuthClass();
