/**
 * Formatting Utilities
 *
 * Provides formatting functions for currency, dates, phone numbers, etc.
 * Follows Ghana regional conventions.
 */

/**
 * Format currency amount in Ghana Cedis (GHS)
 * Requirement 17.1: Display currency in GHS with proper formatting
 *
 * @param amount - The amount to format
 * @param currency - Currency code (default: 'GHS')
 * @returns Formatted currency string (e.g., "GH₵ 150.00")
 */
export const formatCurrency = (amount: number, currency: string = 'GHS'): string => {
  if (currency !== 'GHS') {
    return `${currency} ${amount.toFixed(2)}`;
  }

  // Format with Ghana Cedis symbol
  return `GH₵ ${amount.toFixed(2)}`;
};

/**
 * Format phone number according to Ghana conventions
 * Requirement 17.2: Format phone numbers as +233 XX XXX XXXX
 *
 * @param phoneNumber - Phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // Handle Ghana phone numbers
  if (digits.startsWith('233')) {
    const number = digits.substring(3);
    if (number.length === 9) {
      return `+233 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`;
    }
  }

  // Return original if format doesn't match
  return phoneNumber;
};

/**
 * Format date according to Ghana timezone (GMT)
 * Requirement 17.3: Display dates in Ghana timezone
 *
 * @param date - Date to format
 * @param format - Format type ('short', 'long', 'time')
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date,
  format: 'short' | 'long' | 'time' = 'short'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Africa/Accra', // Ghana timezone (GMT)
  };

  switch (format) {
    case 'short':
      options.year = 'numeric';
      options.month = 'short';
      options.day = 'numeric';
      break;
    case 'long':
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      options.weekday = 'long';
      break;
    case 'time':
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
  }

  return dateObj.toLocaleString('en-GH', options);
};

/**
 * Format time in 12-hour format
 *
 * @param time - Time string in HH:mm format
 * @returns Formatted time (e.g., "10:00 AM")
 */
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Format distance in kilometers
 * Requirement 17.8: Use kilometers for distance measurements
 *
 * @param distanceInKm - Distance in kilometers
 * @returns Formatted distance string
 */
export const formatDistance = (distanceInKm: number): string => {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m`;
  }
  return `${distanceInKm.toFixed(1)} km`;
};

/**
 * Format duration in minutes to human-readable format
 *
 * @param minutes - Duration in minutes
 * @returns Formatted duration (e.g., "1h 30min" or "45 min")
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Format rating with one decimal place
 *
 * @param rating - Rating value
 * @returns Formatted rating string
 */
export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

/**
 * Format large numbers with abbreviations
 *
 * @param num - Number to format
 * @returns Formatted number (e.g., "1.2K", "3.5M")
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Format percentage
 *
 * @param value - Value between 0 and 1
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};
