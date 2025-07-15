import { container } from "@/lib/inversify.config";
import { IDatabase } from "./IDatabase";
import { TYPES } from "@/types/dbtypes";

export function getDatabase(): IDatabase {
  return container.get<IDatabase>(TYPES.IDatabase);
}
