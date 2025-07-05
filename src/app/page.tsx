import { redirect } from "next/navigation";
import { auth } from "@/../auth";
import { AuthPage } from "@/components/auth/AuthPage";

export default async function HomePage() {
  const session = await auth();

  // If a session exists, redirect the user to their dashboard.
  if (session?.user) {
    redirect("/dashboard");
  }

  // If there is no session, show the authentication/login page.
  return <AuthPage />;
}
