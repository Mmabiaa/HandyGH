// Lazy import to avoid loading expo-notifications (which depends on expo-constants) in Expo Go
let Notifications: any = null;
let Device: any = null;

/**
 * Lazy load expo-notifications and expo-device to avoid PlatformConstants error in Expo Go
 */
async function getNotificationsModule() {
  if (Notifications) return Notifications;

  try {
    const notificationsModule = await import('expo-notifications');
    Notifications = notificationsModule;

    // Configure notification behavior only if module loaded successfully
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    return Notifications;
  } catch (error) {
    console.warn('[NotificationManager] expo-notifications not available:', error);
    return null;
  }
}

async function getDeviceModule() {
  if (Device) return Device;

  try {
    const deviceModule = await import('expo-device');
    Device = deviceModule;
    return Device;
  } catch (error) {
    console.warn('[NotificationManager] expo-device not available:', error);
    return null;
  }
}

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
 * Notification subscription type
 */
type NotificationSubscription = {
  remove: () => void;
} | null;

/**
 * NotificationManager class for handling push notifications
 */
class NotificationManager {
  private static instance: NotificationManager;
  private expoPushToken: string | null = null;
  private notificationListener: NotificationSubscription = null;
  private responseListener: NotificationSubscription = null;

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
   * In Expo Go, this will skip initialization to avoid PlatformConstants errors
   */
  public async initialize(): Promise<string | null> {
    try {
      // Lazy load modules - this will fail in Expo Go due to PlatformConstants
      const NotificationsModule = await getNotificationsModule();
      const DeviceModule = await getDeviceModule();

      if (!NotificationsModule || !DeviceModule) {
        console.warn('[NotificationManager] Notification modules not available (likely Expo Go)');
        return null;
      }

      // Check if running on physical device
      if (!DeviceModule.isDevice) {
        console.warn('[NotificationManager] Push notifications only work on physical devices');
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await NotificationsModule.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await NotificationsModule.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('[NotificationManager] Permission not granted for push notifications');
        return null;
      }

      // Get push token (this may fail if Constants is not available, but we handle it gracefully)
      try {
        this.expoPushToken = await this.getExpoPushToken(NotificationsModule);
      } catch (tokenError) {
        console.warn('[NotificationManager] Could not get push token, continuing without it:', tokenError);
        this.expoPushToken = null;
      }

      // Setup notification listeners
      this.setupListeners(NotificationsModule);

      console.log('[NotificationManager] Initialized successfully');
      return this.expoPushToken;
    } catch (error: any) {
      // Catch PlatformConstants and other native module errors
      const errorMessage = error?.message || String(error);
      if (
        errorMessage.includes('PlatformConstants') ||
        errorMessage.includes('TurboModuleRegistry') ||
        errorMessage.includes('Constants')
      ) {
        console.warn('[NotificationManager] Skipping notifications in Expo Go:', errorMessage);
        return null;
      }

      console.error('[NotificationManager] Initialization error:', error);
      // Don't throw - allow app to continue without notifications
      return null;
    }
  }

  /**
   * Get Expo push token
   * In Expo Go, this will fail due to missing PlatformConstants native module
   * We catch the error and return empty string to allow app to continue
   */
  private async getExpoPushToken(NotificationsModule: any): Promise<string> {
    try {
      // Try to get push token without projectId first
      // In Expo Go, this may fail due to missing Constants/PlatformConstants
      // We'll catch that error and gracefully skip push token initialization
      const token = await NotificationsModule.getExpoPushTokenAsync({});

      console.log('[NotificationManager] Push token:', token.data);
      return token.data;
    } catch (error: any) {
      // Catch any errors related to missing native modules (PlatformConstants, Constants, projectId)
      // This allows the app to run in Expo Go without push notifications
      const errorMessage = error?.message || String(error);
      if (
        errorMessage.includes('projectId') ||
        errorMessage.includes('Constants') ||
        errorMessage.includes('PlatformConstants') ||
        errorMessage.includes('TurboModuleRegistry')
      ) {
        console.warn('[NotificationManager] Push token not available (Expo Go limitation):', errorMessage);
        return '';
      }

      console.error('[NotificationManager] Error getting push token:', error);
      // Don't throw - allow app to continue without push notifications
      return '';
    }
  }

  /**
   * Setup notification listeners
   */
  private setupListeners(NotificationsModule: any): void {
    if (!NotificationsModule) return;

    // Listener for notifications received while app is foregrounded
    this.notificationListener = NotificationsModule.addNotificationReceivedListener(
      (notification: any) => {
        console.log('[NotificationManager] Notification received:', notification);
        // You can handle foreground notifications here
      }
    );

    // Listener for when user taps on notification
    this.responseListener = NotificationsModule.addNotificationResponseReceivedListener(
      (response: any) => {
        console.log('[NotificationManager] Notification tapped:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  /**
   * Handle notification tap/response
   */
  private handleNotificationResponse(response: any): void {
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
    trigger?: any
  ): Promise<string> {
    try {
      const NotificationsModule = await getNotificationsModule();
      if (!NotificationsModule) {
        throw new Error('Notifications module not available');
      }

      const notificationId = await NotificationsModule.scheduleNotificationAsync({
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
      const NotificationsModule = await getNotificationsModule();
      if (!NotificationsModule) {
        throw new Error('Notifications module not available');
      }
      await NotificationsModule.cancelScheduledNotificationAsync(notificationId);
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
      const NotificationsModule = await getNotificationsModule();
      if (!NotificationsModule) {
        throw new Error('Notifications module not available');
      }
      await NotificationsModule.cancelAllScheduledNotificationsAsync();
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
      const NotificationsModule = await getNotificationsModule();
      if (!NotificationsModule) return 0;
      return await NotificationsModule.getBadgeCountAsync();
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
      const NotificationsModule = await getNotificationsModule();
      if (!NotificationsModule) return;
      await NotificationsModule.setBadgeCountAsync(count);
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
      const NotificationsModule = await getNotificationsModule();
      if (!NotificationsModule) return;
      await NotificationsModule.dismissAllNotificationsAsync();
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
      const NotificationsModule = await getNotificationsModule();
      if (!NotificationsModule) return false;
      const { status } = await NotificationsModule.getPermissionsAsync();
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
      const NotificationsModule = await getNotificationsModule();
      if (!NotificationsModule) return false;
      const { status } = await NotificationsModule.requestPermissionsAsync();
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
