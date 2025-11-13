# HandyGH Mobile App - Developer Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator
- Expo Go app on your physical device (optional)

### Installation
```bash
cd mobile
npm install
```

### Running the App
```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## 📁 Project Structure

```
mobile/
├── src/
│   ├── api/                    # API client and endpoints
│   ├── components/             # Reusable UI components
│   │   ├── common/            # Button, Input, LoadingSpinner
│   │   └── cards/             # ServiceCard, ProviderCard, BookingCard
│   ├── constants/             # Theme, config, colors
│   ├── core/                  # React Query client
│   ├── features/              # Feature-based modules
│   │   ├── auth/             # Authentication
│   │   └── provider/         # Provider features
│   ├── navigation/            # Navigation configuration
│   │   ├── AppNavigator.tsx  # Root navigator
│   │   ├── AuthNavigator.tsx # Auth flow
│   │   ├── CustomerNavigator.tsx # Customer app
│   │   ├── ProviderNavigator.tsx # Provider app
│   │   └── types.ts          # Navigation types
│   ├── screens/               # Screen components
│   │   ├── auth/             # Authentication screens
│   │   ├── booking/          # Booking flow screens
│   │   ├── customer/         # Customer screens
│   │   ├── provider/         # Provider screens
│   │   └── shared/           # Shared screens
│   ├── store/                 # Redux store
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utility functions
├── scripts/                   # Build and generation scripts
└── App.tsx                    # App entry point
```

## 🎨 Adding a New Screen

### 1. Create the Screen Component
```typescript
// src/screens/customer/MyNewScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '@/constants/theme';

export const MyNewScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My New Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
});
```

### 2. Add to Navigation Types
```typescript
// src/navigation/types.ts
export type CustomerHomeStackParamList = {
  // ... existing screens
  MyNewScreen: { someParam?: string };
};
```

### 3. Add to Navigator
```typescript
// src/navigation/CustomerNavigator.tsx
import { MyNewScreen } from '@/screens/customer/MyNewScreen';

// In HomeStackNavigator:
<HomeStack.Screen 
  name="MyNewScreen" 
  component={MyNewScreen}
  options={{ title: 'My New Screen' }}
/>
```

### 4. Navigate to Screen
```typescript
// From any screen in the same stack:
navigation.navigate('MyNewScreen', { someParam: 'value' });
```

## 🎯 Navigation Patterns

### Tab Navigation
```typescript
// Navigate to a different tab
navigation.navigate('Bookings');
```

### Stack Navigation
```typescript
// Navigate within current stack
navigation.navigate('ProviderDetail', { providerId: '123' });

// Go back
navigation.goBack();

// Replace current screen
navigation.replace('Home');
```

### Modal Navigation
```typescript
// Open modal from Customer screens
navigation.navigate('BookingCreate', { providerId: '123' });

// Close modal
navigation.goBack();
```

### Deep Linking
```typescript
// Navigate to nested screen
navigation.navigate('Customer', {
  screen: 'Home',
  params: {
    screen: 'ProviderDetail',
    params: { providerId: '123' }
  }
});
```

## 🎨 Using UI Components

### ServiceCard
```typescript
import { ServiceCard } from '@/components/cards';

<ServiceCard
  id="1"
  name="House Cleaning"
  description="Professional house cleaning service"
  price={50}
  duration="2 hours"
  rating={4.5}
  reviewCount={120}
  onPress={() => navigation.navigate('ServiceDetail', { id: '1' })}
/>
```

### ProviderCard
```typescript
import { ProviderCard } from '@/components/cards';

<ProviderCard
  id="1"
  name="John Doe"
  businessName="John's Cleaning Services"
  rating={4.8}
  reviewCount={250}
  services={['Cleaning', 'Plumbing', 'Electrical']}
  distance="2.5 km"
  isVerified={true}
  isAvailable={true}
  onPress={() => navigation.navigate('ProviderDetail', { id: '1' })}
/>
```

### BookingCard
```typescript
import { BookingCard } from '@/components/cards';

