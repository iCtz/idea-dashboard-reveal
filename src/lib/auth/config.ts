import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { db } from "@lib/db";
import bcrypt from "bcryptjs";
import { container } from "@/lib/inversify.config"; // Import the container
import { TYPES } from "@/types/dbtypes"; // Import TYPES
import { IDatabase } from "@/database/IDatabase"; // Import IDatabase
import { logger } from '@/lib/logger';

export const authConfig = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  events: {
    createUser: async ({ user }) => {
    },
  },
  providers: [
    Credentials({
      // The `authorize` function is where the login validation happens.
      // Any error thrown here will cause the server to crash the request.
      async authorize(credentials) {
        logger.auth("AUTHORIZE: Attempting to log in with:", credentials.email);

        // 1. Validate that email and password exist
        if (!credentials?.email || !credentials.password) {
          logger.error("AUTHORIZE: Missing email or password.");
          return null; // Returning null gracefully fails authentication
        }

        // 2. Wrap database logic in a try/catch block to prevent crashes
        try {
          const database = container.get<IDatabase>(TYPES.IDatabase);

          const user = await database.findOne("User", {
              email: credentials.email as string,
          });
          // logger.log("user is: ", user)

          // 3. Check if user was found and has a password
          // IMPORTANT: Ensure your user model has a `hashedPassword` field
          if (!user?.encrypted_password) {
            logger.warn("AUTHORIZE: User not found or has no password:", credentials.email as string);
            return null;
          }

          // 4. Compare the provided password with the stored hash
          const passwordsMatch = await bcrypt.compare(
            credentials.password as string,
            user.encrypted_password
          );

          if (!passwordsMatch) {
            logger.warn("AUTHORIZE: Password mismatch for user:", user.email as string);
            return null;
          }

          logger.auth("AUTHORIZE: Success! User authenticated:", user.email);

          // 5. On success, return the user object as a valid User type
          // Ensure role is a valid UserRole (not null or string)
          // You may need to import UserRole type from your types if not already
          // return user;
          const profile = await database.findOne("Profile", {
            email: user.email as string,
          });
          return profile;
        } catch (error) {
          logger.error("AUTHORIZE: An unexpected error occurred:", error as string);
          return null; // Return null to prevent the server from crashing
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
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
          logger.auth("USER Profile", userProfile)
          token.role = userProfile.role;
          token.full_name = userProfile.full_name;
          token.department = userProfile.department;
        }
      }

      return token;
    },
  },
} satisfies NextAuthConfig;
