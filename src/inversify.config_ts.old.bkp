// /path/to/your/project/src/inversify.config.ts
import { Container, ContainerModule } from "inversify";
import { IDatabase } from "./database/IDatabase";
import { PostgresDatabase } from "./database/PostgresDatabase";
import { TYPES } from "@/types/dbtypes"; // Define types as symbols for better type safety
import { DatabaseConfig } from "./database/DatabaseConfig"; // Import the config class
import "reflect-metadata";
const container = new Container();

const databaseModule = new ContainerModule((bind) => {
    // Bind the database configuration
    bind<DatabaseConfig>(TYPES.DatabaseConfig)
        .to(DatabaseConfig)
        .inSingletonScope(); // Ensure only one instance of DatabaseConfig is created

    // Bind the database implementation, injecting the configuration
    bind<IDatabase>(TYPES.IDatabase)
        .to(PostgresDatabase)
        .inSingletonScope(); // Ensure only one instance of PostgresDatabase is created
});

container.load(databaseModule);

export { container };
