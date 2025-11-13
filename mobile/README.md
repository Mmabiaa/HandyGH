# HandyGH Mobile App

React Native mobile application for the HandyGH local services marketplace platform.

## 📱 Overview

HandyGH Mobile is a cross-platform mobile application (iOS & Android) that connects customers with local service providers in Ghana. Built with React Native and Expo for rapid development and deployment.

## ✨ Features

### Customer Features
- 🔐 Phone-based OTP authentication
- 🔍 Search and discover local service providers
- 📍 Location-based provider search
- 📅 Book services with scheduling
- 💳 Mobile Money payment integration
- 💬 In-app messaging with providers
- ⭐ Rate and review services
- 📱 Push notifications for booking updates
- 🎫 Booking history and management

### Provider Features
- 📝 Provider profile management
- 🛠️ Service catalog management
- 📊 Booking management dashboard
- ✅ Accept/decline booking requests
- 💰 Earnings and transaction history
- 📨 Customer communication
- 📸 Service photo uploads
- 📈 Performance analytics

## 🛠 Technology Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: Redux Toolkit + RTK Query
- **UI Components**: React Native Paper
- **Forms**: React Hook Form + Zod
- **Maps**: React Native Maps
- **Notifications**: Expo Notifications
- **Storage**: AsyncStorage
- **API Client**: Axios
- **Date/Time**: date-fns
- **Icons**: React Native Vector Icons

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio
- Expo Go app on physical device (for testing)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# API Configuration
API_BASE_URL=http://localhost:8000/api/v1
API_TIMEOUT=30000

# App Configuration
APP_NAME=HandyGH
APP_VERSION=1.0.0

# Feature Flags
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_ANALYTICS=false

# Development
DEBUG_MODE=true
```

### 3. Start Development Server

```bash
npm start
```

This will start the Expo development server. You can then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan QR code with Expo Go app on your phone

### 4. Run on Specific Platform

```bash
# iOS
npm run ios

# Android
npm run android

# Web (for testing)
npm run web
```

## 📁 Project Structure

```
mobile/
├── src/
│   ├── api/                    # API client and endpoints
│   │   ├── client.ts          # Axios configuration
│   │   ├── auth.ts            # Authentication endpoints
│   │   ├── providers.ts       # Provider endpoints
│   │   ├── bookings.ts        # Booking endpoints
│   │   └── payments.ts        # Payment endpoints
│   │
│   ├── components/            # Reusable components
│   │   ├── common/           # Common UI components
│   │   ├── auth/             # Auth-related components
│   │   ├── booking/          # Booking components
│   │   └── provider/         # Provider components
│   │
│   ├── screens/              # Screen components
│   │   ├── auth/            # Authentication screens
│   │   ├── customer/        # Customer screens
│   │   ├── provider/        # Provider screens
│   │   └── shared/          # Shared screens
│   │
│   ├── navigation/           # Navigation configuration
│   │   ├── AppNavigator.tsx # Main navigator
│   │   ├── AuthNavigator.tsx # Auth flow
│   │   ├── CustomerNavigator.tsx # Customer flow
│   │   └── ProviderNavigator.tsx # Provider flow
│   │
│   ├── store/               # Redux store
│   │   ├── index.ts        # Store configuration
│   │   ├── slices/         # Redux slices
│   │   └── api/            # RTK Query APIs
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts     # Authentication hook
│   │   ├── useLocation.ts # Location hook
│   │   └── useNotifications.ts # Notifications hook
│   │
│   ├── utils/              # Utility functions
│   │   ├── validation.ts  # Form validation
│   │   ├── formatting.ts  # Data formatting
│   │   └── storage.ts     # AsyncStorage helpers
│   │
│   ├── constants/          # App constants
│   │   ├── colors.ts      # Color palette
│   │   ├── typography.ts  # Typography styles
│   │   └── config.ts      # App configuration
│   │
│   ├── types/              # TypeScript types
│   │   ├── api.ts         # API types
│   │   ├── models.ts      # Data models
│   │   └── navigation.ts  # Navigation types
│   │
│   └── assets/             # Static assets
│       ├── images/        # Images
│       ├── icons/         # Icons
│       └── fonts/         # Custom fonts
│
├── App.tsx                 # App entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── .env.example           # Environment template
```

## 🎨 Design System

### Colors
```typescript
const colors = {
  primary: '#2563EB',      // Blue
  secondary: '#10B981',    // Green
  accent: '#F59E0B',       // Amber
  error: '#EF4444',        // Red
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Amber
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#111827',
  textSecondary: '#6B7280',
};
```

### Typography
- **Headings**: Inter Bold
- **Body**: Inter Regular
- **Captions**: Inter Medium

## 🔐 Authentication Flow

1. **Phone Input** → User enters phone number
2. **OTP Request** → Backend sends OTP via SMS
3. **OTP Verification** → User enters OTP code
4. **Token Storage** → JWT tokens stored securely
5. **Auto-login** → Refresh token for seamless experience

## 📱 Key Screens

### Customer App
1. **Onboarding** - Welcome and intro
2. **Auth** - Phone + OTP login
3. **Home** - Search and browse providers
4. **Provider Details** - View provider profile and services
5. **Booking** - Create and manage bookings
6. **Payment** - Mobile Money payment
7. **Messages** - Chat with providers
8. **Profile** - User profile and settings

### Provider App
1. **Dashboard** - Overview of bookings and earnings
2. **Bookings** - Manage booking requests
3. **Services** - Manage service catalog
4. **Earnings** - Transaction history
5. **Profile** - Provider profile management
6. **Messages** - Customer communication

## 🔌 API Integration

The app connects to your Django backend:

```typescript
// Example API call
import { api } from '@/api/client';

const searchProviders = async (params) => {
  const response = await api.get('/providers/', { params });
  return response.data;
};
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📦 Building for Production

### Android

```bash
# Build APK
expo build:android -t apk

# Build AAB (for Play Store)
expo build:android -t app-bundle
```

### iOS

```bash
# Build for App Store
expo build:ios -t archive
```

## 🚀 Deployment

### Expo Updates (OTA)

```bash
# Publish update
expo publish
```

### App Stores

1. **Google Play Store**
   - Build AAB
   - Upload to Play Console
   - Submit for review

2. **Apple App Store**
   - Build IPA
   - Upload to App Store Connect
   - Submit for review

## 🔧 Development Tips

### Hot Reload
- Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
- Enable Fast Refresh in settings

### Debugging
- Use React Native Debugger
- Enable Remote JS Debugging
- Use Flipper for advanced debugging

### Performance
- Use `React.memo` for expensive components
- Implement virtualized lists with `FlatList`
- Optimize images with proper sizing
- Use `useMemo` and `useCallback` appropriately

## 📚 Documentation

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Email: support@handygh.com
- Documentation: [Full Docs](../docs/)
- Issues: [GitHub Issues](https://github.com/yourusername/handygh/issues)

---

**Built with ❤️ for the Ghanaian local services community**
