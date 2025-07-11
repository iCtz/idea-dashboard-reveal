import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { container } from "@/lib/inversify.config"; // Import the container
import { TYPES } from "@/types/dbtypes"; // Import TYPES
import { IDatabase } from "@/database/IDatabase"; // Import IDatabase

export const authConfig = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  providers: [
    Credentials({
      // The `authorize` function is where the login validation happens.
      // Any error thrown here will cause the server to crash the request.
      async authorize(credentials) {
        console.log("AUTHORIZE: Attempting to log in with:", credentials.email);

        // 1. Validate that email and password exist
        if (!credentials?.email || !credentials.password) {
          console.error("AUTHORIZE: Missing email or password.");
          return null; // Returning null gracefully fails authentication
        }

        // 2. Wrap database logic in a try/catch block to prevent crashes
        try {
          const database = container.get<IDatabase>(TYPES.IDatabase);

          const user = await database.findOne("Profile", {
              email: credentials.email as string,
          });

          // 3. Check if user was found and has a password
          // IMPORTANT: Ensure your user model has a `hashedPassword` field
          if (!user || !user.password) {
            console.warn("AUTHORIZE: User not found or has no password:", credentials.email);
            return null;
          }

          // 4. Compare the provided password with the stored hash
          const passwordsMatch = user.password === credentials.password;
          // const passwordsMatch = await bcrypt.compare(
          //   credentials.password as string,
          //   user.password
          // );

          if (!passwordsMatch) {
            console.warn("AUTHORIZE: Password mismatch for user:", user.email);
            return null;
          }

          console.log("AUTHORIZE: Success! User authenticated:", user.email);
          // 5. On success, return the user object
          return user;
        } catch (error) {
          console.error("AUTHORIZE: An unexpected error occurred:", error);
          return null; // Return null to prevent the server from crashing
        }
      },
    }),
  ],
  callbacks: {
    /**
     * The `session` callback is called when a session is checked.
     * We can use this to add the user's profile data (id, role, etc.) to the session object.
     */
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as "submitter" | "evaluator" | "management";
      }
      if (token.full_name && session.user) {
        session.user.full_name = token.full_name as string;
      }
      if (token.department && session.user) {
        session.user.department = token.department as string;
      }
      return session;
    },

    /**
     * The `jwt` callback is called when a JWT is created (i.e., at sign in)
     * or updated (i.e., when a session is accessed in the background).
     * We can use this to persist the user's profile data in the token.
     */
    async jwt({ token, trigger, user }) {

      if (!token.sub) return token;

      // When the user signs in, `trigger` is "signIn" and the `user` object is passed.
      // We use this opportunity to fetch the profile data once and attach it to the token.
      // This database call happens in a Node.js environment (the sign-in API route), so it's safe.
      if (trigger === "signIn" && user) {
        const database = container.get<IDatabase>(TYPES.IDatabase);
        const userProfile = await database.findOne("Profile", { id: user.id });
        if (userProfile) {
          console.log("USER Profile", userProfile)
          token.role = userProfile.role;
          token.full_name = userProfile.full_name;
          token.department = userProfile.department;
        }
      }

      return token;
    },
  },
} satisfies NextAuthConfig;
