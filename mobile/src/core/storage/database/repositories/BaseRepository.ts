import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { databaseManager } from '../DatabaseManager';

/**
 * Base repository class with common database operations
 */
export abstract class BaseRepository<T> {
  protected get db(): SQLiteDatabase {
    return databaseManager.getDatabase();
  }

  /**
   * Execute a SELECT query and return results
   */
  protected async executeQuery<R = T>(
    sql: string,
    params: any[] = []
  ): Promise<R[]> {
    try {
      const result = await this.db.executeSql(sql, params);
      const rows: R[] = [];

      for (let i = 0; i < result[0].rows.length; i++) {
        rows.push(result[0].rows.item(i));
      }

      return rows;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  /**
   * Execute an INSERT, UPDATE, or DELETE query
   */
  protected async executeUpdate(
    sql: string,
    params: any[] = []
  ): Promise<number> {
    try {
      const result = await this.db.executeSql(sql, params);
      return result[0].rowsAffected;
    } catch (error) {
      console.error('Error executing update:', error);
      throw error;
    }
  }

  /**
   * Execute a query and return a single result
   */
  protected async executeQuerySingle<R = T>(
    sql: string,
    params: any[] = []
  ): Promise<R | null> {
    const results = await this.executeQuery<R>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Execute multiple SQL statements in a transaction
   */
  protected async executeTransaction(
    operations: Array<{ sql: string; params?: any[] }>
  ): Promise<void> {
    try {
      await this.db.transaction(async (tx) => {
        for (const operation of operations) {
          await tx.executeSql(operation.sql, operation.params || []);
        }
      });
    } catch (error) {
      console.error('Error executing transaction:', error);
      throw error;
    }
  }
}
