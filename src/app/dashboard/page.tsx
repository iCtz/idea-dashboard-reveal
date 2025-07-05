import { redirect } from "next/navigation";
import { auth } from "@/../auth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { db } from "@/lib/db";

/**
 * This is the main secure entry point for the dashboard.
 * It's a server component that handles authentication and initial data fetching.
 */
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    // If the user is not authenticated, redirect them to the login page.
    redirect("/");
  }

  // Fetch the user's profile from the database on the server.
//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("*")
//     .eq("id", session.user.id)
//     .single();

  const { data: profile } = { data: await db.profile.findUnique({
		where: {
		id: session.user.id,
		},
	})};

  // Render the client component with the user and profile data.
  return <DashboardClient user={session.user} profile={profile} />;
}
