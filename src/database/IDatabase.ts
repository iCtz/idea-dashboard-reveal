
import { Prisma } from "@prisma/client";
import { Idea, Profile, Evaluation } from "../types/types"; // Adjust the import path as needed.

// Define your model names as a union type
export type ModelName = "Idea" | "Profile" | "Evaluation";

// Map model names to their respective types
export type ModelType<T extends ModelName> = T extends "Idea"
  ? Idea
  : T extends "Profile"
  ? Profile
  : T extends "Evaluation"
  ? Evaluation
  : never;

// Generic type mappings for Prisma inputs
export type WhereInput<T extends ModelName> = T extends "Idea"
  ? Prisma.IdeaWhereInput
  : T extends "Profile"
  ? Prisma.ProfileWhereInput
  : T extends "Evaluation"
  ? Prisma.EvaluationWhereInput
  : never;

export type OrderByInput<T extends ModelName> = T extends "Idea"
  ? Prisma.IdeaOrderByWithRelationInput
  : T extends "Profile"
  ? Prisma.ProfileOrderByWithRelationInput
  : T extends "Evaluation"
  ? Prisma.EvaluationOrderByWithRelationInput
  : never;

export type WhereUniqueInput<T extends ModelName> = T extends "Idea"
  ? Prisma.IdeaWhereUniqueInput
  : T extends "Profile"
  ? Prisma.ProfileWhereUniqueInput
  : T extends "Evaluation"
  ? Prisma.EvaluationWhereUniqueInput
  : never;

export type CreateInput<T extends ModelName> = T extends "Idea"
  ? Prisma.IdeaCreateInput
  : T extends "Profile"
  ? Prisma.ProfileCreateInput
  : T extends "Evaluation"
  ? Prisma.EvaluationCreateInput
  : never;

export type UpdateInput<T extends ModelName> = T extends "Idea"
  ? Prisma.IdeaUpdateInput
  : T extends "Profile"
  ? Prisma.ProfileUpdateInput
  : T extends "Evaluation"
  ? Prisma.EvaluationUpdateInput
  : never;

/**
 * Defines the contract for a database service, abstracting the underlying ORM.
 * This version uses generics for better scalability and maintainability.
 */
export interface IDatabase {
  // A method for raw queries, useful for complex joins or specific database features.
  query<T>(queryString: string, params: unknown[]): Promise<T[]>;

  find<T extends ModelName>(
    model: T,
    where: WhereInput<T>,
    orderBy?: OrderByInput<T>
  ): Promise<ModelType<T>[]>;

  findOne<T extends ModelName>(
    model: T,
    where: WhereUniqueInput<T>
  ): Promise<ModelType<T> | null>;

  count<T extends ModelName>(
    model: T,
    where?: WhereInput<T>
  ): Promise<number>;

  create<T extends ModelName>(
    model: T,
    data: CreateInput<T>
  ): Promise<ModelType<T>>;

  update<T extends ModelName>(
    model: T,
    where: WhereUniqueInput<T>,
    data: UpdateInput<T>
  ): Promise<ModelType<T>>;
}
