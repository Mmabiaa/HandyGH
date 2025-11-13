import Constants from 'expo-constants';

/**
 * App Configuration
 */
export const Config = {
  // API Configuration
  API_BASE_URL: Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:8000/api/v1',
  API_TIMEOUT: 30000,

  // App Information
  APP_NAME: 'HandyGH',
  APP_VERSION: Constants.expoConfig?.version || '1.0.0',

  // Environment
  IS_DEV: __DEV__,
  IS_PROD: !__DEV__,

  // Feature Flags
  ENABLE_BIOMETRIC_AUTH: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true,

  // Map Configuration
  DEFAULT_LATITUDE: 5.6037, // Accra, Ghana
  DEFAULT_LONGITUDE: -0.1870,
  DEFAULT_SEARCH_RADIUS: 10, // km

  // Pagination
  DEFAULT_PAGE_SIZE: 20,

  // Timeouts
  OTP_RESEND_TIMEOUT: 60, // seconds
  SESSION_TIMEOUT: 30, // minutes

  // File Upload
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],

  // Currency
  CURRENCY_CODE: 'GHS',
  CURRENCY_SYMBOL: '₵',

  // Date/Time Format
  DATE_FORMAT: 'MMM dd, yyyy',
  TIME_FORMAT: 'hh:mm a',
  DATETIME_FORMAT: 'MMM dd, yyyy hh:mm a',

  // Support
  SUPPORT_EMAIL: 'support@handygh.com',
  SUPPORT_PHONE: '+233XXXXXXXXX',

  // Social Media
  FACEBOOK_URL: 'https://facebook.com/handygh',
  TWITTER_URL: 'https://twitter.com/handygh',
  INSTAGRAM_URL: 'https://instagram.com/handygh',

  // Legal
  TERMS_URL: 'https://handygh.com/terms',
  PRIVACY_URL: 'https://handygh.com/privacy',
};

export default Config;
