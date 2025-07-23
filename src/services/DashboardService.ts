
import "reflect-metadata";
import { type Idea, type Evaluation, IdeaStatus } from "@prisma/client";
import { inject, injectable } from "inversify";
import type { IDatabase } from "@/database/IDatabase";
import { TYPES } from "@/types/dbtypes";
import { logger } from "@lib/logger";
import { Decimal } from "@prisma/client/runtime/library";

export interface DashboardStats {
  totalIdeas: number;
  totalUsers: number;
  activeIdeas: number;
  implementedIdeas: number;
  successRate: number;
  avgTimeToImplement: number;
};

export interface SubmitterStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface CreateEvaluationPayload {
  idea_id: string;
  evaluator_id: string;
  feasibility_score: number;
  impact_score: number;
  innovation_score: number;
  overall_score: number;
  feedback: string | undefined;
  recommendation: string;
}

export interface EvaluatorDashboardData {
  ideasForEvaluation: Idea[];
  myEvaluations: Evaluation[];
}

export interface ChartData {
  name: string;
  value: number;
};

export interface ManagementDashboardData {
  stats: DashboardStats;
  categoryData: ChartData[];
  statusData: ChartData[];
}

export interface SubmitterDashboardData {
  stats: SubmitterStats;
  ideas: Idea[];
}

const convertDecimalToNumber = (value: Decimal | null): number | null => {
  return value ? value.toNumber() : null;
};

const sanitizeIdea = (idea: Idea) => ({
  ...idea,
  implementation_cost: convertDecimalToNumber(idea.implementation_cost),
  expected_roi: convertDecimalToNumber(idea.expected_roi),
  average_evaluation_score: convertDecimalToNumber(idea.average_evaluation_score),
});

@injectable()
export class DashboardService {
  constructor(@inject(TYPES.IDatabase) private readonly db: IDatabase) {}

  public async getManagementDashboardData(): Promise<ManagementDashboardData> {
    const start = Date.now();

    const [ideas, totalUsers] = await Promise.all([
      this.db.find("Idea", {}),
      this.db.count("User", {}),
    ]);

    const totalIdeas = ideas.length;
    const implementedIdeas = ideas.filter(idea => idea.status === "implemented").length;
    const activeIdeas = ideas.filter(idea => ["submitted", "under_review", "approved"].includes(idea.status)).length;

    const categoryCount = ideas.reduce((acc: Record<string, number>, idea) => {
      if (idea.category) acc[idea.category] = (acc[idea.category] || 0) + 1;
      return acc;
    }, {});

    const statusCount = ideas.reduce((acc: Record<string, number>, idea) => {
      if (idea.status) acc[idea.status] = (acc[idea.status] || 0) + 1;
      return acc;
    }, {});

    const data: ManagementDashboardData = {
      stats: {
        totalIdeas,
        totalUsers,
        activeIdeas,
        implementedIdeas,
        successRate: totalIdeas > 0 ? Math.round((implementedIdeas / totalIdeas) * 100) : 0,
        avgTimeToImplement: 30, // Placeholder for now
      },
      categoryData: Object.entries(categoryCount).map(([name, value]) => ({ name: name.replace(/_/g, " "), value })),
      statusData: Object.entries(statusCount).map(([name, value]) => ({ name: name.replace(/_/g, " "), value })),
    };

    logger.performance("Dashboard data retrieval", start);
    return data;
  }

  public async getSubmitterDashboardData(submitterId: string): Promise<SubmitterDashboardData> {
    const start = Date.now();

    const ideas = await this.db.find("Idea", { submitter_id: submitterId }, { created_at: "desc" });
    const sanitizedIdeas = ideas.map(sanitizeIdea); // Convert all Decimal fields

    const stats: SubmitterStats = {
      total: sanitizedIdeas.length,
      pending: sanitizedIdeas.filter(idea => ["submitted", "under_review"].includes(idea.status)).length,
      approved: sanitizedIdeas.filter(idea => idea.status === "approved").length,
      rejected: sanitizedIdeas.filter(idea => idea.status === "rejected").length,
    };

    logger.performance(`Submitter dashboard data retrieval for ${submitterId}`, start);
    return { stats, ideas: sanitizedIdeas as unknown as Idea[] };
  }

  public async getEvaluatorDashboardData(evaluatorId: string): Promise<EvaluatorDashboardData | null> {
	const start = Date.now();

	const ideasForEvaluation = await this.db.find("Idea", { status: (IdeaStatus.submitted, IdeaStatus.under_review) }, { submitted_at: "asc" });

	const myEvaluations = await this.db.find("Evaluation", { evaluator_id: evaluatorId }, { created_at: "desc" });

	logger.performance(`Evaluator dashboard data retrieval for ${evaluatorId}`, start);
	return { ideasForEvaluation, myEvaluations };
  }

  public async createEvaluation(payload: CreateEvaluationPayload) {
    return await this.db.create("Evaluation", {
      idea_id: payload.idea_id,
      evaluator_id: payload.evaluator_id,
      feasibility_score: payload.feasibility_score,
      impact_score: payload.impact_score,
      innovation_score: payload.innovation_score,
      overall_score: payload.overall_score,
      feedback: payload.feedback || null,
      recommendation: payload.recommendation,
    });
  }
}
