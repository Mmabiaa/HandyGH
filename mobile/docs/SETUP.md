# HandyGH Mobile - Setup Guide

This guide will help you set up the HandyGH Mobile application development environment.

## Prerequisites

### Required Software

1. **Node.js** (>= 18.0.0)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** or **yarn**
   - npm comes with Node.js
   - Verify: `npm --version`

3. **Watchman** (recommended for macOS/Linux)
   - macOS: `brew install watchman`
   - Improves file watching performance

### iOS Development (macOS only)

1. **Xcode** (>= 14.0)
   - Install from Mac App Store
   - Install Command Line Tools: `xcode-select --install`

2. **CocoaPods** (>= 1.13)
   - Install: `sudo gem install cocoapods`
   - Verify: `pod --version`

### Android Development

1. **Android Studio** (latest stable)
   - Download from: https://developer.android.com/studio
   - Install Android SDK (API 34)
   - Install Android SDK Build-Tools 34.0.0

2. **Java Development Kit (JDK 17)**
   - Download from: https://adoptium.net/
   - Set JAVA_HOME environment variable

3. **Environment Variables**
   Add to your shell profile (~/.bashrc, ~/.zshrc, etc.):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
   # or
   export ANDROID_HOME=$HOME/Android/Sdk  # Linux
   # or
   export ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk  # Windows

   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## Installation Steps

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### 3. Android Setup

No additional setup required. Gradle will download dependencies on first build.

## Running the Application

### Start Metro Bundler

In the mobile directory:
```bash
npm start
```

### Run on iOS

In a new terminal:
```bash
npm run ios
```

Or specify a device:
```bash
npm run ios -- --simulator="iPhone 15 Pro"
```

### Run on Android

Make sure you have an Android emulator running or a device connected.

In a new terminal:
```bash
npm run android
```

## Development Workflow

### Type Checking

Run TypeScript compiler in watch mode:
```bash
npm run typecheck
```

### Linting

Check code quality:
```bash
npm run lint
```

Fix auto-fixable issues:
```bash
npm run lint -- --fix
```

### Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## Project Configuration

### TypeScript

- **Strict mode enabled**: All type checking rules are enforced
- **Path aliases configured**:
  - `@/*` → `src/*`
  - `@features/*` → `src/features/*`
  - `@shared/*` → `src/shared/*`
  - `@core/*` → `src/core/*`

### Metro Bundler

- Inline requires enabled for better performance
- Configured for optimal code splitting

### Hermes Engine

- **Enabled by default** for both iOS and Android
- Provides faster startup and reduced memory usage
- To disable (not recommended):
  - iOS: Set `hermes_enabled` to `false` in Podfile
  - Android: Set `hermesEnabled=false` in gradle.properties

## Troubleshooting

### iOS Build Issues

1. **Pod install fails**
   ```bash
   cd ios
   pod deintegrate
   pod install
   ```

2. **Xcode build fails**
   - Clean build folder: Product → Clean Build Folder (Cmd+Shift+K)
   - Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`

### Android Build Issues

1. **Gradle sync fails**
   ```bash
   cd android
   ./gradlew clean
   ```

2. **Metro bundler connection issues**
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```

### Metro Bundler Issues

1. **Clear cache**
   ```bash
   npm start -- --reset-cache
   ```

2. **Port already in use**
   ```bash
   npx react-native start --port 8082
   ```

## Performance Optimization

### Development

- Use Hermes engine (enabled by default)
- Enable inline requires (configured in metro.config.js)
- Use FlashList instead of FlatList for long lists

### Production

- Enable ProGuard for Android (configured in build.gradle)
- Use release builds for testing performance
- Profile with React DevTools Profiler

## Next Steps

1. Review the project structure in README.md
2. Check the implementation plan in `.kiro/specs/react-native-mobile-app/tasks.md`
3. Start implementing features following the task list

## Useful Commands

```bash
# Clean everything and reinstall
rm -rf node_modules ios/Pods
npm install
cd ios && pod install && cd ..

# Reset Metro bundler
npm start -- --reset-cache

# Run on specific iOS device
npm run ios -- --device "Your Device Name"

# Run Android in release mode
npm run android -- --variant=release

# Generate APK
cd android && ./gradlew assembleRelease

# Generate iOS archive
# Use Xcode: Product → Archive
```

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
