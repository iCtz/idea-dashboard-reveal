import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { IDatabase } from "@/database/IDatabase";
import type { Idea, IdeaCategory, IdeaStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { TYPES } from "@/types/dbtypes";

export interface CreateIdeaPayload {
  title: string;
  description: string;
  submitterId: string;
  implementationCost: Decimal | null;
  expectedRoi: Decimal | null;
  strategicAlignmentScore: number | null;
  status: IdeaStatus;
  language: string;
  category: IdeaCategory;
  strategicAlignment: string[];
}

@injectable()
export class IdeaService {
  constructor(@inject(TYPES.IDatabase) private readonly db: IDatabase) {}

  public async createIdea(payload: CreateIdeaPayload): Promise<Idea> {
    // Basic validation and sanitization
    const title = payload.title.trim();
    const description = payload.description.trim();
    if (!title || !description) {
      throw new Error("Title and description cannot be empty.");
    }
    return this.db.create("Idea", {
      title: title,
      description: description,
      category: payload.category,
      submitter_id: payload.submitterId,
      status: payload.status,
      language: payload.language,
      implementation_cost: payload.implementationCost,
      expected_roi: payload.expectedRoi,
      strategic_alignment_score: payload.strategicAlignmentScore,
      priority_score: 0,
      submitted_at: null,
      evaluated_at: null,
      implemented_at: null,
      assigned_evaluator_id: null,
      idea_reference_code: null,
      average_evaluation_score: null,
      feasibility_study_url: null,
      pricing_offer_url: null,
      prototype_images_urls: [],
      current_stage: null,
      strategic_alignment: payload.strategicAlignment,
    });
  }
}
