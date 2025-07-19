
import "reflect-metadata";
import { inject, injectable } from "inversify";
import type { IDatabase } from "@/database/IDatabase";
import { TYPES } from "@/types/dbtypes";
import { logger } from "@lib/logger";

export interface DashboardStats {
  totalIdeas: number;
  totalUsers: number;
  activeIdeas: number;
  implementedIdeas: number;
  successRate: number;
  avgTimeToImplement: number;
};

export interface ChartData {
  name: string;
  value: number;
};

export interface ManagementDashboardData {
  stats: DashboardStats;
  categoryData: ChartData[];
  statusData: ChartData[];
}


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
}
