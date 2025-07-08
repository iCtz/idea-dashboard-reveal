// src/services/UserService.ts
import { inject, injectable } from "inversify";
import { IDatabase } from "@/database/IDatabase";
import { TYPES } from "@/types/dbtypes";

@injectable() // Mark service as injectable
export class UserService {
	private db: IDatabase;

	constructor(@inject(TYPES.IDatabase) db: IDatabase) {
		// Inject database
		this.db = db;
	}

	async getUserById(id: number) {
		const results = await this.db.query("SELECT * FROM users WHERE id = $1", [
			id,
		]);
		return results[0];
	}

	// ... other user-related methods ...
}