<BookingCard
  id="1"
  providerName="John Doe"
  serviceName="House Cleaning"
  date={new Date()}
  time="10:00 AM"
  status="CONFIRMED"
  price={50}
  location="123 Main St, Accra"
  onPress={() => navigation.navigate('BookingDetails', { id: '1' })}
/>
```

## 🎨 Theme System

### Colors
```typescript
import { colors } from '@/constants/theme';

// Primary colors
colors.primary        // Main brand color
colors.primaryLight   // Light variant
colors.primaryDark    // Dark variant

// UI colors
colors.background     // Screen background
colors.surface        // Card/surface background
colors.border         // Border color

// Text colors
colors.text           // Primary text
colors.textSecondary  // Secondary text

// Status colors
colors.success        // Success state
colors.error          // Error state
colors.warning        // Warning state
colors.info           // Info state
```

### Typography
```typescript
import { typography } from '@/constants/theme';

// Headings
typography.h1         // Large heading
typography.h2         // Medium heading
typography.h3         // Small heading
typography.h4         // Extra small heading

// Body text
typography.body       // Regular body text
typography.caption    // Small text
```

## 🔄 State Management

### Redux (Global State)
```typescript
import { useAppDispatch, useAppSelector } from '@/store';
import { setUser } from '@/store/slices/userSlice';

// In component:
const dispatch = useAppDispatch();
const user = useAppSelector(state => state.user);

dispatch(setUser({ id: '1', name: 'John' }));
```

### React Query (Server State)
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { getProviders } from '@/api/providers';

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['providers'],
  queryFn: getProviders,
});

// Mutate data
const mutation = useMutation({
  mutationFn: createBooking,
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  },
});
```

## 🧪 Testing

### Run Tests
```bash
npm test
npm run test:watch
npm run test:coverage
```

### Writing Tests
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('handles press', () => {
    const onPress = jest.fn();
    const { getByText } = render(<MyComponent onPress={onPress} />);
    fireEvent.press(getByText('Button'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

## 🎬 Animations

### Using Reanimated
```typescript
import Animated, { 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: withSpring(isPressed ? 0.95 : 1) }],
}));

<Animated.View style={animatedStyle}>
  {/* Content */}
</Animated.View>
```

### Using Lottie
```typescript
import LottieView from 'lottie-react-native';

<LottieView
  source={require('@/assets/animations/loading.json')}
  autoPlay
  loop
  style={{ width: 200, height: 200 }}
/>
```

## 📱 Platform-Specific Code

```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    padding: Platform.select({
      ios: 20,
      android: 16,
      web: 24,
    }),
  },
});

// Or inline
{Platform.OS === 'ios' && <IOSOnlyComponent />}
```

## 🔧 Debugging

### React Native Debugger
1. Install React Native Debugger
2. Run app in development mode
3. Shake device or press Cmd+D (iOS) / Cmd+M (Android)
4. Select "Debug"

### Flipper
1. Install Flipper desktop app
2. Run app in development mode
3. Flipper will auto-connect
4. Use Network, Layout, and Redux plugins

### Console Logs
```typescript
console.log('Debug:', data);
console.warn('Warning:', error);
console.error('Error:', error);
```

## 📦 Building for Production

### iOS
```bash
# Build for TestFlight
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### Android
```bash
# Build APK
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

## 🚀 Performance Tips

1. **Use FlatList for long lists**
   ```typescript
   <FlatList
     data={items}
     renderItem={({ item }) => <ItemCard item={item} />}
     keyExtractor={item => item.id}
     removeClippedSubviews
     maxToRenderPerBatch={10}
     windowSize={5}
   />
   ```

2. **Memoize expensive components**
   ```typescript
   const MemoizedComponent = React.memo(MyComponent);
   ```

3. **Use useCallback for functions**
   ```typescript
   const handlePress = useCallback(() => {
     // Handle press
   }, [dependencies]);
   ```

4. **Optimize images**
   ```typescript
   <Image
     source={{ uri: imageUrl }}
     resizeMode="cover"
     style={{ width: 100, height: 100 }}
   />
   ```

## 📚 Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Run linter: `npm run lint`
5. Run tests: `npm test`
6. Create pull request

## 📝 Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages
- Add comments for complex logic
- Keep components small and focused
