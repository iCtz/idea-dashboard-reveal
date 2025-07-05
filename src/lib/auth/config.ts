import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";
import { db } from "@lib/db";
import { LoginSchema } from "./schemas";

export const authConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await db.profile.findUnique({
            where: { email },
          });

          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(
            password,
            user.password
          );

          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // The user object is only available on the first sign-in.
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // The token object contains the data from the jwt callback.
      // We add the user id (from token.sub) and role to the session object.
      if (token.sub && session.user && token.role) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
