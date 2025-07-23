/*
  Warnings:

  - The values [USER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `assigned_evaluator_id` on the `ideas` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserRole_new" AS ENUM ('submitter', 'evaluator', 'management', 'ADMIN');
ALTER TABLE "public"."profiles" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."profiles" ALTER COLUMN "role" TYPE "public"."UserRole_new" USING ("role"::text::"public"."UserRole_new");
ALTER TABLE "public"."idea_status_log" ALTER COLUMN "user_role" TYPE "public"."UserRole_new" USING ("user_role"::text::"public"."UserRole_new");
ALTER TABLE "public"."idea_action_log" ALTER COLUMN "user_role" TYPE "public"."UserRole_new" USING ("user_role"::text::"public"."UserRole_new");
ALTER TYPE "public"."UserRole" RENAME TO "UserRole_old";
ALTER TYPE "public"."UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "public"."profiles" ALTER COLUMN "role" SET DEFAULT 'submitter';
COMMIT;

-- AlterTable
ALTER TABLE "public"."ideas" DROP COLUMN "assigned_evaluator_id";
