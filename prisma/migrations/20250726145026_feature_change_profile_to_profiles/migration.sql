/*
  Warnings:

  - The values [ADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserRole_new" AS ENUM ('submitter', 'evaluator', 'management');
ALTER TABLE "public"."profiles" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."profiles" ALTER COLUMN "role" TYPE "public"."UserRole_new" USING ("role"::text::"public"."UserRole_new");
ALTER TABLE "public"."idea_status_log" ALTER COLUMN "user_role" TYPE "public"."UserRole_new" USING ("user_role"::text::"public"."UserRole_new");
ALTER TABLE "public"."idea_action_log" ALTER COLUMN "user_role" TYPE "public"."UserRole_new" USING ("user_role"::text::"public"."UserRole_new");
ALTER TYPE "public"."UserRole" RENAME TO "UserRole_old";
ALTER TYPE "public"."UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "public"."profiles" ALTER COLUMN "role" SET DEFAULT 'submitter';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_blocked_by_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_updated_by_id_fkey";

-- AlterTable
ALTER TABLE "public"."profiles" ADD COLUMN     "is_verified" BOOLEAN DEFAULT false,
ADD COLUMN     "verification_sent_at" TIMESTAMPTZ,
ADD COLUMN     "verification_token" TEXT;

-- CreateIndex
CREATE INDEX "idx_ideas_submitter" ON "public"."ideas"("submitter_id");

-- CreateIndex
CREATE INDEX "idx_profiles_email" ON "public"."profiles"("email");

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_blocked_by_id_fkey" FOREIGN KEY ("blocked_by_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
