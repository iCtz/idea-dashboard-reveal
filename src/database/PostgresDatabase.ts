// src/database/PostgresDatabase.ts
import { injectable } from "inversify";
import { IDatabase } from "./IDatabase";
import { Pool, PoolClient, QueryResult } from "pg";
import { DatabaseConfig } from "./DatabaseConfig"; // Import the new config class
import { v4 as uuidv4 } from 'uuid';

@injectable() // Mark as injectable for Inversify
export class PostgresDatabase implements IDatabase {
	private pool: Pool;

	constructor(config: DatabaseConfig) {
		// Inject database configuration
		this.pool = new Pool(config);
	}

	async connect(): Promise<void> {
		try {
			await this.pool.connect();
			console.log("Connected to PostgreSQL");
		} catch (error) {
			console.error("Error connecting to PostgreSQL:", error);
			throw error;
		}
	}

	async query<T>(sql: string, params?: any[]): Promise<T[]> {
    	const client = await this.pool.connect();
		try {
      const result: QueryResult = await client.query(sql, params);
      return result.rows as T[]; // Use type assertion here
    } finally {
      client.release();
    }
  }

  async insert(table: string, data: Record<string, any>): Promise<any> {
    const columns = Object.keys(data).join(", ");
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
    return this.query(sql, values);
  }

  async update(table: string, id: string | number, data: Record<string, any>): Promise<any> {
    const updates = Object.entries(data)
      .map(([key, value], i) => `${key} = $${i + 2}`)
      .join(", ");
    const sql = `UPDATE ${table} SET ${updates} WHERE id = $1 RETURNING *`;
    return this.query(sql, [id, ...Object.values(data)]);
  }

  async delete(table: string, id: string | number): Promise<any> {
    const sql = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    return this.query(sql, [id]);
  }

  async executeTransaction(operations: (client: PoolClient) => Promise<void>): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await operations(client);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async find<T>(
    table: string,
    where?: Record<string, any>,
    orderBy?: { column: string; order: "ASC" | "DESC" }
  ): Promise<T[]> {
    let sql = `SELECT * FROM ${table}`;
    const params: any[] = [];

    if (table === "Idea" && orderBy && orderBy.column === "created_at") {
      orderBy.column = "created_at::timestamptz";
    }

    let paramCount = 1;
    if (where) {
      const conditions = Object.entries(where)
        .map(([key, value]) => {
          params.push(value);
          return `${key} = $${paramCount++}`;
        })
        .join(" AND ");
      sql += ` WHERE ${conditions}`;
    }
    if (orderBy) {
      sql += ` ORDER BY ${orderBy.column} ${orderBy.order}`;
    }
    return this.query(sql, params);
  }

  async findOne<T>(table: string, where: Record<string, any>): Promise<T | null> {
    const results = await this.find<T>(table, where);
    return results.length > 0 ? results[0] : null;
  }

  async close(): Promise<void> {
    await this.pool.end();
    console.log("PostgreSQL connection closed");
  }

  async count(table: string, where?: Record<string, any>): Promise<number> {
    let sql = `SELECT COUNT(*) FROM ${table}`;
    const params: any[] = [];

    if (where) {
      sql += ` WHERE ${Object.entries(where).map(([key, value], index) => `${key} = $${index + 1}`).join(" AND ")}`;
      params.push(...Object.values(where));
    }

    const result = await this.query<{ count: string }>(sql, params);
    return parseInt(result[0].count, 10);
  }
}
