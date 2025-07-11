
/* eslint-disable @typescript-eslint/no-explicit-any */

import "reflect-metadata";
import { Prisma, PrismaClient } from '@prisma/client';
import { inject, injectable } from "inversify";
import {
  IDatabase,
  ModelName,
  ModelType,
  Where,
  OrderBy,
  WhereUnique,
  CreateData,
  UpdateData,
} from "./IDatabase"; // Adjust path to your IDatabase interface file
import { TYPES, type DatabaseConfig } from "@/types/dbtypes";

@injectable()
export class PostgresDatabase implements IDatabase {
  private prisma: PrismaClient;

  constructor(@inject(TYPES.DatabaseConfig) config: DatabaseConfig) {
    this.prisma = new PrismaClient({
      datasources: { db: { url: config.local } },
    });
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
  // private getModel(modelName: string): PrismaClient[keyof PrismaClient] {
  //   const model = modelName.toLowerCase() as keyof PrismaClient;
  //   const prismaModel = this.prisma[model];
  //   if (!prismaModel) {
  //     throw new Error(`Model ${modelName} not found in Prisma client.`);
  //   }
  //   return prismaModel;
  // }
  private getModel<T extends ModelName>(model: T) {
    // switch (model.toLowerCase()) {
    //   case "profile":
    //     return this.prisma.profile;
    //   case "idea":
    //     return this.prisma.idea;
    //   case "evaluation":
    //     return this.prisma.evaluation;
    //   default:
    //     throw new Error(`Model ${model} not found in Prisma client.`);
    // }
    type Delegate = T extends "Profile"
      ? Prisma.ProfileDelegate
      : T extends "Idea"
      ? Prisma.IdeaDelegate
      : T extends "Evaluation"
      ? Prisma.EvaluationDelegate
      : T extends "IdeaComment"
      ? Prisma.IdeaCommentDelegate
      : never;

    return this.prisma[model.toLowerCase() as keyof PrismaClient] as Delegate;
  }

	async query<T>(queryString: string, params: unknown[]): Promise<T[]> {
    return this.prisma.$queryRawUnsafe<T[]>(queryString, ...params);
  }

  async find<T extends ModelName>(
    model: T,
    where: Where<ModelType<T>>,
    orderBy?: OrderBy
  ): Promise<ModelType<T>[]> {
    // We use a dynamic accessor for the Prisma delegate (e.g., prisma.idea).
    // The model name is lowercased to match Prisma's client API.
    // `any` is used because TypeScript can't statically verify this dynamic access.
    // const delegate = (this.prisma as any)[model.toLowerCase()];
    // type Delegate = T extends "Profile"
    //   ? Prisma.ProfileDelegate
    //   : T extends "Idea"
    //   ? Prisma.IdeaDelegate
    //   : T extends "Evaluation"
    //   ? Prisma.EvaluationDelegate
    //   : never;

    // const delegate = this.getModel(model);
    // const delegate = this.getModel(model) as Delegate;
    // const delegate = this.getModel(model) as Prisma.ProfileDelegate | Prisma.IdeaDelegate | Prisma.EvaluationDelegate | Prisma.IdeaCommentDelegate;
    const delegate = (this.prisma as any)[model.toLowerCase()];

    return delegate.findMany({
      where,
      orderBy,
      // where: where as any, // Assertion needed for generic Where type
      // orderBy: orderBy as any, // Assertion needed for generic OrderBy type
    }) as Promise<ModelType<T>[]>;
  }

  async findOne<T extends ModelName>(
    model: T,
    where: WhereUnique<ModelType<T>>
  ): Promise<ModelType<T> | null> {
    const delegate = (this.prisma as any)[model.toLowerCase()];
    return delegate.findUnique({
      where,
    });
  }

  async count<T extends ModelName>(
    model: T,
    where?: Where<ModelType<T>>
  ): Promise<number> {
    const delegate = (this.prisma as any)[model.toLowerCase()];
    return delegate.count({
      where,
    });
  }

  async create<T extends ModelName>(
    model: T,
    data: CreateData<ModelType<T>>
  ): Promise<ModelType<T>> {
    const delegate = (this.prisma as any)[model.toLowerCase()];
    return delegate.create({ data: data as Prisma.XOR<any, any> });
  }

  async update<T extends ModelName>(
    model: T,
    where: WhereUnique<ModelType<T>>,
    data: UpdateData<ModelType<T>>
  ): Promise<ModelType<T>> {
    const delegate = (this.prisma as any)[model.toLowerCase()];
    return delegate.update({ where, data: data as Prisma.XOR<any, any> });
  }
}

