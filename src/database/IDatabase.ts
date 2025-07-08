
import { Prisma } from "@prisma/client";
import { Idea, Profile, Evaluation } from "../types/types"; // Adjust the import path as

/**
 * Defines the contract for a database service, abstracting the underlying ORM.
 */
export interface IDatabase {
  
  // A method for raw queries, useful for complex joins or specific database features.
  query<T>(queryString: string, params: unknown[]): Promise<T[]>;

  // Overload the 'find' method for each model to ensure type safety
  find(model: "Idea", where: Prisma.IdeaWhereInput, orderBy?: Prisma.IdeaOrderByWithRelationInput): Promise<Idea[]>;
  find(model: "Profile", where: Prisma.ProfileWhereInput, orderBy?: Prisma.ProfileOrderByWithRelationInput): Promise<Profile[]>;
  find(model: "Evaluation", where: Prisma.EvaluationWhereInput, orderBy?: Prisma.EvaluationOrderByWithRelationInput): Promise<Evaluation[]>;

  // Overload the 'findOne' method
  findOne(model: "Profile", where: Prisma.ProfileWhereUniqueInput): Promise<Profile | null>;
  findOne(model: "Idea", where: Prisma.IdeaWhereUniqueInput): Promise<Idea | null>;
  findOne(model: "Evaluation", where: Prisma.EvaluationWhereUniqueInput): Promise<Evaluation | null>;

  // Overload the 'count' method
  count(model: "Profile", where?: Prisma.ProfileWhereInput): Promise<number>;
  count(model: "Idea", where?: Prisma.IdeaWhereInput): Promise<number>;
  count(model: "Evaluation", where?: Prisma.EvaluationWhereInput): Promise<number>;

  // Overload the 'create' method
  create(model: "Profile", data: Prisma.ProfileCreateInput): Promise<Profile>;
  create(model: "Idea", data: Prisma.IdeaCreateInput): Promise<Idea>;
  create(model: "Evaluation", data: Prisma.EvaluationCreateInput): Promise<Evaluation>;

  // Overload the 'update' method
  update(model: "Profile", where: Prisma.ProfileWhereUniqueInput, data: Prisma.ProfileUpdateInput): Promise<Profile>;
  update(model: "Idea", where: Prisma.IdeaWhereUniqueInput, data: Prisma.IdeaUpdateInput): Promise<Idea>;
  update(model: "Evaluation", where: Prisma.EvaluationWhereUniqueInput, data: Prisma.EvaluationUpdateInput): Promise<Evaluation>;
}
