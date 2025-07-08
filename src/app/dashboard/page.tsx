import { redirect } from "next/navigation";
import { auth } from "@/../auth";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
// import { db } from "@/lib/db";
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

  // Fetch the user's profile from the database on the server.
  // const profile: Profile | null = await db.profile.findUnique({
  //   where: {
  //     id: session.user.id,
  //   },
  // });
  const database = getDatabase();

  const profile: Profile | null = await database.findOne("Profile", { id: session.user.id });

  // Conditionally fetch data based on the user's role
  let ideas: Idea[] = [];
  let evaluations: Evaluation[] = [];
  let allIdeas: Idea[] = [];
  let userCount = 0;

  // if (profile?.role === "submitter") {
  //   ideas = await db.idea.findMany({
  //     where: { submitter_id: session.user.id },
  //     orderBy: { created_at: "desc" },
  //   });
  // } else if (profile?.role === "evaluator") {
  //   ideas = await db.idea.findMany({
  //     where: { status: { in: ["submitted", "under_review"] } },
  //     orderBy: { created_at: "desc" },
  //   });
  //   evaluations = await db.evaluation.findMany({
  //     where: { evaluator_id: session.user.id },
  //   });
  // } else if (profile?.role === "management") {
  //   [allIdeas, userCount] = await Promise.all([
  //     db.idea.findMany({ orderBy: { created_at: "desc" } }),
  //     db.profile.count(),
  //   ]);
  // }

  // // Render the client component with the user and profile data.
  // return (
  //   <DashboardClient
  //     user={session.user}
  //     profile={profile}
  //     ideas={ideas}
  //     evaluations={evaluations}
  //     allIdeas={allIdeas}
  //     userCount={userCount}
  //   />
  // );
  if (profile?.role === "submitter") {
    ideas = await database.find("Idea", { submitter_id: session.user.id }, { column: "created_at", order: "DESC" });
  } else if (profile?.role === "evaluator") {
    [ideas, evaluations] = await Promise.all([
      database.find("Idea", { status: { in: ["submitted", "under_review"] } }, { column: "created_at", order: "DESC" }),
      database.find("Evaluation", { evaluator_id: session.user.id }),
    ]);
} else if (profile?.role === "management") {
    [allIdeas, userCount] = await Promise.all([
      database.find("Idea", {}, { column: "created_at", order: "DESC" }),
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
    >;</DashboardClient>
    );
}

