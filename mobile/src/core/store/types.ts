// User types
export interface User {
  id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  profilePhoto?: string;
  role: 'customer' | 'provider';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfile extends User {
  role: 'customer';
  favoriteProviders: string[];
  defaultLocation?: {
    address: string;
    city: string;
    region: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface ProviderProfile extends User {
  role: 'provider';
  businessName: string;
  businessDescription: string;
  coverPhoto?: string;
  categories: string[];
  rating: number;
  totalReviews: number;
  totalServices: number;
  responseRate: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en';
  notificationsEnabled: boolean;
  notificationCategories: {
    bookings: boolean;
    messages: boolean;
    promotions: boolean;
  };
  locationPermission: boolean;
  biometricEnabled: boolean;
}

// Offline action queue
export interface OfflineAction {
  id: string;
  type: 'create_booking' | 'update_booking' | 'send_message' | 'favorite_provider';
  payload: any;
  timestamp: number;
  retryCount: number;
}
