// /path/to/your/project/src/database/IDatabase.ts
export interface IDatabase {
  connect(): Promise<void>;
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  insert(table: string, data: Record<string, any>): Promise<any>;
  update(table: string, id: string | number, data: Record<string, any>): Promise<any>;
  delete(table: string, id: string | number): Promise<any>;
  find<T>(table: string, where?: Record<string, any>, orderBy?: { column: string; order: "ASC" | "DESC" }): Promise<T[]>;
  findOne<T>(table: string, where: Record<string, any>): Promise<T | null>;
  executeTransaction(operations: (client: any) => Promise<void>): Promise<void>;
}
