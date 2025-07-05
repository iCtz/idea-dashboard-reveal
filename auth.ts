import NextAuth from "next-auth";
import { db } from "@lib/db";
import { authConfig } from "@lib/auth/config";
import { SupabaseAdapter } from "@auth/supabase-adapter";

// When USE_LOCAL_AUTH is true, we use the "credentials" provider as a fallback.
// In this mode, we rely purely on the JWT session strategy. An adapter is not
// needed and can interfere with the data flow from `authorize` to the `jwt` callback.
// When USE_LOCAL_AUTH is false, we use the Supabase adapter, presumably for
// other OAuth providers that you might add later.
const adapter = process.env.USE_LOCAL_AUTH
  ? undefined
  : SupabaseAdapter({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    });

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter,
  ...authConfig,
});
