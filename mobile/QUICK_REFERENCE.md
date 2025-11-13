# HandyGH Mobile - Quick Reference

## 🚀 Quick Commands

```bash
# Start development
npm start

# Run on device
npm run ios          # iOS
npm run android      # Android
npm run web          # Web

# Code quality
npm run lint         # Check linting
npm run lint:fix     # Fix linting issues
npm run format       # Format code
npm run type-check   # Check TypeScript

# Testing
npm test             # Run tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## 📱 Screen Count

- **Total Screens**: 77
- **Auth Flow**: 8 screens
- **Customer Journey**: 32 screens
- **Provider Journey**: 34 screens
- **Shared Screens**: 9 screens

## 🗂️ File Locations

### Screens
```
src/screens/
├── auth/          # 8 auth screens
├── booking/       # 12 booking flow screens
├── customer/      # 21 customer screens
├── provider/      # 23 provider screens
└── shared/        # 9 shared screens
```

### Navigation
```
src/navigation/
├── AppNavigator.tsx       # Root navigator
├── AuthNavigator.tsx      # Auth flow
├── CustomerNavigator.tsx  # Customer app (4 tabs)
├── ProviderNavigator.tsx  # Provider app (5 tabs)
└── types.ts              # All navigation types
```

### Components
```
src/components/
├── cards/
│   ├── ServiceCard.tsx
│   ├── ProviderCard.tsx
│   └── BookingCard.tsx
└── common/
    ├── Button.tsx
    ├── Input.tsx
    └── LoadingSpinner.tsx
```

## 🎨 Theme Quick Access

```typescript
import { colors, typography } from '@/constants/theme';

// Colors
colors.primary          // #01ce42ff
colors.background       // #FFFFFF
colors.text            // #111827
colors.textSecondary   // #6B7280

// Typography
typography.h1          // 32px, bold
typography.h2          // 28px, bold
typography.h3          // 24px, semibold
typography.body1       // 16px, regular
typography.caption     // 12px, regular
```

## 🧭 Navigation Examples

### Navigate to Screen
```typescript
// Same stack
navigation.navigate('ProviderDetail', { providerId: '123' });

// Different tab
navigation.navigate('Bookings');

// Modal
navigation.navigate('BookingCreate', { providerId: '123' });

// Nested
navigation.navigate('Customer', {
  screen: 'Home',
  params: { screen: 'ProviderDetail', params: { providerId: '123' } }
});
```

### Go Back
```typescript
navigation.goBack();
navigation.pop();
navigation.popToTop();
```

## 🎯 Common Patterns

### Screen Template
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '@/constants/theme';

export const MyScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Screen</Text>
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

### API Call with React Query
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['providers'],
  queryFn: () => api.get('/providers'),
});
```

### Redux State
```typescript
import { useAppSelector, useAppDispatch } from '@/store';

const user = useAppSelector(state => state.user);
const dispatch = useAppDispatch();
```

## 📦 Component Usage

### ServiceCard
```typescript
<ServiceCard
  id="1"
  name="House Cleaning"
  description="Professional cleaning"
  price={50}
  duration="2 hours"
  rating={4.5}
  reviewCount={120}
  onPress={() => {}}
/>
```

### ProviderCard
```typescript
<ProviderCard
  id="1"
  name="John Doe"
  rating={4.8}
  reviewCount={250}
  services={['Cleaning', 'Plumbing']}
  distance="2.5 km"
  isVerified={true}
  isAvailable={true}
  onPress={() => {}}
/>
```

### BookingCard
```typescript
<BookingCard
  id="1"
  providerName="John Doe"
  serviceName="House Cleaning"
  date={new Date()}
  time="10:00 AM"
  status="CONFIRMED"
  price={50}
  location="123 Main St"
  onPress={() => {}}
/>
```

## 🔧 Useful Hooks

```typescript
// Navigation
import { useNavigation, useRoute } from '@react-navigation/native';
const navigation = useNavigation();
const route = useRoute();

// State
import { useState, useEffect, useCallback, useMemo } from 'react';

// Redux
import { useAppSelector, useAppDispatch } from '@/store';

// React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
```

## 🎬 Animation Snippets

```typescript
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withTiming 
} from 'react-native-reanimated';

const animatedStyle = useAnimatedStyle(() => ({
  opacity: withTiming(visible ? 1 : 0),
  transform: [{ scale: withSpring(pressed ? 0.95 : 1) }],
}));
```

## 📱 Platform Checks

```typescript
import { Platform } from 'react-native';

Platform.OS === 'ios'
Platform.OS === 'android'
Platform.OS === 'web'

Platform.select({
  ios: 20,
  android: 16,
  web: 24,
})
```

## 🐛 Debug Commands

```typescript
// Console
console.log('Debug:', data);
console.warn('Warning:', error);
console.error('Error:', error);

// React Native Debugger
// Cmd+D (iOS) / Cmd+M (Android) → Debug

// Performance
import { InteractionManager } from 'react-native';
InteractionManager.runAfterInteractions(() => {
  // Heavy task
});
```

## 📊 Status Values

### Booking Status
```typescript
type BookingStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED';
```

### User Roles
```typescript
type UserRole = 'CUSTOMER' | 'PROVIDER';
```

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | App entry point |
| `src/navigation/AppNavigator.tsx` | Root navigation |
| `src/navigation/types.ts` | Navigation types |
| `src/constants/theme.ts` | Theme & colors |
| `src/store/index.ts` | Redux store |
| `src/api/client.ts` | API client |

## 📚 Documentation

- [Complete Implementation](./COMPLETE_SCREENS_IMPLEMENTATION.md)
- [Implementation Plan](./COMPLETE_SCREENS_IMPLEMENTATION_PLAN.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Setup Guide](./SETUP_GUIDE.md)

## 🆘 Common Issues

### Metro bundler issues
```bash
# Clear cache
npm start -- --reset-cache

# Clean install
rm -rf node_modules
npm install
```

### iOS build issues
```bash
cd ios
pod install
cd ..
```

### TypeScript errors
```bash
npm run type-check
```

## 🎉 Quick Wins

1. **Add a new screen**: Copy template, add to navigator, add to types
2. **Style a component**: Use `colors` and `typography` from theme
3. **Navigate**: Use `navigation.navigate('ScreenName', params)`
4. **Fetch data**: Use `useQuery` from React Query
5. **Global state**: Use `useAppSelector` and `useAppDispatch`

---

**Happy Coding! 🚀**
