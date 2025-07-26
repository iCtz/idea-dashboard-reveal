/*
  Warnings:

  - You are about to drop the column `verification_sent_at` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `verification_token` on the `profiles` table. All the data in the column will be lost.
  - Added the required column `action_type` to the `idea_action_log` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "public"."UserRole" ADD VALUE 'ADMIN';

-- DropForeignKey
ALTER TABLE "public"."idea_action_log" DROP CONSTRAINT "idea_action_log_performed_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."idea_attachments" DROP CONSTRAINT "idea_attachments_idea_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."idea_status_log" DROP CONSTRAINT "idea_status_log_changed_by_fkey";

-- AlterTable
ALTER TABLE "public"."idea_action_log" ADD COLUMN     "action_type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."profiles" DROP COLUMN "verification_sent_at",
DROP COLUMN "verification_token",
ADD COLUMN     "blocked_by_id" UUID,
ADD COLUMN     "created_by_id" UUID,
ADD COLUMN     "updated_by_id" UUID,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "email_confirmed" SET DEFAULT false,
ALTER COLUMN "is_verified" SET DEFAULT true;

-- AddForeignKey
ALTER TABLE "public"."idea_attachments" ADD CONSTRAINT "idea_attachments_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."idea_status_log" ADD CONSTRAINT "idea_status_log_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."idea_action_log" ADD CONSTRAINT "idea_action_log_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
