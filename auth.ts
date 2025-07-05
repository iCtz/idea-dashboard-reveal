import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db"; // IMPORTANT: Make sure your Prisma client is exported from here
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/", // Redirect users to the homepage for login
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
          const user = await db.profile.findUnique({
            where: {
              email: credentials.email as string,
            },
          });

          // 3. Check if user was found and has a password
          // IMPORTANT: Ensure your user model has a `hashedPassword` field
          if (!user || !user.password) {
            console.warn("AUTHORIZE: User not found or has no password:", credentials.email);
            return null;
          }

          // 4. Compare the provided password with the stored hash
          const passwordsMatch = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

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
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await db.profile.findUnique({
        where: { id: token.sub },
      });

      if (!existingUser) return token;

      // Add profile data to the token
      token.role = existingUser.role;
      token.full_name = existingUser.full_name;
      token.department = existingUser.department;

      return token;
    },
  },
});
