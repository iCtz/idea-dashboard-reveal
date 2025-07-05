"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

interface UpdateProfilePayload {
  id: string;
  email: string;
  fullName: string;
  department: string;
  role: "submitter" | "evaluator" | "management";
}

export async function updateProfile(payload: UpdateProfilePayload) {
  try {
    await db.profile.upsert({
      where: { id: payload.id },
      update: {
        full_name: payload.fullName,
        department: payload.department,
        role: payload.role,
      },
      create: {
        id: payload.id,
        email: payload.email,
        full_name: payload.fullName,
        department: payload.department,
        role: payload.role,
      },
    });

    // Revalidate the path to ensure the UI updates with the new profile info.
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { error: "Failed to update profile." };
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
}) {
  try {
    await db.idea.create({
      data: {
        title: payload.title,
        description: payload.description,
        category: payload.category,
        submitter_id: payload.submitterId,
        implementation_cost: payload.implementationCost,
        expected_roi: payload.expectedRoi,
        strategic_alignment_score: payload.strategicAlignmentScore,
        status: "submitted", // Default status on creation
      },
    });

    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Failed to create idea:", error);
    return { error: "Failed to submit idea." };
  }
}
