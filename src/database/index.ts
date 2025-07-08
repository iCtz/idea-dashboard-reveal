// src/database/index.ts

import { container } from '@/inversify.config';
import { TYPES } from '@/types/dbtypes';
import { IDatabase } from './IDatabase';

export const getDatabase = (): IDatabase => {
  return container.get<IDatabase>(TYPES.IDatabase);
};
