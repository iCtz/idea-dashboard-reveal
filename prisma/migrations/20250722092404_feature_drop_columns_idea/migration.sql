/*
  Warnings:

  - You are about to drop the column `feasibility_study_url` on the `Idea` table. All the data in the column will be lost.
  - You are about to drop the column `pricing_offer_url` on the `Idea` table. All the data in the column will be lost.
  - You are about to drop the column `prototype_images_urls` on the `Idea` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Idea" DROP COLUMN "feasibility_study_url",
DROP COLUMN "pricing_offer_url",
DROP COLUMN "prototype_images_urls";
