import NextAuth from "next-auth";
import { db } from "@lib/db";
import { authConfig } from "@lib/auth/config";
import { SupabaseAdapter } from "@auth/supabase-adapter";

// --- DEBUGGING STEP ---
console.log(`[Auth] USE_LOCAL_AUTH is set to: ${process.env.USE_LOCAL_AUTH}`);

// When USE_LOCAL_AUTH is true, we use the "credentials" provider as a fallback.
// In this mode, we rely purely on the JWT session strategy. An adapter is not
// needed and can interfere with the data flow from `authorize` to the `jwt` callback.
// When USE_LOCAL_AUTH is false, we use the Supabase adapter, presumably for
let adapter;

if (process.env.USE_LOCAL_AUTH === "true") {
  // In local mode, we use a pure JWT strategy without a database adapter.
  adapter = undefined;
} else {
  // In Supabase mode, ensure the required environment variables are set.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseSecret) {
    throw new Error(
      "Supabase URL and secret key must be provided when not in local auth mode."
    );
  }

  adapter = SupabaseAdapter({ url: supabaseUrl, secret: supabaseSecret });
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter,
  ...authConfig,
});
