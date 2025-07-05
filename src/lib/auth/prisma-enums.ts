import { UserRole as PrismaUserRole } from "@prisma/client";

// This file acts as a single source of truth for the UserRole enum,
// ensuring that your NextAuth types and your database schema are always in sync.
export type UserRole = PrismaUserRole;
export const UserRoleEnum = PrismaUserRole;
