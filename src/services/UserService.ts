// src/services/UserService.ts
import { inject, injectable } from "inversify";
import type { IDatabase } from "@/database/IDatabase";
import { Profile } from "@/types/types"; // Assuming you have a Profile type
import { TYPES } from "@/types/dbtypes";

@injectable() // Mark service as injectable
export class UserService {
  private db: IDatabase;

  constructor(@inject(TYPES.IDatabase) db: IDatabase) {
    this.db = db;
  }

  async getUserById(id: string): Promise<Profile | null> {
    return this.db.findOne("Profile", { id });
  }
}
