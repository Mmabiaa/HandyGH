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

let isInitialized = false;

export class AppInitializer {
  /**
   * Initialize all platform-specific modules
   */
  static async initialize(): Promise<void> {
    if (isInitialized) {
      console.log('App already initialized');
      return;
    }

    try {
      console.log(`Initializing app for platform: ${Platform.OS}`);

      if (Platform.OS === 'web') {
        // Web-specific initialization
        console.log('Web platform detected - using fallback implementations');
      } else {
        // Native platform initialization
        console.log('Native platform detected - initializing native modules');

        // Initialize database
        const { databaseManager } = await import('../storage/database/DatabaseManager');
        await databaseManager.initialize();
      }

      // Initialize WebSocket manager (works on all platforms)
      console.log('Initializing WebSocket manager');
      SocketManager.getInstance(SOCKET_CONFIG);

      // Initialize notification manager
      console.log('Initializing notification manager');
      await NotificationManager.getInstance().initialize();

      isInitialized = true;
      console.log('App initialization complete');
    } catch (error) {
      console.error('Error during app initialization:', error);
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
