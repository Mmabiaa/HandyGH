/**
 * App Initializer
 *
 * Handles platform-specific initialization of native modules
 * Ensures proper setup before app renders
 */

import { Platform } from 'react-native';
import SocketManager from '../realtime/SocketManager';
import { SOCKET_CONFIG } from '../realtime/config';
import NotificationManager from '../notifications/NotificationManager';
import { initializeStorageCache } from '../storage/ZustandStorageAdapter';
import { OfflineQueueManager } from '../storage/OfflineQueueManager';
import { useNetworkStore } from '../store/networkStore';

let isInitialized = false;

export class AppInitializer {
  /**
   * Initialize all platform-specific modules
   * Errors are caught and logged but don't prevent app from rendering
   */
  static async initialize(): Promise<void> {
    if (isInitialized) {
      console.log('App already initialized');
      return;
    }

    try {
      console.log(`[AppInitializer] Starting initialization for platform: ${Platform.OS}`);

      // Initialize storage cache for Zustand (Expo-compatible)
      try {
        console.log('[AppInitializer] Initializing storage cache');
        await initializeStorageCache();
        console.log('[AppInitializer] Storage cache initialized successfully');
      } catch (cacheError) {
        console.warn('[AppInitializer] Storage cache initialization failed (non-critical):', cacheError);
      }

      // Initialize network store
      try {
        console.log('[AppInitializer] Initializing network store');
        useNetworkStore.getState().initialize();
        console.log('[AppInitializer] Network store initialized successfully');
      } catch (networkError) {
        console.warn('[AppInitializer] Network store initialization failed (non-critical):', networkError);
      }

      // Initialize offline queue manager
      try {
        console.log('[AppInitializer] Initializing offline queue manager');
        await OfflineQueueManager.initialize();
        console.log('[AppInitializer] Offline queue manager initialized successfully');
      } catch (queueError) {
        console.warn('[AppInitializer] Offline queue manager initialization failed (non-critical):', queueError);
      }

      if (Platform.OS === 'web') {
        // Web-specific initialization
        console.log('[AppInitializer] Web platform detected - using fallback implementations');
      } else {
        // Native platform initialization - wrap each in try-catch to prevent cascading failures
        console.log('[AppInitializer] Native platform detected - initializing native modules');

        // Initialize database (may fail in Expo Go)
        try {
          const { databaseManager } = await import('../storage/database/DatabaseManager');
          await databaseManager.initialize();
          console.log('[AppInitializer] Database initialized successfully');
        } catch (dbError) {
          console.warn('[AppInitializer] Database initialization failed (non-critical):', dbError);
        }
      }

      // Initialize WebSocket manager (works on all platforms)
      try {
        console.log('[AppInitializer] Initializing WebSocket manager');
        SocketManager.getInstance(SOCKET_CONFIG);
        console.log('[AppInitializer] WebSocket manager initialized successfully');
      } catch (socketError) {
        console.warn('[AppInitializer] WebSocket manager initialization failed (non-critical):', socketError);
      }

      // Initialize notification manager (may fail in Expo Go due to native modules)
      try {
        console.log('[AppInitializer] Initializing notification manager');
        await NotificationManager.getInstance().initialize();
        console.log('[AppInitializer] Notification manager initialized successfully');
      } catch (notificationError) {
        console.warn('[AppInitializer] Notification manager initialization failed (non-critical):', notificationError);
      }

      isInitialized = true;
      console.log('[AppInitializer] App initialization complete');
    } catch (error) {
      console.error('[AppInitializer] Unexpected error during initialization:', error);
      // Mark as initialized anyway to prevent retry loops
      isInitialized = true;
      // Don't throw - allow app to continue with degraded functionality
    }
  }

  /**
   * Check if app is initialized
   */
  static isInitialized(): boolean {
    return isInitialized;
  }
}
