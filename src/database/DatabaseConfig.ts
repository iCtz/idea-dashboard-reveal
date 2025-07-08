// src/database/DatabaseConfig.ts
import { injectable } from "inversify";
import * as dotenv from "dotenv";

dotenv.config(); // Load environment variables

@injectable()
export class DatabaseConfig {
	constructor() {
    // Load configuration from environment variables
    this.config = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432", 10), // Provide a default port
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectionString: process.env.DATABASE_URL,
    };
    if (!this.config.connectionString) {
      throw new Error("DATABASE_URL environment variable is not set.");
    }
    console.log("Database configuration loaded:", this.config);
  }
}
