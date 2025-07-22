
import { auth } from "@/../auth";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { db } from "@lib/db";
import type { Idea, Profile, User } from "@prisma/client";
import { AuthPage } from "@/components/auth/AuthPage";
import { getEvaluatorDashboardData, getSubmitterDashboardData, type EvaluatorDashboardData, type SubmitterDashboardData } from "@/app/dashboard/actions";
import { LanguageProvider } from "@/contexts/LanguageProvider";

/**
 * This is the main secure entry point for the dashboard.
 * It's a server component that handles authentication and initial data fetching.
 */
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    // If the user is not authenticated, redirect them to the login page.
    return (
      <LanguageProvider>
        <AuthPage />
      </LanguageProvider>
    );
  }

  const profile: Profile | null = await db.profile.findUnique({ where: { id: session.user.id } });

  // Conditionally fetch data based on the user's role
  let submitterDashboardData: SubmitterDashboardData | null = null;
  let evaluatorDashboardData: EvaluatorDashboardData | null = null;
  let allIdeas: Idea[] = [];
  let userCount = 0;

  if (profile?.role === "submitter") {
    submitterDashboardData = await getSubmitterDashboardData();
  } else if (profile?.role === "evaluator") {
    evaluatorDashboardData = await getEvaluatorDashboardData();
  } else if (profile?.role === "management") {
    [allIdeas, userCount] = await Promise.all([
      db.idea.findMany({ orderBy: { created_at: "desc" } }),
      db.profile.count(),
    ]);
  }

      // Render the client component with the user and profile data.
  return (
    <LanguageProvider>
      <DashboardClient
        user={session.user as User}
        submitterData={submitterDashboardData}
        evaluatorData={evaluatorDashboardData}
        profile={profile}
        allIdeas={allIdeas}
        userCount={userCount}
      />
    </LanguageProvider>
  );
}
