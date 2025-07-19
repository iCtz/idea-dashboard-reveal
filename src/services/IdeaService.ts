import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { IDatabase } from "@/database/IDatabase";
// import type { AttachmentFileType, Idea, IdeaCategory, IdeaStatus, IdeaAttachment } from "@prisma/client";
import type { AttachmentFileType, Idea, IdeaCategory, IdeaStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { TYPES } from "@/types/dbtypes";
import { logger } from "@lib/logger";

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

  public async createIdeaWithFiles(
    payload: CreateIdeaPayload,
    attachments: { url: string; type: AttachmentFileType; name: string }[]
  ): Promise<Idea> {
    return this.db.transaction(async (tx) => {
      const start = Date.now();

      // 1. Create the Idea using the transaction client
      const idea = await tx.create("Idea", {
        title: payload.title.trim(),
        description: payload.description.trim(),
        category: payload.category,
        submitter_id: payload.submitterId,
        status: payload.status,
        language: payload.language,
        implementation_cost: payload.implementationCost,
        expected_roi: payload.expectedRoi,
        strategic_alignment_score: payload.strategicAlignmentScore,
        strategic_alignment: payload.strategicAlignment,
        priority_score: 0,
        submitted_at: null,
        evaluated_at: null,
        implemented_at: null,
        idea_reference_code: null,
        average_evaluation_score: null,
        feasibility_study_url: null,
        pricing_offer_url: null,
        prototype_images_urls: [],
        current_stage: null,
        assigned_evaluator_id: null
      });

      // 2. Create attachments if any, also using the transaction client
      if (attachments.length > 0) {
        await tx.createMany(
          "IdeaAttachment",
          attachments.map((att) => ({
            idea_id: idea.id,
            file_url: att.url,
            file_type: att.type,
            file_name: att.name,
            uploaded_by: payload.submitterId,
          }))
        );
      }

      logger.performance(`Idea creation transaction for ${idea.id}`, start);
      return idea;
    });
  }
}
