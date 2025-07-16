"use server";

import { revalidatePath } from "next/cache";
import { getDatabase } from "@/database";
import { container } from "@/lib/inversify.config";
import { IdeaService } from "@/services/IdeaService";
import { TYPES } from "@/types/dbtypes";

interface UpdateProfilePayload {
  id: string;
  email: string;
  fullName: string;
  department: string;
  role: "submitter" | "evaluator" | "management";
}

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
    console.error("Failed to update profile:", error);
    return { error: "Failed to update profile.", details: (error as Error).message || "Unknown error" };
  }
}

export async function createIdea(payload: {
  title: string;
  description: string;
  category: "innovation" | "process_improvement" | "cost_reduction" | "customer_experience" | "technology" | "sustainability";
  submitterId: string;
  implementationCost: number | null;
  expectedRoi: number | null;
  strategicAlignmentScore: number | null;
  status: string,
  language: string,
}) {
  try {
    // Resolve the IdeaService from the container
    const ideaService = container.get<IdeaService>(TYPES.IdeaService);
    // Delegate the creation logic to the service
    const createdIdea = await ideaService.createIdea(payload);

    revalidatePath("/dashboard");

    return { success: true, ideaId: createdIdea.id };
  } catch (error) {
    console.error("Failed to create idea:", error);
    return { error: "Failed to submit idea.", details: (error as Error).message || "Unknown error" };
  }
}
