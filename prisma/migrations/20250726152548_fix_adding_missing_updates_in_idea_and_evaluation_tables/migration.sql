-- AlterTable
ALTER TABLE "public"."evaluations" ALTER COLUMN "feasibility_score" SET DEFAULT 1,
ALTER COLUMN "impact_score" SET DEFAULT 1,
ALTER COLUMN "innovation_score" SET DEFAULT 1,
ALTER COLUMN "overall_score" SET DEFAULT 1,
ALTER COLUMN "enrichment_score" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "public"."ideas" ADD COLUMN     "assigned_evaluator_id" UUID;

-- AddForeignKey
ALTER TABLE "public"."ideas" ADD CONSTRAINT "ideas_assigned_evaluator_id_fkey" FOREIGN KEY ("assigned_evaluator_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
