import { container } from "@/lib/inversify.config";
import { IDatabase } from "./IDatabase";
import { TYPES } from "@/types/dbtypes";

export function getDatabase(): IDatabase {
  return container.get<IDatabase>(TYPES.IDatabase);
}

// import { container } from '@/inversify.config';
// import { TYPES } from '@/types/dbtypes';
// import { IDatabase } from './IDatabase';

// export const getDatabase = (): IDatabase => {
//   return container.get<IDatabase>(TYPES.IDatabase);
// };
