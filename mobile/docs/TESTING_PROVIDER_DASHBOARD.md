# Testing the Provider Dashboard

This guide explains how to run and test the Provider Dashboard screen in the HandyGH mobile app.

## Prerequisites

1. **Install Dependencies**
   ```bash
   cd mobile
   npm install
   ```

2. **Install Expo Go on Your Phone**
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

3. **Backend API Running**
   - Make sure your backend API is running and accessible
   - Update the API base URL in `mobile/src/core/api/client.ts` if needed

## Running the App

### Start the Development Server

```bash
cd mobile
npm start
```

Or with cache clearing:

```bash
npx expo start --clear --no-web
```

### Scan QR Code

1. Open Expo Go app on your phone
2. Scan the QR code shown in the terminal
3. Wait for the app to load

## Accessing the Provider Dashboard

The Provider Dashboard is accessible to users with the "Provider" role. Here's how to access it:

### Option 1: Through Authentication Flow

1. **Complete Registration**
   - Enter a Ghana phone number (+233 XX XXX XXXX)
   - Verify OTP code
   - **Select "Provider" role** (important!)
   - Complete profile setup

2. **Navigate to Dashboard**
   - After authentication, providers should see the dashboard
   - Or navigate through the app menu to "Dashboard"

### Option 2: Direct Navigation (For Testing)

If you need to test the dashboard directly without full authentication:

1. **Create a Test Navigation Route**
   
   Add this to your navigation setup temporarily:

   ```typescript
   // In your navigator file
   import ProviderDashboardScreen from '../features/provider/screens/ProviderDashboardScreen';

   <Stack.Screen 
     name="ProviderDashboard" 
     component={ProviderDashboardScreen}
     options={{ title: 'Dashboard' }}
   />
   ```

2. **Add a Test Button**
   
   Add a button in your app to navigate directly:

   ```typescript
   <Button onPress={() => navigation.navigate('ProviderDashboard')}>
     Test Provider Dashboard
   </Button>
   ```

## Testing Features

### 1. Key Metrics Display

**What to Test:**
- Total Earnings displays correctly
- Active Bookings count shows
- Pending Requests count shows
- Average Rating displays with decimal

**Expected Behavior:**
- Metrics load from API
- Loading skeleton shows while fetching
- Error state if API fails
- Tap on metrics navigates to detail screens

### 2. Earnings Trend Chart

**What to Test:**
- Chart displays 30-day earnings data
- Line chart renders correctly
- Y-axis shows min, mid, max values
- X-axis shows date labels
- Total and average earnings display

**Expected Behavior:**
- Chart updates when data changes
- Empty state shows if no data
- Loading state while fetching
- Responsive to screen size

### 3. Upcoming Bookings

**What to Test:**
- Upcoming bookings list displays
- Customer name and avatar show
- Service details are correct
- Date, time, and duration display
- Location information shows
- Booking amount displays

**Expected Behavior:**
- Shows up to 3 bookings initially
- "View More" button if more than 3
- Empty state if no bookings
- Tap on booking navigates to details

### 4. Quick Actions

**What to Test:**
- "View Requests" button works
- "Calendar" button works
- "Earnings" button works

**Expected Behavior:**
- Buttons navigate to respective screens
- Haptic feedback on tap (mobile only)

### 5. Pull-to-Refresh

**What to Test:**
- Pull down on the screen
- Refresh indicator shows
- Data reloads

**Expected Behavior:**
- Smooth animation
- Data updates after refresh
- Loading indicator disappears when done

## Testing with Mock Data

If you don't have a backend API running, you can test with mock data:

### Create Mock Data Hook

Create `mobile/src/core/query/hooks/useDashboard.mock.ts`:

