-- AlterTable
ALTER TABLE "public"."Idea" ADD COLUMN     "strategic_alignment" TEXT[] DEFAULT ARRAY[]::TEXT[];
