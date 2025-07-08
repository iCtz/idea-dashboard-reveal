// src/database/IDatabase.ts
export interface IDatabase {
  connect(): Promise<void>;
  query(sql: string, params?: any[]): Promise<any>;
  // Add other database operations as needed (e.g., insert, update, delete)
}
