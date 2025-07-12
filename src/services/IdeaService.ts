import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { IDatabase } from "@/database/IDatabase";
// import { Idea } from "@/types/types";
import type { Idea } from "@prisma/client";
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
    const { submitterId, ...ideaData } = payload;
    return this.db.create("Idea", {
      ...ideaData,
      submitter_id: submitterId,
      status: "submitted",
      priority_score: 0,
      implementation_cost: null,
      expected_roi: null,
      strategic_alignment_score: null,
      submitted_at: null,
      evaluated_at: null,
      implemented_at: null,
      assigned_evaluator_id: null
    }) as Promise<Idea>;
  }
}
