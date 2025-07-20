"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDatabase } from "@/database";
import { container } from "@/lib/inversify.config";
import { IdeaService, type CreateIdeaPayload } from "@/services/IdeaService";
import { TYPES } from "@/types/dbtypes";
import { DashboardService, type ManagementDashboardData, type SubmitterDashboardData, type EvaluatorDashboardData, type CreateEvaluationPayload } from "@/services/DashboardService";
import { logger } from "@/lib/logger";
import { auth } from "@/../auth";
import { AttachmentFileType, Evaluation, Idea, Profile, IdeaCategory, IdeaStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";
import { uploadFile } from "@/utils/upload";

interface UpdateProfilePayload {
  id: string;
  email: string; // Add missing email field
  fullName: string;
  department: string;
  role: "submitter" | "evaluator" | "management";
}

const CreateIdeaSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  category: z.nativeEnum(IdeaCategory),
  submitterId: z.string().uuid(),
  implementationCost: z.string().nullable().transform(val => val ? new Decimal(val) : null),
  expectedRoi: z.string().nullable().transform(val => val ? new Decimal(val) : null),
  strategicAlignmentScore: z.number().int().min(1).max(10).nullable(),
  status: z.nativeEnum(IdeaStatus),
  language: z.string().min(2),
  strategicAlignment: z.array(z.string()),
});

const CreateEvaluationSchema = z.object({
  idea_id: z.string().uuid(),
  evaluator_id: z.string().uuid(),
  feasibility_score: z.number().int().min(1).max(10),
  impact_score: z.number().int().min(1).max(10),
  innovation_score: z.number().int().min(1).max(10),
  overall_score: z.number().int().min(1).max(10),
  feedback: z.string().optional(),
  recommendation: z.string().min(1, "Recommendation is required."),
});

export async function updateProfile(payload: UpdateProfilePayload) {
  const database = getDatabase();
  try {
    const { id, ...data } = payload;

    // Check if the profile exists
    const existingProfile = await database.findOne("Profile", { id: payload.id });

    if (existingProfile) {
      // If the profile exists, update it
      await database.update("Profile", { id }, {
        full_name: data.fullName,
        department: data.department,
        role: data.role,
      });
    } else {
      // If the profile doesn't exist, create it
      await database.create("Profile", {
        // id: payload.id,
        email: payload.email,
        full_name: payload.fullName,
        department: payload.department,
        role: payload.role,
        email_confirmed: true,
      });
    }

    // Revalidate the path to ensure the UI updates with the new profile info.
    revalidatePath("/dashboard");
  } catch (error) {
    logger.error("Failed to update profile:", (error as Error).message);
    return { error: "Failed to update profile.", details: (error as Error).message || "Unknown error" };
  }
}
export async function createIdeaWithFiles(formData: FormData) {
  try {
    // const attachments = await uploadAllFiles(files); // Extract to a helper
    const rawData = Object.fromEntries(formData.entries());

    // Extract and parse the idea payload
    // 1. Extract and validate idea payload from FormData
    const rawPayload = formData.get("payload");
    if (typeof rawPayload !== "string") {
      throw new Error("Invalid payload type");
    }
    const ideaPayload = JSON.parse(rawPayload);
    const validatedPayload = CreateIdeaSchema.parse(ideaPayload);

    // 2.
    const fileEntries = Array.from(formData.entries()).filter(
      ([key]) => key !== "payload"
    ) as [string, File][];

    const uploadPromises = fileEntries.map(async ([type, file]) => {
      const { url } = await uploadFile(file);
      return { url, type: type as AttachmentFileType, name: file.name };
    });

    const attachments = await Promise.all(uploadPromises);

    // 3. Resolve the IdeaService and create the idea and attachments in a transaction
    const ideaService = container.get<IdeaService>(TYPES.IdeaService);
    const createdIdea = await ideaService.createIdeaWithFiles(
      validatedPayload,
      attachments
    );

    revalidatePath("/dashboard");

    return { success: true, ideaId: createdIdea.id };
  } catch (error) {
    logger.error("Failed to create idea with files:", (error as Error).message);
    if (error instanceof z.ZodError) {
      return {
        error: "Validation failed",
        details: error.flatten().fieldErrors
      };
    }
    return { error: "Failed to submit idea.", details: (error as Error).message || "Unknown error" };
  }
}

export async function createEvaluation(payload: CreateEvaluationPayload) {
  try {
    const validatedPayload = CreateEvaluationSchema.parse(payload);

    const dashboardService = container.get<DashboardService>(TYPES.DashboardService);
    const evaluation = await dashboardService.createEvaluation(validatedPayload);

    revalidatePath("/dashboard");
    return { success: true, evaluation };
  } catch (error) {
    logger.error("Failed to create evaluation:", (error as Error).message);
    if (error instanceof z.ZodError) {
      return {
        error: "Validation failed",
        details: error.flatten().fieldErrors,
      };
    }
    return {
      error: "Failed to submit evaluation.",
      details: (error as Error).message || "Unknown error",
    };
  }
}


export async function getManagementDashboardData(): Promise<ManagementDashboardData | null> {
  try {
    const dashboardService = container.get<DashboardService>(TYPES.DashboardService);
    const data = await dashboardService.getManagementDashboardData();
    return data;
  } catch (error) {
    logger.error("Failed to fetch management dashboard data:", (error as Error).message);
    return null;
  }
}

export async function getListOfValues(listKey: string) {
  try {
    const values = await db.listOfValue.findMany({
      where: {
        list_key: listKey,
        is_active: true,
      },
      orderBy: {
        value_en: 'asc',
      },
    });
    return { data: values };
  } catch (error) {
    logger.error(`Failed to fetch list of values for key "${listKey}":`, (error as Error).message);
    return { error: `Failed to fetch list of values for key "${listKey}".` };
  }
}

export async function getSubmitterDashboardData(): Promise<SubmitterDashboardData | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const dashboardService = container.get<DashboardService>(TYPES.DashboardService);
    const data = await dashboardService.getSubmitterDashboardData(session.user.id);
    return data;
  } catch (error) {
    logger.error("Failed to fetch submitter dashboard data:", (error as Error).message);
    return null;
  }
}

export async function getEvaluatorDashboardData(): Promise<EvaluatorDashboardData | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }

    const dashboardService = container.get<DashboardService>(TYPES.DashboardService);
    const data = await dashboardService.getEvaluatorDashboardData(session.user.id);
    return data;
  } catch (error) {
    logger.error("Failed to fetch evaluator dashboard data:", (error as Error).message);
    return null;
  }
}

export type { CreateIdeaPayload, ManagementDashboardData, SubmitterDashboardData, EvaluatorDashboardData, CreateEvaluationPayload };

