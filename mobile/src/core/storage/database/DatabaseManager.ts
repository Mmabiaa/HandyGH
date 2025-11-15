import { Platform } from 'react-native';
import {
  DATABASE_NAME,
  DATABASE_VERSION,
  CREATE_TABLES,
  CREATE_INDEXES,
  DROP_TABLES,
} from './schema';

// Platform-specific SQLite setup - use Expo SQLite (Expo-compatible)
let SQLite: any = null;

/**
 * Lazy load expo-sqlite (Expo-compatible SQLite)
 */
async function getSQLite() {
  if (SQLite !== null) {
    return SQLite;
  }

  if (Platform.OS === 'web') {
    SQLite = null;
    return SQLite;
  }

  try {
    // Use Expo SQLite which is compatible with Expo Go
    // @ts-ignore - Dynamic import may not have type declarations
    const SQLiteModule = await import('expo-sqlite') as any;
    SQLite = SQLiteModule.default || SQLiteModule;
    return SQLite;
  } catch (error) {
    console.warn('[DatabaseManager] expo-sqlite not available:', error);
    SQLite = null;
    return SQLite;
  }
}

/**
 * DatabaseManager handles SQLite database initialization, migrations, and connections
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: any | null = null;

  private constructor() {}

  /**
   * Get singleton instance of DatabaseManager
   */
  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize database connection and create tables
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing database...');

      if (Platform.OS === 'web') {
        // Web platform: Skip SQLite initialization
        console.log('Web platform detected - using in-memory storage fallback');
        this.db = null; // Web doesn't use SQLite
        return;
      }

      // Get SQLite module (may be null if not available)
      const SQLiteModule = await getSQLite();
      if (!SQLiteModule) {
        console.warn('[DatabaseManager] SQLite not available, skipping database initialization');
        this.db = null;
        return;
      }

      // Open database connection using Expo SQLite API
      // Note: expo-sqlite API is different from react-native-sqlite-storage
      // For now, we'll make it optional to allow app to run in Expo Go
      try {
        this.db = await SQLiteModule.openDatabaseAsync(DATABASE_NAME);
      } catch (openError) {
        console.warn('[DatabaseManager] Failed to open database with expo-sqlite:', openError);
        // Database will be null, app can continue without it
        this.db = null;
        return;
      }

      console.log('Database opened successfully');

      // Get current database version
      const currentVersion = await this.getDatabaseVersion();
      console.log(`Current database version: ${currentVersion}`);

      // Run migrations if needed
      if (currentVersion < DATABASE_VERSION) {
        await this.runMigrations(currentVersion, DATABASE_VERSION);
      } else {
        // Create tables if they don't exist
        await this.createTables();
      }

      console.log('Database initialization complete');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw new Error('Failed to initialize database');
    }
  }

  /**
   * Get the database instance
   */
  getDatabase(): any {
    if (Platform.OS === 'web') {
      console.warn('SQLite not available on web platform');
      return null;
    }
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Create all tables and indexes
   */
  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      // Create tables
      await this.db.executeSql(CREATE_TABLES.bookings);
      await this.db.executeSql(CREATE_TABLES.messages);

      // Create indexes
      await this.db.executeSql(CREATE_INDEXES.messagesBooking);
      await this.db.executeSql(CREATE_INDEXES.messagesCreated);
      await this.db.executeSql(CREATE_INDEXES.bookingsUpdated);

      console.log('Tables and indexes created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  /**
   * Get current database version
   */
  private async getDatabaseVersion(): Promise<number> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.db.executeSql('PRAGMA user_version;');
      return result[0].rows.item(0).user_version;
    } catch (error) {
      console.error('Error getting database version:', error);
      return 0;
    }
  }

  /**
   * Set database version
   */
  private async setDatabaseVersion(version: number): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.executeSql(`PRAGMA user_version = ${version};`);
      console.log(`Database version set to ${version}`);
    } catch (error) {
      console.error('Error setting database version:', error);
      throw error;
    }
  }

  /**
   * Run database migrations
   */
  private async runMigrations(fromVersion: number, toVersion: number): Promise<void> {
    console.log(`Running migrations from version ${fromVersion} to ${toVersion}`);

    try {
      // Migration from version 0 to 1 (initial setup)
      if (fromVersion === 0 && toVersion >= 1) {
        await this.migrateToVersion1();
      }

      // Add more migrations here as needed
      // if (fromVersion <= 1 && toVersion >= 2) {
      //   await this.migrateToVersion2();
      // }

      // Update database version
      await this.setDatabaseVersion(toVersion);
      console.log('Migrations completed successfully');
    } catch (error) {
      console.error('Error running migrations:', error);
      throw new Error('Failed to run database migrations');
    }
  }

  /**
   * Migration to version 1 (initial schema)
   */
  private async migrateToVersion1(): Promise<void> {
    console.log('Migrating to version 1...');
    await this.createTables();
  }

  /**
   * Clear all data from the database
   */
  async clearAllData(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.executeSql('DELETE FROM messages;');
      await this.db.executeSql('DELETE FROM bookings;');
      console.log('All data cleared from database');
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }

  /**
   * Drop all tables (use with caution)
   */
  async dropAllTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.executeSql(DROP_TABLES.messages);
      await this.db.executeSql(DROP_TABLES.bookings);
      console.log('All tables dropped');
    } catch (error) {
      console.error('Error dropping tables:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      try {
        await this.db.close();
        this.db = null;
        console.log('Database connection closed');
      } catch (error) {
        console.error('Error closing database:', error);
        throw error;
      }
    }
  }

  /**
   * Execute a raw SQL query
   */
  async executeSql(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.db.executeSql(sql, params);
      return result;
    } catch (error) {
      console.error('Error executing SQL:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();
