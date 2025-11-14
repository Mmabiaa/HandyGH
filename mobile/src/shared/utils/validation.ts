/**
 * Validation Utilities
 * Common validation functions for form inputs
 */

/**
 * Validates Ghana phone number format
 * Accepts formats: +233XXXXXXXXX, 233XXXXXXXXX, 0XXXXXXXXX
 * @param phoneNumber - Phone number to validate
 * @returns true if valid, false otherwise
 */
export const validateGhanaPhoneNumber = (phoneNumber: string): boolean => {
  // Remove all spaces and dashes
  const cleaned = phoneNumber.replace(/[\s-]/g, '');

  // Check for valid Ghana phone number patterns
  const patterns = [
    /^\+233\d{9}$/, // +233XXXXXXXXX
    /^233\d{9}$/, // 233XXXXXXXXX
    /^0\d{9}$/, // 0XXXXXXXXX
  ];

  return patterns.some(pattern => pattern.test(cleaned));
};

/**
 * Formats Ghana phone number to international format (+233XXXXXXXXX)
 * @param phoneNumber - Phone number to format
 * @returns Formatted phone number or original if invalid
 */
export const formatGhanaPhoneNumber = (phoneNumber: string): string => {
  // Remove all spaces and dashes
  const cleaned = phoneNumber.replace(/[\s-]/g, '');

  // Convert to international format
  if (cleaned.startsWith('+233')) {
    return cleaned;
  } else if (cleaned.startsWith('233')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+233${cleaned.substring(1)}`;
  }

  return phoneNumber;
};

/**
 * Formats phone number for display with spaces
 * @param phoneNumber - Phone number to format
 * @returns Formatted phone number (e.g., +233 24 123 4567)
 */
export const formatPhoneNumberDisplay = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/[\s-]/g, '');

  if (cleaned.startsWith('+233') && cleaned.length === 13) {
    return `+233 ${cleaned.substring(4, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`;
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `0${cleaned.substring(1, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }

  return phoneNumber;
};

/**
 * Validates email address format
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates that a string is not empty
 * @param value - String to validate
 * @returns true if not empty, false otherwise
 */
export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validates minimum length
 * @param value - String to validate
 * @param minLength - Minimum required length
 * @returns true if meets minimum length, false otherwise
 */
export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

/**
 * Validates maximum length
 * @param value - String to validate
 * @param maxLength - Maximum allowed length
 * @returns true if within maximum length, false otherwise
 */
export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.trim().length <= maxLength;
};
