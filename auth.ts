import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
// Update the import path below if your db file is located elsewhere, e.g.:
import { db } from "@lib/db";
// or provide the correct relative path to where your db module is defined
import { authConfig } from "@lib/auth/config";
import { SupabaseAdapter } from "@auth/supabase-adapter";


export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: process.env.USE_LOCAL_AUTH
    ? PrismaAdapter(db)
    : SupabaseAdapter({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      }),
  ...authConfig,
});
