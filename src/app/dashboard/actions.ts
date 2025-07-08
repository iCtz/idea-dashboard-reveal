"use server";

import { revalidatePath } from "next/cache";
// import { db } from "@/lib/db";
import { getDatabase } from "@/database";

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
    // await db.profile.upsert({
    //   where: { id: payload.id },
    //   update: {
    //     full_name: payload.fullName,
    //     department: payload.department,
    //     role: payload.role,
    //   },
    //   create: {
    //     id: payload.id,
    //     email: payload.email,
    //     full_name: payload.fullName,
    //     department: payload.department,
    //     role: payload.role,
    //   },
    // });
    const { id, ...data } = payload;

    // Check if the profile exists
    const existingProfile = await database.findOne("Profile", { id: payload.id });

    if (existingProfile) {
      // If the profile exists, update it
      await database.update("Profile", id, data);
    } else {
      // If the profile doesn't exist, create it
      await database.insert("Profile", { id, ...data });
    }

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
    // await db.idea.create({
    const database = getDatabase();

    const data = {
        title: payload.title,
        description: payload.description,
        category: payload.category,
        submitter_id: payload.submitterId,
        implementation_cost: payload.implementationCost,
        expected_roi: payload.expectedRoi,
        strategic_alignment_score: payload.strategicAlignmentScore,
        status: "submitted", // Default status on creation
      };
    // });
    await database.insert("Idea", data);

    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Failed to create idea:", error);
    return { error: "Failed to submit idea." };
  }
}
