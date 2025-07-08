import "reflect-metadata";
import { Container } from "inversify";
import { IDatabase } from "@/database/IDatabase";
import { PostgresDatabase } from "@/database/PostgresDatabase";
import { UserService } from "@/services/UserService";
import { IdeaService } from "@/services/IdeaService";
import { TYPES } from "@/types/dbtypes";

const container = new Container();

container.bind<IDatabase>(TYPES.IDatabase).to(PostgresDatabase).inSingletonScope();
container.bind<UserService>(TYPES.UserService).to(UserService);
container.bind<IdeaService>(TYPES.IdeaService).to(IdeaService);

export { container };
