import { redirect } from "next/navigation";
import { auth } from "@/../auth";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { db } from "@/lib/db";
import { Idea, Profile, Evaluation } from "@/lib/types";

/**
 * This is the main secure entry point for the dashboard.
 * It's a server component that handles authentication and initial data fetching.
 */
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    // If the user is not authenticated, redirect them to the login page.
    redirect("/");
  }

  // Fetch the user's profile from the database on the server.
  const profile: Profile | null = await db.profile.findUnique({
    where: {
      id: session.user.id,
    },
  });

  // Conditionally fetch data based on the user's role
  let ideas: Idea[] = [];
  let evaluations: Evaluation[] = [];
  let allIdeas: Idea[] = [];
  let userCount = 0;

  if (profile?.role === "submitter") {
    ideas = await db.idea.findMany({
      where: { submitter_id: session.user.id },
      orderBy: { created_at: "desc" },
    });
  } else if (profile?.role === "evaluator") {
    ideas = await db.idea.findMany({
      where: { status: { in: ["submitted", "under_review"] } },
      orderBy: { created_at: "desc" },
    });
    evaluations = await db.evaluation.findMany({
      where: { evaluator_id: session.user.id },
    });
  } else if (profile?.role === "management") {
    [allIdeas, userCount] = await Promise.all([
      db.idea.findMany({ orderBy: { created_at: "desc" } }),
      db.profile.count(),
    ]);
  }

  // Render the client component with the user and profile data.
  return (
    <DashboardClient
      user={session.user}
      profile={profile}
      ideas={ideas}
      evaluations={evaluations}
      allIdeas={allIdeas}
      userCount={userCount}
    />
  );
}
