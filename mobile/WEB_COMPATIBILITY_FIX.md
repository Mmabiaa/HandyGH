# Web Compatibility Fix for Secure Storage

## Problem
The app was crashing when running on web with the error:
```
TypeError: _ExpoSecureStore.default.getValueWithKeyAsync is not a function
```

## Root Cause
**Expo SecureStore only works on native platforms (iOS/Android)** and does not have web support. When running the app in a web browser, SecureStore APIs are not available, causing the app to crash.

## Solution
Created a **cross-platform storage adapter** (`secureStorage.ts`) that:
- Uses **SecureStore** on native platforms (iOS/Android) for encrypted storage
- Falls back to **AsyncStorage** on web for compatibility

## Files Changed

### 1. Created: `mobile/src/utils/secureStorage.ts`
A platform-aware storage adapter that automatically selects the appropriate storage mechanism:

```typescript
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isWeb = Platform.OS === 'web';

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  // ... getItem and deleteItem methods
};
```

### 2. Updated: `mobile/src/api/client.ts`
Replaced all `SecureStore` calls with `secureStorage`:
- Token storage
- Token retrieval
- Token deletion

### 3. Updated: `mobile/src/store/slices/authSlice.ts`
Replaced all `SecureStore` calls with `secureStorage`:
- OTP verification (token storage)
- Logout (token deletion)
- Load stored auth (token retrieval)

## Security Considerations

### Native Platforms (iOS/Android)
- Tokens are stored in **SecureStore** (encrypted keychain/keystore)
- Provides hardware-backed encryption
- Secure against device compromise

### Web Platform
- Tokens are stored in **AsyncStorage** (localStorage)
- **Not encrypted** - this is a limitation of web browsers
- Acceptable for development and testing
- For production web apps, consider:
  - Using HTTP-only cookies for tokens
  - Implementing additional security measures
  - Or focusing on native apps only

## Testing

### Web Browser
```bash
cd mobile
npm start
# Press 'w' to open in web browser
```

The app should now work without crashing when:
- Requesting OTP
- Verifying OTP
- Storing/retrieving tokens

### Native (iOS/Android)
```bash
cd mobile
npm start
# Press 'i' for iOS or 'a' for Android
```

Tokens will be stored securely using SecureStore.

## Recommendations

### For Development
- Web testing is now fully supported
- Use web for rapid UI development
- Test auth flow on native devices before production

### For Production
- **Recommended**: Deploy as native apps (iOS/Android) for best security
- **If web is required**: Implement additional security measures:
  - Short-lived tokens
  - Refresh token rotation
  - HTTP-only cookies
  - HTTPS only
  - Content Security Policy

## Future Improvements

1. **Add encryption for web storage**
   - Use Web Crypto API to encrypt tokens before storing
   - Decrypt on retrieval

2. **Implement token refresh strategy**
   - Short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days)
   - Automatic refresh before expiry

3. **Add biometric authentication**
   - Use Expo LocalAuthentication
   - Require biometric auth before accessing stored tokens

4. **Session management**
   - Track active sessions
   - Allow users to revoke sessions
   - Automatic logout on suspicious activity

## Related Files
- `mobile/src/utils/secureStorage.ts` - Storage adapter
- `mobile/src/api/client.ts` - API client with token management
- `mobile/src/store/slices/authSlice.ts` - Auth state management
- `mobile/DEBUG_AUTH_FLOW.md` - Debugging guide
