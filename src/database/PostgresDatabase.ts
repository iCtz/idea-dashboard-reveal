// src/database/PostgresDatabase.ts
import { injectable } from "inversify";
import { IDatabase } from "./IDatabase";
import { Pool } from "pg"; // Example: Using 'pg' for PostgreSQL
import { DatabaseConfig } from "./DatabaseConfig"; // Import the new config class

@injectable() // Mark as injectable for Inversify
export class PostgresDatabase implements IDatabase {
	private pool: Pool;

	constructor(config: DatabaseConfig) {
		// Inject database configuration
		this.pool = new Pool(config.config);
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

	async query(sql: string, params?: any[]): Promise<any> {
		const client = await this.pool.connect();
		try {
			const result = await client.query(sql, params);
			return result.rows;
		} finally {
			client.release();
		}
	}

	// Implement other database operations here...
}
