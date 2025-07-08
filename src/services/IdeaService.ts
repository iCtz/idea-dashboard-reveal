import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { IDatabase } from "@/database/IDatabase";
import { Idea } from "@/types/types";
import { TYPES } from "@/types/dbtypes";
import { IdeaCategory } from "@prisma/client";

interface CreateIdeaPayload {
  title: string;
  description: string;
  category: IdeaCategory;
  submitterId: string;
  implementationCost: number | null;
  expectedRoi: number | null;
  strategicAlignmentScore: number | null;
}

@injectable()
export class IdeaService {
  constructor(@inject(TYPES.IDatabase) private db: IDatabase) {}

  public async createIdea(payload: CreateIdeaPayload): Promise<Idea> {
    return this.db.create("Idea", {
      submitter: { connect: { id: payload.submitterId } },
      ...payload,
      status: "submitted",
    });
  }
}
