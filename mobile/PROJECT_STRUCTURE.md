# HandyGH Mobile - Project Structure

## Overview

This document describes the complete project structure and organization of the HandyGH Mobile application.

## Directory Structure

```
mobile/
├── android/                    # Android native code
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/handygh/mobile/
│   │   │   │   ├── MainActivity.kt
│   │   │   │   └── MainApplication.kt
│   │   │   ├── res/
│   │   │   └── AndroidManifest.xml
│   │   ├── build.gradle
│   │   └── proguard-rules.pro
│   ├── build.gradle
│   ├── settings.gradle
│   └── gradle.properties
│
├── ios/                        # iOS native code
│   ├── HandyGHMobile/
│   │   └── Info.plist
│   └── Podfile
│
├── src/                        # Application source code
│   ├── core/                   # Core infrastructure
│   │   ├── api/                # API client and services
│   │   │   ├── client.ts       # Axios instance configuration
│   │   │   ├── interceptors.ts # Request/response interceptors
│   │   │   └── services/       # API service modules
│   │   │       ├── auth.service.ts
│   │   │       ├── provider.service.ts
│   │   │       ├── booking.service.ts
│   │   │       └── payment.service.ts
│   │   │
│   │   ├── navigation/         # Navigation configuration
│   │   │   ├── RootNavigator.tsx
│   │   │   ├── AuthNavigator.tsx
│   │   │   ├── CustomerNavigator.tsx
│   │   │   ├── ProviderNavigator.tsx
│   │   │   └── types.ts
│   │   │
│   │   ├── storage/            # Storage utilities
│   │   │   ├── SecureStorage.ts    # Keychain wrapper
│   │   │   ├── FastStorage.ts      # MMKV wrapper
│   │   │   └── Database.ts         # SQLite wrapper
│   │   │
│   │   └── theme/              # Theme and design system
│   │       ├── colors.ts
│   │       ├── typography.ts
│   │       ├── spacing.ts
│   │       └── ThemeProvider.tsx
│   │
│   ├── features/               # Feature modules
│   │   ├── auth/               # Authentication feature
│   │   │   ├── screens/
│   │   │   │   ├── SplashScreen.tsx
│   │   │   │   ├── WelcomeScreen.tsx
│   │   │   │   ├── PhoneInputScreen.tsx
│   │   │   │   ├── OTPVerificationScreen.tsx
│   │   │   │   ├── RoleSelectionScreen.tsx
│   │   │   │   ├── ProfileSetupScreen.tsx
│   │   │   │   └── ProviderOnboardingScreen.tsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useOTP.ts
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   │   └── authStore.ts
│   │   │   └── types/
│   │   │
│   │   ├── booking/            # Booking feature
│   │   │   ├── screens/
│   │   │   │   ├── ServiceSelectionScreen.tsx
│   │   │   │   ├── DateTimeSelectionScreen.tsx
│   │   │   │   ├── LocationSelectionScreen.tsx
│   │   │   │   ├── BookingSummaryScreen.tsx
│   │   │   │   ├── PaymentMethodScreen.tsx
│   │   │   │   ├── MobileMoneyPaymentScreen.tsx
│   │   │   │   ├── BookingConfirmationScreen.tsx
│   │   │   │   ├── BookingListScreen.tsx
│   │   │   │   ├── BookingDetailsScreen.tsx
│   │   │   │   └── BookingChatScreen.tsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   │
│   │   ├── customer/           # Customer features
│   │   │   ├── screens/
│   │   │   │   ├── HomeScreen.tsx
│   │   │   │   ├── SearchScreen.tsx
│   │   │   │   ├── ProviderListScreen.tsx
│   │   │   │   ├── ProviderDetailScreen.tsx
│   │   │   │   ├── ProviderReviewsScreen.tsx
│   │   │   │   ├── MapViewScreen.tsx
│   │   │   │   ├── FavoritesScreen.tsx
│   │   │   │   ├── ProfileScreen.tsx
│   │   │   │   └── SettingsScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── ProviderCard.tsx
│   │   │   │   ├── CategoryGrid.tsx
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   └── ReviewCard.tsx
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   │
│   │   └── provider/           # Provider features
│   │       ├── screens/
│   │       │   ├── ProviderDashboardScreen.tsx
│   │       │   ├── BookingRequestsScreen.tsx
│   │       │   ├── ProviderCalendarScreen.tsx
│   │       │   ├── ServiceExecutionScreen.tsx
│   │       │   ├── PaymentRequestScreen.tsx
│   │       │   ├── EarningsScreen.tsx
│   │       │   ├── PerformanceAnalyticsScreen.tsx
│   │       │   └── BankingScreen.tsx
│   │       ├── components/
│   │       ├── hooks/
│   │       └── types/
│   │
│   └── shared/                 # Shared resources
│       ├── components/         # Reusable UI components
│       │   ├── Button.tsx
│       │   ├── TextInput.tsx
│       │   ├── Card.tsx
│       │   ├── LoadingSkeleton.tsx
│       │   ├── ErrorBoundary.tsx
│       │   └── Toast.tsx
│       │
│       ├── hooks/              # Custom hooks
│       │   ├── useNetworkStatus.ts
│       │   ├── useDebounce.ts
│       │   └── useKeyboard.ts
│       │
│       ├── utils/              # Utility functions
│       │   ├── validation.ts
│       │   ├── formatting.ts
│       │   ├── date.ts
│       │   └── error.ts
│       │
│       └── types/              # TypeScript types
│           ├── api.types.ts
│           ├── navigation.types.ts
│           └── common.types.ts
│
├── App.tsx                     # Root component
├── index.js                    # Entry point
├── app.json                    # App configuration
│
├── babel.config.js             # Babel configuration
├── metro.config.js             # Metro bundler configuration
├── tsconfig.json               # TypeScript configuration
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Jest setup file
├── .eslintrc.js                # ESLint configuration
├── .prettierrc.js              # Prettier configuration
├── .gitignore                  # Git ignore rules
│
├── package.json                # Dependencies and scripts
├── README.md                   # Project overview
├── SETUP.md                    # Setup instructions
└── PROJECT_STRUCTURE.md        # This file

```

