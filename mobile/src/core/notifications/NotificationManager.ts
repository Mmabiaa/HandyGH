import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

/**
 * Notification category types
 */
export enum NotificationCategory {
  BOOKINGS = 'bookings',
  MESSAGES = 'messages',
  PROMOTIONS = 'promotions',
}

/**
 * Notification data payload
 */
export interface NotificationData {
  type: string;
  bookingId?: string;
  providerId?: string;
  messageId?: string;
  [key: string]: any;
}

/**
 * Configure notification behavior
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * NotificationManager class for handling push notifications
 */
class NotificationManager {
  private static instance: NotificationManager;
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * Initialize notifications and request permissions
   */
  public async initialize(): Promise<string | null> {
    try {
      // Check if running on physical device
      if (!Device.isDevice) {
        console.warn('[NotificationManager] Push notifications only work on physical devices');
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('[NotificationManager] Permission not granted for push notifications');
        return null;
      }

      // Get push token
      this.expoPushToken = await this.getExpoPushToken();

      // Setup notification listeners
      this.setupListeners();

      console.log('[NotificationManager] Initialized successfully');
      return this.expoPushToken;
    } catch (error) {
      console.error('[NotificationManager] Initialization error:', error);
      return null;
    }
  }

  /**
   * Get Expo push token
   */
  private async getExpoPushToken(): Promise<string> {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        throw new Error('Project ID not found in app config');
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      console.log('[NotificationManager] Push token:', token.data);
      return token.data;
    } catch (error) {
      console.error('[NotificationManager] Error getting push token:', error);
      throw error;
    }
  }

  /**
   * Setup notification listeners
   */
  private setupListeners(): void {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[NotificationManager] Notification received:', notification);
        // You can handle foreground notifications here
      }
    );

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('[NotificationManager] Notification tapped:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  /**
   * Handle notification tap/response
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const data = response.notification.request.content.data as NotificationData;

    // Navigation will be handled by the app's navigation system
    // Emit a custom event that the app can listen to
    if (data.type && data.bookingId) {
      // This will be handled by the navigation system
      console.log('[NotificationManager] Navigate to:', data.type, data.bookingId);
    }
  }

  /**
   * Get the current push token
   */
  public getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Schedule a local notification
   */
  public async scheduleLocalNotification(
    title: string,
    body: string,
    data?: NotificationData,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: trigger || null, // null means immediate
      });

      console.log('[NotificationManager] Local notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('[NotificationManager] Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  public async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('[NotificationManager] Notification cancelled:', notificationId);
    } catch (error) {
      console.error('[NotificationManager] Error cancelling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  public async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('[NotificationManager] All notifications cancelled');
    } catch (error) {
      console.error('[NotificationManager] Error cancelling all notifications:', error);
      throw error;
    }
  }

  /**
   * Get badge count
   */
  public async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('[NotificationManager] Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Set badge count
   */
  public async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
      console.log('[NotificationManager] Badge count set to:', count);
    } catch (error) {
      console.error('[NotificationManager] Error setting badge count:', error);
    }
  }

  /**
   * Clear badge count
   */
  public async clearBadgeCount(): Promise<void> {
    await this.setBadgeCount(0);
  }

  /**
   * Dismiss all notifications
   */
  public async dismissAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('[NotificationManager] All notifications dismissed');
    } catch (error) {
      console.error('[NotificationManager] Error dismissing notifications:', error);
    }
  }

  /**
   * Check if notifications are enabled
   */
  public async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[NotificationManager] Error checking notification status:', error);
      return false;
    }
  }

  /**
   * Request notification permissions
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[NotificationManager] Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Cleanup listeners
   */
  public cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }

    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }

    console.log('[NotificationManager] Cleaned up');
  }

  /**
   * Reset singleton instance (for testing)
   */
  public static reset(): void {
    if (NotificationManager.instance) {
      NotificationManager.instance.cleanup();
      NotificationManager.instance = null as any;
    }
  }
}

export default NotificationManager;
