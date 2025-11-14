# State Management

This directory contains the global state management implementation using Zustand with MMKV persistence.

## Stores

### Auth Store (`authStore.ts`)
Manages user authentication state including:
- User profile data
- Authentication status
- Login/logout actions
- Token management integration with SecureTokenStorage
- State hydration on app start

**Usage:**
```typescript
import { useAuthStore } from '@core/store';

const { user, isAuthenticated, login, logout } = useAuthStore();
```

### User Profile Store (`userProfileStore.ts`)
Manages customer and provider profile data including:
- Customer profile with favorites
- Provider business profile
- Profile updates
- Favorite providers management

**Usage:**
```typescript
import { useUserProfileStore } from '@core/store';

const { customerProfile, addFavoriteProvider, isFavoriteProvider } = useUserProfileStore();
```

### App Settings Store (`appSettingsStore.ts`)
Manages application preferences including:
- Theme (light/dark/system)
- Language
- Notification preferences
- Location permission
- Biometric authentication settings

**Usage:**
```typescript
import { useAppSettingsStore } from '@core/store';

const { preferences, setTheme, setNotificationsEnabled } = useAppSettingsStore();
```

## Storage

### MMKV Storage (`MMKVStorage.ts`)
Fast key-value storage for:
- Store persistence
- Cached data
- User preferences
- Offline queue

### Secure Token Storage (`SecureTokenStorage.ts`)
Hardware-backed secure storage for:
- Authentication tokens
- Refresh tokens
- Sensitive credentials

## Testing

All stores have comprehensive unit tests covering:
- State updates
- Actions
- Persistence
- Error handling

Run tests:
```bash
npm test -- src/core/store/__tests__
```
