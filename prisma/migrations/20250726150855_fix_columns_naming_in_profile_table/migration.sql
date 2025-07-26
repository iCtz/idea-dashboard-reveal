/*
  Warnings:

  - You are about to drop the column `blocked_by_id` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_id` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by_id` on the `profiles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_blocked_by_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_updated_by_id_fkey";

-- AlterTable
ALTER TABLE "public"."profiles" DROP COLUMN "blocked_by_id",
DROP COLUMN "created_by_id",
DROP COLUMN "updated_by_id",
ADD COLUMN     "blocked_by" UUID,
ADD COLUMN     "created_by" UUID,
ADD COLUMN     "updated_by" UUID;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_blocked_by_fkey" FOREIGN KEY ("blocked_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
