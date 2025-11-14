# Notifications Module

This module provides push notification functionality for the HandyGH mobile application using Expo Notifications.

## Features

- Push notification support (iOS & Android)
- Local notification scheduling
- Notification permissions management
- Badge count management
- Notification preferences/categories
- Deep linking from notifications

## Setup

### 1. Initialize Notifications

Notifications are automatically initialized in `AppInitializer`. The initialization:
- Requests notification permissions
- Registers for push notifications
- Gets the Expo push token
- Sets up notification listeners

### 2. Configure App

The `app.json` file includes notification configuration:

```json
{
  "notification": {
    "icon": "./assets/notification-icon.png",
    "color": "#000000"
  },
  "plugins": [
    ["expo-notifications", { ... }]
  ]
}
```

## Usage

### Basic Setup in App

```typescript
import { useNotificationSetup, useNotificationNavigation } from '@/core/notifications';

function App() {
  // Initialize notifications
  const { pushToken, isInitialized } = useNotificationSetup();
  
  // Handle notification navigation
  useNotificationNavigation();
  
  // Send push token to backend
  useEffect(() => {
    if (pushToken) {
      // Send to your backend
      api.updatePushToken(pushToken);
    }
  }, [pushToken]);
  
  return <YourApp />;
}
```

### Check Permissions

```typescript
import { useNotificationPermissions } from '@/core/notifications';

function SettingsScreen() {
  const { isEnabled, requestPermissions } = useNotificationPermissions();
  
  const handleEnableNotifications = async () => {
    const granted = await requestPermissions();
    if (granted) {
      console.log('Notifications enabled');
    }
  };
  
  return (
    <View>
      <Text>Notifications: {isEnabled ? 'Enabled' : 'Disabled'}</Text>
      {!isEnabled && (
        <Button onPress={handleEnableNotifications}>
          Enable Notifications
        </Button>
      )}
    </View>
  );
}
```

### Schedule Local Notifications

```typescript
import { useLocalNotification } from '@/core/notifications';

function BookingScreen() {
  const { scheduleNotification } = useLocalNotification();
  
  const scheduleReminder = async () => {
    await scheduleNotification(
      'Booking Reminder',
      'Your service is scheduled for tomorrow at 10:00 AM',
      { type: 'booking_reminder', bookingId: '123' },
      { seconds: 60 * 60 * 24 } // 24 hours from now
    );
  };
  
  return <Button onPress={scheduleReminder}>Set Reminder</Button>;
}
```

### Manage Badge Count

```typescript
import { useBadgeCount } from '@/core/notifications';

function MessagesScreen() {
  const { count, setBadgeCount, clearBadge } = useBadgeCount();
  
  useEffect(() => {
    // Update badge when unread messages change
    setBadgeCount(unreadMessages.length);
  }, [unreadMessages]);
  
  const handleMarkAllRead = () => {
    clearBadge();
  };
  
  return <View>...</View>;
}
```

### Notification Preferences

```typescript
import { NotificationPreferences } from '@/core/notifications/components/NotificationPreferences';

function SettingsScreen() {
  return (
    <ScrollView>
      <NotificationPreferences />
    </ScrollView>
  );
}
```

## Notification Types

The app supports different notification types for navigation:

- `booking_update`: Navigate to booking details
- `new_message`: Navigate to chat screen
- `booking_request`: Navigate to booking requests (providers)
- `provider_update`: Navigate to provider details

## Notification Categories

Users can control which types of notifications they receive:

- **Bookings**: Booking confirmations, status updates, reminders
- **Messages**: New messages from providers/customers
- **Promotions**: Special offers and promotional content

## Backend Integration

### Sending Push Notifications

Your backend should use the Expo Push API to send notifications:

```typescript
// Backend example (Node.js)
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

async function sendPushNotification(pushToken, title, body, data) {
  const messages = [{
    to: pushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  }];
  
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  
  for (const chunk of chunks) {
    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...ticketChunk);
  }
  
  return tickets;
}

// Usage
await sendPushNotification(
  userPushToken,
  'Booking Confirmed',
  'Your booking has been confirmed by the provider',
  { type: 'booking_update', bookingId: '123' }
);
```

### Storing Push Tokens

When a user logs in and gets a push token, send it to your backend:

```typescript
// Mobile app
const { pushToken } = useNotificationSetup();

useEffect(() => {
  if (pushToken && isAuthenticated) {
    authService.updatePushToken(pushToken);
  }
}, [pushToken, isAuthenticated]);
```

```typescript
// Backend API endpoint
POST /api/v1/users/push-token/
{
  "push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

## Testing

### Testing on Physical Devices

Push notifications only work on physical devices, not simulators/emulators.

### Testing Local Notifications

Local notifications work on both simulators and physical devices:

```typescript
// Test local notification
const { scheduleNotification } = useLocalNotification();

await scheduleNotification(
  'Test Notification',
  'This is a test notification',
  { type: 'test' },
  { seconds: 5 } // 5 seconds from now
);
```

### Testing Notification Navigation

1. Send a test notification with data
2. Tap the notification
3. Verify the app navigates to the correct screen

## Troubleshooting

### Notifications Not Appearing

1. Check permissions: `useNotificationPermissions()`
2. Verify push token is valid
3. Check device notification settings
4. Ensure app is not in Do Not Disturb mode

### Push Token Not Generated

1. Ensure running on physical device
2. Check Expo project ID in `app.json`
3. Verify network connectivity
4. Check console for errors

### Navigation Not Working

1. Verify notification data structure
2. Check navigation routes exist
3. Ensure `useNotificationNavigation` is called in root component

## Best Practices

1. **Request Permissions Contextually**: Ask for notification permissions when the user performs an action that benefits from notifications
2. **Respect User Preferences**: Always check notification preferences before sending
3. **Clear Notifications**: Clear notifications when user views the content
4. **Update Badge Count**: Keep badge count accurate
5. **Test Thoroughly**: Test on both iOS and Android physical devices
6. **Handle Errors Gracefully**: Don't crash if notifications fail

## Platform Differences

### iOS
- Requires explicit permission request
- Supports rich notifications with images
- Badge count managed by system

### Android
- More permissive by default
- Supports notification channels
- Badge count may vary by launcher

## Resources

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [Expo Server SDK](https://github.com/expo/expo-server-sdk-node)
