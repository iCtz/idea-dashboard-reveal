
import { PostgresDatabase } from "./PostgresDatabase";
import { Prisma, PrismaClient } from "@prisma/client";
import { logger } from "@lib/logger";

export class PostgresTransactionDatabase extends PostgresDatabase {
	constructor(prismaTx: Prisma.TransactionClient) {
	  super(
        {
          local: process.env.DATABASE_URL || "",
          supabase: process.env.SUPABASE_DATABASE_URL || "",
        }
      ); // Dummy config
	  this.prisma = prismaTx as unknown as PrismaClient; // Type assertion
	  logger.database("Initializing transaction client");
	}
  }
