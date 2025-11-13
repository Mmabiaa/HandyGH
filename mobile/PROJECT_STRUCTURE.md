# HandyGH Mobile App - Project Structure

## Overview

This document describes the project structure and organization of the HandyGH mobile application.

## Directory Structure

```
mobile/
├── src/
│   ├── api/                    # API client and endpoints
│   │   ├── client.ts          # Axios client with interceptors
│   │   └── auth.ts            # Authentication API endpoints
│   │
│   ├── components/            # Reusable components
│   │   └── common/           # Common UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── constants/            # App constants and configuration
│   │   ├── theme.ts         # Theme configuration (colors, typography, spacing)
│   │   └── config.ts        # App configuration and environment variables
│   │
│   ├── navigation/          # Navigation configuration
│   │   ├── AppNavigator.tsx # Main app navigator
│   │   ├── AuthNavigator.tsx # Auth stack navigator
│   │   ├── CustomerNavigator.tsx # Customer tab navigator
│   │   ├── ProviderNavigator.tsx # Provider tab navigator
│   │   ├── linking.ts       # Deep linking configuration
│   │   └── types.ts         # Navigation type definitions
│   │
│   ├── screens/             # Screen components
│   │   ├── auth/           # Authentication screens
│   │   │   ├── OnboardingScreen.tsx
│   │   │   ├── PhoneInputScreen.tsx
│   │   │   ├── OTPVerificationScreen.tsx
│   │   │   └── RoleSelectionScreen.tsx
│   │   ├── customer/       # Customer screens
│   │   │   ├── HomeScreen.tsx
│   │   │   └── BookingsScreen.tsx
│   │   ├── provider/       # Provider screens
│   │   │   └── DashboardScreen.tsx
│   │   └── shared/         # Shared screens
│   │       └── ProfileScreen.tsx
│   │
│   ├── store/              # Redux store configuration
│   │   ├── index.ts       # Store setup with Redux Persist
│   │   └── slices/        # Redux slices
│   │       ├── authSlice.ts
│   │       ├── userSlice.ts
│   │       ├── providerSlice.ts
│   │       └── bookingSlice.ts
│   │
│   ├── types/              # TypeScript type definitions
│   │   └── api.ts         # API response types
│   │
│   └── utils/              # Utility functions
│       └── errorHandler.ts # Error handling utilities
│
├── App.tsx                 # Root component
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
├── .eslintrc.js          # ESLint configuration
└── .prettierrc.js        # Prettier configuration
```

## Architecture Patterns

### Feature-Based Organization

The project follows a feature-based architecture where code is organized by feature rather than by technical layer. This makes it easier to:
- Locate related code
- Scale the application
- Maintain feature isolation

### State Management

- **Redux Toolkit**: For global state management
- **Redux Persist**: For persisting auth state across app restarts
- **Typed Hooks**: Custom typed hooks (useAppDispatch, useAppSelector) for type safety

### Navigation

- **React Navigation**: For app navigation
- **Stack Navigator**: For auth flow
- **Bottom Tab Navigator**: For main app (Customer/Provider)
- **Deep Linking**: Configured for handling deep links

### API Integration

- **Axios**: HTTP client with interceptors
- **Token Management**: Automatic token refresh on 401 errors
- **Secure Storage**: Using Expo SecureStore for token storage

### Styling

- **React Native Paper**: Material Design components
- **Custom Theme**: Centralized theme configuration
- **Styled Components**: Reusable styled components

## Key Features

### 1. Authentication Flow
- Phone number + OTP authentication
- Secure token storage
- Automatic token refresh
- Role-based navigation (Customer/Provider)

### 2. Error Handling
- Global error boundary
- API error handling utilities
- User-friendly error messages

### 3. Type Safety
- TypeScript strict mode
- Typed navigation
- Typed Redux hooks
- API response types

### 4. Code Quality
- ESLint for linting
- Prettier for code formatting
- TypeScript for type checking

## Development Guidelines

### Adding a New Screen

1. Create screen component in appropriate directory (`screens/auth`, `screens/customer`, etc.)
2. Add screen to navigation types in `navigation/types.ts`
3. Add screen to appropriate navigator
4. Update deep linking configuration if needed

### Adding a New API Endpoint

1. Define types in `types/api.ts`
2. Create API function in appropriate file in `api/` directory
3. Use in Redux slice or component

### Adding a New Redux Slice

1. Create slice in `store/slices/`
2. Add reducer to store in `store/index.ts`
3. Export typed hooks if needed

### Styling Guidelines

- Use theme constants from `constants/theme.ts`
- Create reusable components in `components/common/`
- Follow Material Design principles
- Use StyleSheet.create for performance

## Environment Configuration

Environment variables are configured in:
- `.env` - Local development
- `app.json` - Expo configuration
- `constants/config.ts` - App configuration

## Testing

- Unit tests: `npm test`
- Type checking: `npm run type-check`
- Linting: `npm run lint`
- Format: `npm run format`

## Next Steps

1. Implement authentication screens (Task 2)
2. Implement customer home and search (Task 3)
3. Implement provider profile management (Task 4)
4. Continue with remaining tasks as per tasks.md
