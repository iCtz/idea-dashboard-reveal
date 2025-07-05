import type { Prisma } from "@prisma/client";
import { UUID } from "crypto";

// This pattern allows us to get the full type information for our models,
// including relations, if they are defined in your Prisma schema.

export type Profile = Prisma.ProfileGetPayload<object>;

export type Idea = Prisma.IdeaGetPayload<object>;

export type Evaluation = Prisma.EvaluationGetPayload<object>;

export type IdeaComment = Prisma.IdeaCommentGetPayload<object>;
