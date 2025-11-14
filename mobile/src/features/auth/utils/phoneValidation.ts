import {
  validateGhanaPhoneNumber,
  formatGhanaPhoneNumber,
  formatPhoneNumberDisplay,
} from '../../../shared/utils/validation';

/**
 * Phone Number Validation Utilities for Authentication
 * Requirement 1.4, 17.2: Ghana phone number validation
 */

/**
 * Validate phone number for authentication
 * Returns validation result with error message
 */
export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

/**
 * Validate and format phone number for authentication
 */
export const validatePhoneForAuth = (phoneNumber: string): PhoneValidationResult => {
  // Check if empty
  if (!phoneNumber || phoneNumber.trim().length === 0) {
    return {
      isValid: false,
      error: 'Phone number is required',
    };
  }

  // Remove spaces and dashes for validation
  const cleaned = phoneNumber.replace(/[\s-]/g, '');

  // Check minimum length
  if (cleaned.length < 10) {
    return {
      isValid: false,
      error: 'Phone number is too short',
    };
  }

  // Check maximum length
  if (cleaned.length > 13) {
    return {
      isValid: false,
      error: 'Phone number is too long',
    };
  }

  // Validate Ghana phone number format
  if (!validateGhanaPhoneNumber(cleaned)) {
    return {
      isValid: false,
      error: 'Invalid Ghana phone number format. Use +233 XX XXX XXXX',
    };
  }

  // Format to international format
  const formatted = formatGhanaPhoneNumber(cleaned);

  return {
    isValid: true,
    formatted,
  };
};

/**
 * Validate OTP code format
 */
export interface OTPValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate OTP code
 */
export const validateOTPCode = (code: string): OTPValidationResult => {
  // Check if empty
  if (!code || code.trim().length === 0) {
    return {
      isValid: false,
      error: 'OTP code is required',
    };
  }

  // Remove spaces
  const cleaned = code.replace(/\s/g, '');

  // Check if exactly 6 digits
  if (cleaned.length !== 6) {
    return {
      isValid: false,
      error: 'OTP code must be 6 digits',
    };
  }

  // Check if all characters are digits
  if (!/^\d{6}$/.test(cleaned)) {
    return {
      isValid: false,
      error: 'OTP code must contain only numbers',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Format phone number for display in OTP screen
 * Masks middle digits for security
 */
export const maskPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/[\s-]/g, '');

  if (cleaned.startsWith('+233') && cleaned.length === 13) {
    // Format: +233 XX XXX XXXX -> +233 XX *** XXXX
    return `+233 ${cleaned.substring(4, 6)} *** ${cleaned.substring(9)}`;
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    // Format: 0XX XXX XXXX -> 0XX *** XXXX
    return `0${cleaned.substring(1, 3)} *** ${cleaned.substring(6)}`;
  }

  return phoneNumber;
};

/**
 * Extract country code from phone number
 */
export const extractCountryCode = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/[\s-]/g, '');

  if (cleaned.startsWith('+233')) {
    return '+233';
  } else if (cleaned.startsWith('233')) {
    return '+233';
  } else if (cleaned.startsWith('0')) {
    return '+233';
  }

  return '+233'; // Default to Ghana
};

/**
 * Extract phone number without country code
 */
export const extractPhoneWithoutCountryCode = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/[\s-]/g, '');

  if (cleaned.startsWith('+233')) {
    return cleaned.substring(4);
  } else if (cleaned.startsWith('233')) {
    return cleaned.substring(3);
  } else if (cleaned.startsWith('0')) {
    return cleaned.substring(1);
  }

  return cleaned;
};

/**
 * Check if phone number is Ghana mobile number
 * Ghana mobile numbers start with specific prefixes
 */
export const isGhanaMobileNumber = (phoneNumber: string): boolean => {
  const cleaned = phoneNumber.replace(/[\s-]/g, '');
  const withoutCountryCode = extractPhoneWithoutCountryCode(cleaned);

  // Ghana mobile prefixes: 20, 23, 24, 25, 26, 27, 28, 29, 50, 54, 55, 56, 57, 59
  const mobilePrefix = withoutCountryCode.substring(0, 2);
  const validPrefixes = ['20', '23', '24', '25', '26', '27', '28', '29', '50', '54', '55', '56', '57', '59'];

  return validPrefixes.includes(mobilePrefix);
};

/**
 * Get mobile network operator from phone number
 */
export const getMobileOperator = (phoneNumber: string): string | null => {
  const cleaned = phoneNumber.replace(/[\s-]/g, '');
  const withoutCountryCode = extractPhoneWithoutCountryCode(cleaned);
  const prefix = withoutCountryCode.substring(0, 2);

  // MTN prefixes
  if (['24', '25', '54', '55', '59'].includes(prefix)) {
    return 'MTN';
  }

  // Vodafone prefixes
  if (['20', '50'].includes(prefix)) {
    return 'Vodafone';
  }

  // AirtelTigo prefixes
  if (['26', '27', '28', '56', '57'].includes(prefix)) {
    return 'AirtelTigo';
  }

  return null;
};

// Re-export shared validation functions
export { validateGhanaPhoneNumber, formatGhanaPhoneNumber, formatPhoneNumberDisplay };
