import { useEffect, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import NotificationManager, { NotificationData } from '../NotificationManager';
import { useNavigation } from '@react-navigation/native';

/**
 * Hook to initialize and manage notifications
 */
export function useNotificationSetup() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const notificationManager = NotificationManager.getInstance();
        const token = await notificationManager.initialize();
        setPushToken(token);
        setIsInitialized(true);
      } catch (err) {
        console.error('[useNotificationSetup] Initialization error:', err);
        setError(err as Error);
      }
    };

    initializeNotifications();

    return () => {
      // Cleanup on unmount
      NotificationManager.getInstance().cleanup();
    };
  }, []);

  return {
    pushToken,
    isInitialized,
    error,
  };
}

/**
 * Hook to handle notification navigation
 */
export function useNotificationNavigation() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    // Handle notification tap when app is in background/quit
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as NotificationData;

        // Navigate based on notification type
        if (data.type === 'booking_update' && data.bookingId) {
          navigation.navigate('BookingDetails', {
            bookingId: data.bookingId,
          });
        } else if (data.type === 'new_message' && data.bookingId) {
          navigation.navigate('BookingChat', {
            bookingId: data.bookingId,
          });
        } else if (data.type === 'booking_request' && data.bookingId) {
          navigation.navigate('BookingRequests');
        } else if (data.type === 'provider_update' && data.providerId) {
          navigation.navigate('ProviderDetail', {
            providerId: data.providerId,
          });
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [navigation]);
}

/**
 * Hook to check notification permissions
 */
export function useNotificationPermissions() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkPermissions = useCallback(async () => {
    setIsLoading(true);
    const notificationManager = NotificationManager.getInstance();
    const enabled = await notificationManager.areNotificationsEnabled();
    setIsEnabled(enabled);
    setIsLoading(false);
  }, []);

  const requestPermissions = useCallback(async () => {
    const notificationManager = NotificationManager.getInstance();
    const granted = await notificationManager.requestPermissions();
    setIsEnabled(granted);
    return granted;
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    isEnabled,
    isLoading,
    requestPermissions,
    checkPermissions,
  };
}

/**
 * Hook to manage badge count
 */
export function useBadgeCount() {
  const [count, setCount] = useState(0);

  const updateCount = useCallback(async () => {
    const notificationManager = NotificationManager.getInstance();
    const currentCount = await notificationManager.getBadgeCount();
    setCount(currentCount);
  }, []);

  const setBadgeCount = useCallback(async (newCount: number) => {
    const notificationManager = NotificationManager.getInstance();
    await notificationManager.setBadgeCount(newCount);
    setCount(newCount);
  }, []);

  const clearBadge = useCallback(async () => {
    const notificationManager = NotificationManager.getInstance();
    await notificationManager.clearBadgeCount();
    setCount(0);
  }, []);

  useEffect(() => {
    updateCount();
  }, [updateCount]);

  return {
    count,
    setBadgeCount,
    clearBadge,
    updateCount,
  };
}

/**
 * Hook to schedule local notifications
 */
export function useLocalNotification() {
  const scheduleNotification = useCallback(
    async (
      title: string,
      body: string,
      data?: NotificationData,
      trigger?: Notifications.NotificationTriggerInput
    ) => {
      const notificationManager = NotificationManager.getInstance();
      return await notificationManager.scheduleLocalNotification(
        title,
        body,
        data,
        trigger
      );
    },
    []
  );

  const cancelNotification = useCallback(async (notificationId: string) => {
    const notificationManager = NotificationManager.getInstance();
    await notificationManager.cancelNotification(notificationId);
  }, []);

  const cancelAllNotifications = useCallback(async () => {
    const notificationManager = NotificationManager.getInstance();
    await notificationManager.cancelAllNotifications();
  }, []);

  return {
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
  };
}