## Key Architectural Decisions

### 1. Feature-Based Organization

The project uses a feature-based structure where each major feature (auth, booking, customer, provider) has its own directory containing:
- **screens/**: Screen components for that feature
- **components/**: Feature-specific components
- **hooks/**: Custom hooks for business logic
- **services/**: API service methods
- **store/**: State management (Zustand stores)
- **types/**: TypeScript type definitions

### 2. Core Infrastructure

The `src/core/` directory contains cross-cutting concerns:
- **api/**: Centralized API client configuration
- **navigation/**: Navigation setup and configuration
- **storage/**: Storage abstractions (Keychain, MMKV, SQLite)
- **theme/**: Design system and theming

### 3. Shared Resources

The `src/shared/` directory contains reusable code:
- **components/**: UI components used across features
- **hooks/**: Generic custom hooks
- **utils/**: Utility functions
- **types/**: Common TypeScript types

### 4. State Management Strategy

- **Zustand**: Global app state (auth, user profile, settings)
- **React Query**: Server state with caching and synchronization
- **Context API**: Theme and localization
- **Local State**: Component-specific UI state

### 5. Path Aliases

TypeScript and Babel are configured with path aliases for clean imports:

```typescript
import { Button } from '@shared/components/Button';
import { useAuth } from '@features/auth/hooks/useAuth';
import { apiClient } from '@core/api/client';
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `Button.tsx`, `ProviderCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`, `useProviders.ts`)
- **Services**: camelCase with `.service` suffix (e.g., `auth.service.ts`)
- **Stores**: camelCase with `Store` suffix (e.g., `authStore.ts`)
- **Types**: camelCase with `.types` suffix (e.g., `api.types.ts`)
- **Utils**: camelCase (e.g., `validation.ts`, `formatting.ts`)
- **Tests**: Same name as file with `.test` suffix (e.g., `Button.test.tsx`)

## Code Organization Best Practices

### 1. Component Structure

```typescript
// Imports
import React from 'react';
import { View, Text } from 'react-native';

// Types
interface Props {
  title: string;
  onPress: () => void;
}

// Component
export const MyComponent: React.FC<Props> = ({ title, onPress }) => {
  // Hooks
  const [state, setState] = useState();
  
  // Handlers
  const handlePress = () => {
    // logic
  };
  
  // Render
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  // styles
});
```

### 2. Service Structure

```typescript
// Types
interface ServiceRequest {
  // request types
}

interface ServiceResponse {
  // response types
}

// Service class
class MyService {
  async getData(): Promise<ServiceResponse> {
    // implementation
  }
}

// Export singleton
export const myService = new MyService();
```

### 3. Hook Structure

```typescript
// Types
interface HookOptions {
  // options
}

interface HookReturn {
  // return values
}

// Hook
export const useMyHook = (options: HookOptions): HookReturn => {
  // implementation
  
  return {
    // return values
  };
};
```

## Testing Structure

Tests are co-located with the code they test in `__tests__` directories:

```
src/
├── features/
│   └── auth/
│       ├── hooks/
│       │   ├── __tests__/
│       │   │   └── useAuth.test.ts
│       │   └── useAuth.ts
│       └── screens/
│           ├── __tests__/
│           │   └── LoginScreen.test.tsx
│           └── LoginScreen.tsx
```

## Next Steps

1. Implement Phase 1 tasks (Project Foundation)
2. Set up navigation architecture
3. Implement API client and services
4. Build authentication flow
5. Continue with remaining phases

Refer to `.kiro/specs/react-native-mobile-app/tasks.md` for the complete implementation plan.
