# Web Platform Support

## Issue
The app was crashing on web platform with error:
```
Cannot read properties of undefined (reading 'getEnforcing')
```

## Root Cause
Several native modules don't work on web platform:
- `react-native-mmkv` - Native key-value storage
- `react-native-keychain` - Secure credential storage  
- `react-native-sqlite-storage` - SQLite database

These modules were being imported and initialized immediately, causing crashes when running on web.

## Solution
Added platform-specific implementations with web fallbacks:

### 1. MMKVStorage (`mobile/src/core/storage/MMKVStorage.ts`)
- **Web**: Uses `localStorage` API
- **Native**: Uses `react-native-mmkv`
- **Fallback**: In-memory Map if both fail

### 2. SecureTokenStorage (`mobile/src/core/storage/SecureTokenStorage.ts`)
- **Web**: Uses `localStorage` (less secure, but functional for development)
- **Native**: Uses `react-native-keychain` with hardware security

### 3. DatabaseManager (`mobile/src/core/storage/database/DatabaseManager.ts`)
- **Web**: Skips SQLite initialization (returns null)
- **Native**: Uses `react-native-sqlite-storage`

### 4. AppInitializer (`mobile/src/core/initialization/AppInitializer.ts`)
- New utility to handle platform-specific initialization
- Called during splash screen to set up native modules
- Gracefully handles errors without crashing

## Usage

The app now works on all platforms:
- **iOS**: Full native functionality
- **Android**: Full native functionality
- **Web**: Functional with localStorage fallbacks

## Development

To run on web:
```bash
npm start
# Then press 'w' for web
```

To run on native:
```bash
npm run android
# or
npm run ios
```

## Production Considerations

For production web deployment:
1. Consider using IndexedDB instead of localStorage for better performance
2. Implement proper encryption for sensitive data on web
3. Add service workers for offline support
4. Use Web SQL or IndexedDB for database functionality

## Security Note

⚠️ **Warning**: The web fallback stores tokens in localStorage, which is less secure than native Keychain. For production:
- Use secure HTTP-only cookies for authentication
- Implement proper CSRF protection
- Consider using Web Crypto API for encryption
