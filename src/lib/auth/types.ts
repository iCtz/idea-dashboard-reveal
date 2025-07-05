import { DefaultSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@lib/auth/prisma-enums"; // Import the shared enum type

// type UserRole = "submitter" | "evaluator" | "management";

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      full_name?: string | null;
      department?: string | null;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}
