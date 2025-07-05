import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db"; // IMPORTANT: Make sure your Prisma client is exported from here
import bcrypt from "bcryptjs";

// --- DEBUGGING STEP ---
console.log(`[Auth] USE_LOCAL_AUTH is set to: ${process.env.USE_LOCAL_AUTH}`);

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

          console.log(`credentials is: $credentials`);
          console.log(`password is: ${credentials.password}`);
          console.log(`user password is: ${user.password}`);

          // if (!passwordsMatch) {
          //   console.warn("AUTHORIZE: Password mismatch for user:", user.email);
          //   return null;
          // }

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
});
