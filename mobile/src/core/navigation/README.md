# Navigation Module

This module contains all navigation-related code for the HandyGH Mobile Application, including navigators, types, utilities, and deep linking configuration.

## Structure

```
navigation/
├── types.ts                  # TypeScript type definitions for all navigators
├── RootNavigator.tsx         # Root stack navigator (Splash, Auth, Main)
├── AuthNavigator.tsx         # Authentication flow navigator
├── MainNavigator.tsx         # Main app navigator (routes to Customer/Provider)
├── CustomerTabNavigator.tsx  # Customer bottom tab navigator
├── ProviderTabNavigator.tsx  # Provider bottom tab navigator
├── navigationRef.ts          # Navigation reference for programmatic navigation
├── linking.ts                # Deep linking configuration
├── navigationGuards.ts       # Authentication and role-based guards
├── transitions.ts            # Screen transition animations
└── README.md                 # This file
```

## Navigation Hierarchy

```
RootNavigator
├── Splash
├── Auth (AuthNavigator)
│   ├── Welcome
│   ├── PhoneInput
│   ├── OTPVerification
│   ├── RoleSelection
│   ├── ProfileSetup
│   └── ProviderOnboarding
└── Main (MainNavigator)
    ├── CustomerTabs (CustomerTabNavigator)
    │   ├── Home
    │   ├── Bookings
    │   ├── Favorites
    │   ├── Messages
    │   └── Profile
    └── ProviderTabs (ProviderTabNavigator)
        ├── Dashboard
        ├── Calendar
        ├── Earnings
        ├── Messages
        └── Profile
```

## Usage

### Type-Safe Navigation

All navigation is fully typed using TypeScript:

```typescript
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from './types';

const MyComponent = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // Navigate with type-safe parameters
  navigation.navigate('Auth', { screen: 'PhoneInput' });
  navigation.navigate('Main', { 
    screen: 'CustomerTabs', 
    params: { screen: 'Home' } 
  });
};
```

### Programmatic Navigation

Use the navigation ref to navigate from outside React components:

```typescript
import { navigate, goBack, resetNavigation } from './navigationRef';

// Navigate to a screen
navigate('Auth', { screen: 'Welcome' });

// Go back
goBack();

// Reset navigation (e.g., on logout)
resetNavigation('Auth', { screen: 'Welcome' });
```

### Deep Linking

The app supports deep linking for various screens:

**Supported URL patterns:**
- `handygh://provider/:providerId` - View provider details
- `handygh://booking/:bookingId` - View booking details
- `handygh://chat/:bookingId` - Open booking chat
- `handygh://category/:categoryId` - View providers by category
- `https://handygh.com/provider/:providerId` - Web deep link
- `https://handygh.com/booking/:bookingId` - Web deep link

**Generate deep links:**
```typescript
import { generateDeepLink } from './linking';

const link = generateDeepLink('ProviderDetail', { providerId: '123' });
// Returns: https://handygh.com/provider/123
```

**Validate deep links:**
```typescript
import { validateDeepLink } from './linking';

const isValid = validateDeepLink('https://handygh.com/provider/123');
// Returns: true (trusted domain)

const isInvalid = validateDeepLink('https://malicious.com/provider/123');
// Returns: false (untrusted domain)
```

### Navigation Guards

Protect routes with authentication and role-based guards:

```typescript
import { useAuthGuard, useRoleGuard, useGuestGuard } from './navigationGuards';

// Protect authenticated routes
const MyScreen = () => {
  useAuthGuard(authStatus); // Redirects to auth if not authenticated
  return <View>...</View>;
};

// Protect role-specific routes
const ProviderScreen = () => {
  useRoleGuard(userRole, 'provider'); // Redirects if not a provider
  return <View>...</View>;
};

// Redirect authenticated users away from auth screens
const WelcomeScreen = () => {
  useGuestGuard(authStatus, userRole); // Redirects to home if authenticated
  return <View>...</View>;
};
```

### Screen Transitions

Apply custom transitions to screens:

```typescript
import { transitionPresets, getTransitionForScreen } from './transitions';

// In navigator configuration
<Stack.Screen
  name="ProviderDetail"
  component={ProviderDetailScreen}
  options={transitionPresets.detail}
/>

// Or get transition dynamically
<Stack.Screen
  name="PaymentMethod"
  component={PaymentMethodScreen}
  options={getTransitionForScreen('modal')}
/>
```

**Available transition presets:**
- `auth` - Fade transition for auth screens
- `main` - Standard slide for main navigation
- `detail` - Standard slide for detail screens
- `modal` - Slide from bottom for modals
- `overlay` - Transparent modal for overlays
- `settings` - Fade for settings screens
- `booking` - Custom slide for booking flow
- `chat` - Standard slide for chat screens
- `payment` - Modal for payment screens

## Adding New Screens

1. **Add screen type to appropriate ParamList in `types.ts`:**
```typescript
export type CustomerStackParamList = {
  // ... existing screens
  NewScreen: {
    param1: string;
    param2?: number;
  };
};
```

2. **Create the screen component:**
```typescript
// src/features/customer/screens/NewScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import type { CustomerStackParamList } from '../../../core/navigation/types';

type NewScreenRouteProp = RouteProp<CustomerStackParamList, 'NewScreen'>;

interface Props {
  route: NewScreenRouteProp;
}

const NewScreen: React.FC<Props> = ({ route }) => {
  const { param1, param2 } = route.params;
  return <View><Text>New Screen</Text></View>;
};

export default NewScreen;
```

3. **Add screen to navigator:**
```typescript
// In CustomerTabNavigator.tsx or appropriate navigator
<Stack.Screen
  name="NewScreen"
  component={NewScreen}
  options={transitionPresets.detail}
/>
```

## Requirements Coverage

This navigation implementation satisfies the following requirements:

- **1.1, 1.2, 1.3**: Auth flow screens (Splash, Welcome, PhoneInput, OTP, etc.)
- **11.7**: Screen transition animations with 300ms duration
- **13.9**: Deep linking configuration and validation to prevent malicious attacks

## Future Enhancements

- Add screen-specific navigation options (headers, gestures)
- Implement navigation analytics tracking
- Add navigation state persistence for app restarts
- Create navigation testing utilities
- Add more transition presets for specific use cases
