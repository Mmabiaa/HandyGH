# HandyGH Mobile Application

A cross-platform React Native mobile application connecting customers with verified service providers in Ghana.

## Technology Stack

- **Framework**: React Native 0.76.5 with Hermes engine
- **Language**: TypeScript 5.7+ with strict mode
- **Navigation**: React Navigation 6.x
- **State Management**: Zustand (global state) + React Query (server state)
- **Animations**: React Native Reanimated 3.x
- **Storage**: React Native MMKV + React Native Keychain
- **API Client**: Axios

## Project Structure

```
mobile/
├── src/
│   ├── core/           # Core infrastructure
│   │   ├── api/        # API client and services
│   │   ├── navigation/ # Navigation configuration
│   │   ├── storage/    # Storage utilities
│   │   └── theme/      # Theme and design system
│   ├── features/       # Feature modules
│   │   ├── auth/       # Authentication
│   │   ├── booking/    # Booking management
│   │   ├── customer/   # Customer features
│   │   └── provider/   # Provider features
│   └── shared/         # Shared resources
│       ├── components/ # Reusable UI components
│       ├── hooks/      # Custom hooks
│       ├── utils/      # Utility functions
│       └── types/      # TypeScript types
├── android/            # Android native code
├── ios/                # iOS native code
└── App.tsx             # Root component
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- For iOS: Xcode 14+ and CocoaPods
- For Android: Android Studio and JDK 17

### Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS, install CocoaPods dependencies:
```bash
cd ios && pod install && cd ..
```

### Running the App

#### iOS
```bash
npm run ios
```

#### Android
```bash
npm run android
```

### Development

#### Start Metro bundler
```bash
npm start
```

#### Run tests
```bash
npm test
```

#### Type checking
```bash
npm run typecheck
```

#### Linting
```bash
npm run lint
```

## Configuration

### TypeScript
- Strict mode enabled for maximum type safety
- Path aliases configured for clean imports:
  - `@/*` → `src/*`
  - `@features/*` → `src/features/*`
  - `@shared/*` → `src/shared/*`
  - `@core/*` → `src/core/*`

### Metro Bundler
- Inline requires enabled for better performance
- Optimized for code splitting

### Hermes Engine
- Enabled by default for optimal performance
- Provides faster startup times and reduced memory usage

## Performance Requirements

- 60fps animations using Reanimated worklets
- Screen load time < 500ms
- Time to interactive < 2 seconds
- Peak memory usage < 100MB

## Code Quality

- ESLint with React Native config
- Prettier for code formatting
- Jest for unit testing with 90% coverage target
- TypeScript strict mode enforced

## Next Steps

Refer to `.kiro/specs/react-native-mobile-app/tasks.md` for the complete implementation plan.
