import "reflect-metadata";
import { Container } from "inversify";
import { IDatabase } from "@/database/IDatabase";
import { PostgresDatabase } from "@/database/PostgresDatabase";
import { SupabaseDatabase } from "@/database/SupabaseDatabase";
import { UserService } from "@/services/UserService";
import { IdeaService } from "@/services/IdeaService";
import { TYPES } from "@/types/dbtypes";

const container = new Container();

// container.bind<IDatabase>(TYPES.IDatabase).to(PostgresDatabase).inSingletonScope();
// Dynamically bind the database implementation based on the environment variable
if (process.env.USE_LOCAL_AUTH === "true") {
  console.log("Using local Postgres database.");
  container.bind<IDatabase>(TYPES.IDatabase).to(PostgresDatabase).inSingletonScope();
} else {
  console.log("Using Supabase database.");
  container.bind<IDatabase>(TYPES.IDatabase).to(SupabaseDatabase).inSingletonScope();
}

container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<IdeaService>(TYPES.IdeaService).to(IdeaService);

export { container };
