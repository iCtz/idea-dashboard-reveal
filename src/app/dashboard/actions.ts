"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDatabase } from "@/database";
import { container } from "@/lib/inversify.config";
import { IdeaService, type CreateIdeaPayload } from "@/services/IdeaService";
import { TYPES } from "@/types/dbtypes";
import { logger } from "@/lib/logger";
import { AttachmentFileType, IdeaCategory, IdeaStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";
import { uploadAllFiles } from "@/utils/upload";

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
  implementationCost: z.string().transform(val => val ? new Decimal(val) : null).nullable().optional(),
  expectedRoi: z.string().transform(val => val ? new Decimal(val) : null).nullable().optional(),
  strategicAlignmentScore: z.number().int().min(1).max(10),
  status: z.nativeEnum(IdeaStatus),
  language: z.string().min(2),
  strategicAlignment: z.array(z.string()),
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

export async function createIdea(payload: CreateIdeaPayload) {
  try {
    // Validate essential fields before passing to the service
    const validatedPayload = CreateIdeaSchema.parse(payload);

    // Resolve the IdeaService from the container
    const ideaService = container.get<IdeaService>(TYPES.IdeaService);
    // Delegate the creation logic to the service
    const createdIdea = await ideaService.createIdea(validatedPayload);


    revalidatePath("/dashboard");

    return { success: true, ideaId: createdIdea.id };
  } catch (error) {
    logger.error("Failed to create idea:", (error as Error).message);
    if (error instanceof z.ZodError) {
      return { error: "Invalid form data.", details: error.flatten().fieldErrors };
    }
    return { error: "Failed to submit idea.", details: (error as Error).message || "Unknown error" };
  }
}

export async function createIdeaWithFiles(
  ideaPayload: CreateIdeaPayload,
  files: { type: string; file: File }[]
) {
  try {
    const attachments = await uploadAllFiles(files); // Extract to a helper
    const validatedPayload = CreateIdeaSchema.parse(ideaPayload);
    const ideaService = container.get<IdeaService>(TYPES.IdeaService);
    // Delegate the creation logic to the service
    const createdIdea = await ideaService.createIdeaWithFiles(ideaPayload, attachments);


    revalidatePath("/dashboard");

    return { success: true, ideaId: createdIdea.id };
  } catch (error) {
    logger.error("Failed to create idea:", (error as Error).message);
    if (error instanceof z.ZodError) {
      return { error: "Invalid form data.", details: error.flatten().fieldErrors };
    }
    return { error: "Failed to submit idea.", details: (error as Error).message || "Unknown error" };
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

export { CreateIdeaPayload };