```typescript
import { UseQueryResult } from '@tanstack/react-query';
import { DashboardData } from '../../api/services/ProviderDashboardService';

export const useDashboardData = (): UseQueryResult<DashboardData> => {
  return {
    data: {
      metrics: {
        totalEarnings: 2450.50,
        activeBookingsCount: 5,
        pendingRequestsCount: 3,
        averageRating: 4.7,
        completedServicesCount: 127,
        responseRate: 95,
      },
      earningsTrend: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        amount: Math.random() * 200 + 50,
      })),
      upcomingBookings: [
        {
          id: '1',
          customerId: 'c1',
          customerName: 'John Doe',
          serviceId: 's1',
          serviceName: 'Plumbing Repair',
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          scheduledTime: '10:00',
          duration: 60,
          totalAmount: 150,
          location: {
            address: '123 Main St',
            city: 'Accra',
          },
        },
        {
          id: '2',
          customerId: 'c2',
          customerName: 'Jane Smith',
          serviceId: 's2',
          serviceName: 'Electrical Work',
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          scheduledTime: '14:00',
          duration: 90,
          totalAmount: 200,
          location: {
            address: '456 Oak Ave',
            city: 'Kumasi',
          },
        },
      ],
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: async () => ({ data: undefined }),
  } as any;
};
```

Then temporarily import the mock in `ProviderDashboardScreen.tsx`:

```typescript
// Replace this line:
import { useDashboardData } from '../../../core/query/hooks/useDashboard';

// With this:
import { useDashboardData } from '../../../core/query/hooks/useDashboard.mock';
```

## Common Issues

### 1. "Unable to load dashboard"

**Cause:** API not accessible or authentication token missing

**Solution:**
- Check if backend API is running
- Verify API base URL in `client.ts`
- Ensure user is authenticated as a provider
- Check network connectivity

### 2. Charts not displaying

**Cause:** No earnings data or data format issue

**Solution:**
- Check API response format matches `EarningsTrend[]`
- Verify dates are in correct format (YYYY-MM-DD)
- Check console for errors

### 3. Navigation errors

**Cause:** Navigation routes not set up

**Solution:**
- Ensure all navigation screens are registered
- Check navigation types are correct
- Verify navigation stack includes provider screens

### 4. Refresh not working

**Cause:** Query invalidation issue

**Solution:**
- Check React Query is properly configured
- Verify query keys are correct
- Check network requests in dev tools

## Performance Testing

### Check Rendering Performance

1. Open React DevTools
2. Enable "Highlight Updates"
3. Interact with the dashboard
4. Verify only necessary components re-render

### Check Network Performance

1. Open Network tab in dev tools
2. Pull to refresh
3. Verify API calls are made correctly
4. Check response times

### Check Memory Usage

1. Navigate to dashboard
2. Pull to refresh multiple times
3. Navigate away and back
4. Check for memory leaks in dev tools

## Accessibility Testing

### Screen Reader

1. Enable TalkBack (Android) or VoiceOver (iOS)
2. Navigate through the dashboard
3. Verify all elements are announced correctly
4. Check button labels are descriptive

### Touch Targets

1. Verify all buttons are at least 44x44 points
2. Check spacing between interactive elements
3. Test with different screen sizes

## Next Steps

After testing the dashboard:

1. Test navigation to other provider screens
2. Test real-time updates (if implemented)
3. Test with different data scenarios (empty, error, large datasets)
4. Test on different devices and screen sizes
5. Test in different network conditions

## Debugging Tips

### Enable Debug Logging

Add this to see what's happening:

```typescript
// In ProviderDashboardScreen.tsx
useEffect(() => {
  console.log('Dashboard data:', data);
  console.log('Loading:', isLoading);
  console.log('Error:', error);
}, [data, isLoading, error]);
```

### Check React Query DevTools

Install React Query DevTools for better debugging:

```bash
npm install @tanstack/react-query-devtools
```

### Monitor Network Requests

Use React Native Debugger or Flipper to monitor API calls.

## Need Help?

If you encounter issues:

1. Check the console for error messages
2. Verify all dependencies are installed
3. Clear cache: `npx expo start --clear`
4. Check the implementation docs: `PROVIDER_DASHBOARD_IMPLEMENTATION.md`
5. Review the requirements: `.kiro/specs/react-native-mobile-app/requirements.md`
