export { default as NotificationManager, NotificationCategory } from './NotificationManager';
export type { NotificationData } from './NotificationManager';
export {
  useNotificationSetup,
  useNotificationNavigation,
  useNotificationPermissions,
  useBadgeCount,
  useLocalNotification,
} from './hooks/useNotifications';
