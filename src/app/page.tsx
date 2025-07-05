
import { auth } from "../../auth";
import { AuthPage } from "@/components/auth/AuthPage";
import { Dashboard } from "@/components/dashboard/Dashboard";

export default async function HomePage() {
  const session = await auth();

  // If there is no session, show the authentication page.
  // This logic is now handled by NextAuth, not Supabase directly.
  if (!session) {
    return <AuthPage />;
  }

  // If there is a session, show the user's dashboard.
  return <Dashboard user={session.user} />;
}
