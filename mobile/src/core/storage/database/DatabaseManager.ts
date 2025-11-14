import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import {
  DATABASE_NAME,
  DATABASE_VERSION,
  CREATE_TABLES,
  CREATE_INDEXES,
  DROP_TABLES,
} from './schema';

// Enable promise API and debug mode in development
SQLite.enablePromise(true);
if (__DEV__) {
  SQLite.DEBUG(true);
}

/**
 * DatabaseManager handles SQLite database initialization, migrations, and connections
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: SQLiteDatabase | null = null;

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

      // Open database connection
      this.db = await SQLite.openDatabase({
        name: DATABASE_NAME,
        location: 'default',
      });

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
  getDatabase(): SQLiteDatabase {
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
