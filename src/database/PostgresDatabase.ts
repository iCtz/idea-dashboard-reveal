
import "reflect-metadata";
import { injectable } from "inversify";
import { Prisma, PrismaClient } from "@prisma/client";
import { IDatabase } from "./IDatabase";
import { Profile, Idea, Evaluation } from "@/types/types";

@injectable()
export class PostgresDatabase implements IDatabase {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // A helper to dynamically get the correct Prisma model (e.g., `prisma.profile`).
  // Prisma model names on the client are lowercase.
  // private getModel(modelName: string) {
  //   switch (modelName.toLowerCase()) {
  //     case "profile":
  //       return this.prisma.profile;
  //     case "idea":
  //       return this.prisma.idea;
  //     case "evaluation":
  //       return this.prisma.evaluation;
  //     // Add other models here as needed
  //     default:
  //       throw new Error(`Model ${modelName} not found in Prisma client.`);
  //   }
  // }
  private getModel(modelName: string): unknown {
    const model = modelName.toLowerCase() as keyof PrismaClient;
    const prismaModel = this.prisma[model];
    if (!prismaModel) {
      throw new Error(`Model ${modelName} not found in Prisma client.`);
    }
    return prismaModel;
  }

	async query<T>(queryString: string, params: unknown[]): Promise<T[]> {
    return this.prisma.$queryRawUnsafe<T[]>(queryString, ...params);
  }

  async find(
    model: string,
    where: unknown,
    orderBy?: unknown
  ): Promise<(Profile | Idea | Evaluation)[]> {
    const modelClient = this.getModel(model);
    return modelClient.findMany({ where, orderBy });
  }

  async findOne(model: string, where: unknown): Promise<Profile | Idea | Evaluation | null> {
    const modelClient = this.getModel(model);
    return modelClient.findUnique({ where });
  }

  async count(model: string, where?: unknown): Promise<number> {
    const modelClient = this.getModel(model);
    return modelClient.count({ where });
  }

  async create(model: string, data: unknown): Promise<Profile | Idea | Evaluation> {
    const modelClient = this.getModel(model);
    return modelClient.create({ data });
  }

  async update(model: string, where: unknown, data: unknown): Promise<Profile | Idea | Evaluation> {
    const modelClient = this.getModel(model);
    return modelClient.update({ where, data });
  }
}
