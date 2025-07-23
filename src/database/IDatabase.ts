
import { Idea, IdeaAttachment, Profile, Evaluation, Translation, User, Session, Identity, ListOfValue } from "@/types/types"; // Adjust the import path as needed.
import type { Prisma } from "@prisma/client";

// Define your model names as a union type
export type ModelName =
  "Idea" | "IdeaAttachment" | "Profile" | "Evaluation" | "translations" | "User" | "Session" | "Identity" | "ListOfValue"; // Add auth models as needed

// Map model names to their respective types
export type ModelType<T extends ModelName> =
  T extends "Idea" ? Idea
  : T extends "IdeaAttachment" ? IdeaAttachment
  : T extends "Profile" ? Profile
  : T extends "Evaluation" ? Evaluation
  : T extends "translations" ? Translation
  : T extends "User" ? User
  : T extends "Session" ? Session
  : T extends "Identity" ? Identity
  : T extends "ListOfValue" ? ListOfValue
  : never;

// --- ORM-Agnostic Generic Types ---
// A simple key-value pair for basic queries.
// export type Where<T> = Partial<T>;
export type Where<T extends ModelName> =
  T extends "Idea" ? Prisma.IdeaWhereInput
  : T extends "IdeaAttachment" ? Prisma.IdeaAttachmentWhereInput
  : T extends "Profile" ? Prisma.ProfileWhereInput
  : T extends "Evaluation" ? Prisma.EvaluationWhereInput
  : T extends "translations" ? Prisma.TranslationWhereInput
  : T extends "User" ? Prisma.UserWhereInput
  : T extends "Session" ? Prisma.SessionWhereInput
  : T extends "Identity" ? Prisma.IdentityWhereInput
  : T extends "ListOfValue" ? Prisma.ListOfValueWhereInput
  : Partial<ModelType<T>>;

// A unique identifier, typically { id: string } or { email: string }
export type WhereUnique<T> = Partial<T>;

// A simple object for ordering. E.g., { created_at: "desc" }
export type OrderBy = Record<string, "asc" | "desc">;

// Data for creating a new record.
export type CreateData<T> = Omit<T, "id" | "created_at" | "updated_at">;

// Data for updating an existing record.
export type UpdateData<T> = Partial<CreateData<T>>;

/**
 * Defines the contract for a database service, abstracting the underlying ORM.
 * This version uses generics for better scalability and maintainability.
 */
export interface IDatabase {
  // A method for raw queries, useful for complex joins or specific database features.
  query<T>(queryString: string, params: unknown[]): Promise<T[]>;

  find<T extends ModelName>(
    model: T,
    where: Where<T>,
    orderBy?: OrderBy
  ): Promise<ModelType<T>[]>;

  findOne<T extends ModelName>(
    model: T,
    where: WhereUnique<ModelType<T>>
  ): Promise<ModelType<T> | null>;

  count<T extends ModelName>(
    model: T,
    where?: Where<T>
  ): Promise<number>;

  create<T extends ModelName>(
    model: T,
    data: CreateData<ModelType<T>>
  ): Promise<ModelType<T>>;

  update<T extends ModelName>(
    model: T,
    where: WhereUnique<ModelType<T>>,
    data: UpdateData<ModelType<T>>
  ): Promise<ModelType<T>>;

  transaction<T>(
    fn: (tx: IDatabase) => Promise<T>
  ): Promise<T>;

  createMany<T extends ModelName>(
    model: T,
    data: CreateData<ModelType<T>>[]
  ): Promise<ModelType<T>[]>;
}
