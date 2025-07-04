// Central export for all auth utilities
export * from "./config";
export * from "./schemas";
export * from "./types";

// Helper functions
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

export const getCurrentUser = async () => {
  const session = await auth();
  return session?.user;
};

export const checkUserRole = async (requiredRole: UserRole) => {
  const user = await getCurrentUser();
  return user?.role === requiredRole;
};

export const isAdmin = async () => {
  return await checkUserRole("ADMIN");
};
