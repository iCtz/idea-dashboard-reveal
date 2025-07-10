import { redirect } from "next/navigation";
import { auth } from "@/../auth";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getDatabase } from "@/database";
import { Idea, Profile, Evaluation } from "@/types/types";

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

  const database = getDatabase();

  const profile: Profile | null = await database.findOne("Profile", { id: session.user.id });

  // Conditionally fetch data based on the user's role
  let ideas: Idea[] = [];
  let evaluations: Evaluation[] = [];
  let allIdeas: Idea[] = [];
  let userCount = 0;

  if (profile?.role === "submitter") {
    ideas = await database.find("Idea", { submitter_id: session.user.id }, { created_at: "desc" });
  } else if (profile?.role === "evaluator") {
    // Use a raw query for complex "IN" clauses not supported by the generic interface
    const pendingIdeasQuery = 'SELECT * FROM "Idea" WHERE "status" IN (\'submitted\', \'under_review\') ORDER BY "created_at" DESC';
    [ideas, evaluations] = await Promise.all([
      database.query<Idea>(pendingIdeasQuery, []),
      database.find("Evaluation", { evaluator_id: session.user.id }),
    ]);
} else if (profile?.role === "management") {
    [allIdeas, userCount] = await Promise.all([
      database.find("Idea", {}, { created_at: "desc" }),
      database.count("Profile"),
      // database.query("SELECT COUNT(*) as count FROM Profile").then(res => res[0]?.count || 0), // Adjust based on your query result
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

