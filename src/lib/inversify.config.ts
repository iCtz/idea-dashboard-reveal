import "reflect-metadata";
import { Container } from "inversify";
import { PrismaClient } from '@prisma/client';
import { UserService } from "@/services/UserService";
import { IdeaService } from "@/services/IdeaService"; // Import IdeaService
import { DashboardService } from "@/services/DashboardService"; // Import IdeaService
import { PostgresDatabase } from "@/database/PostgresDatabase";
import { SupabaseDatabase } from "@/database/SupabaseDatabase";
import { IDatabase } from "@/database/IDatabase";
import { TYPES, DatabaseConfig } from "@/types/dbtypes"; // Import DatabaseConfig and TYPES
import { logger } from '@/lib/logger';

const container = new Container();

// Create a configuration object
const dbConfig: DatabaseConfig = {
  local: process.env.DATABASE_URL || "",
  supabase: process.env.SUPABASE_DATABASE_URL || "",
};

// Bind the configuration object so it can be injected
container.bind<DatabaseConfig>(TYPES.DatabaseConfig).toConstantValue(dbConfig);
container.bind(TYPES.PrismaClient).toConstantValue(new PrismaClient());

// Dynamically bind the database implementation
if (process.env.USE_LOCAL_AUTH === "true") {
  logger.database("Using local Postgres database.");
  container.bind<IDatabase>(TYPES.IDatabase).to(PostgresDatabase).inSingletonScope();
} else {
  logger.database("Using Supabase database.");
  container.bind<IDatabase>(TYPES.IDatabase).to(SupabaseDatabase).inSingletonScope();
}

container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<IdeaService>(TYPES.IdeaService).to(IdeaService);
container.bind<IdeaService>(TYPES.DashboardService).to(DashboardService);

export { container };
