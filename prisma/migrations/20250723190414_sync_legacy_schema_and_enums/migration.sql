/*
  Warnings:

  - You are about to drop the `Evaluation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Idea` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IdeaComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[list_key,value_key]` on the table `list_of_values` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."EvaluationType" AS ENUM ('technology', 'finance', 'commercial');

-- CreateEnum
CREATE TYPE "public"."ManagementDecisionType" AS ENUM ('approved', 'rejected', 'needs_revision', 'conditional_approval');

-- CreateEnum
CREATE TYPE "public"."PriorityLevel" AS ENUM ('high', 'medium', 'low');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."IdeaStatus" ADD VALUE 'evaluated';
ALTER TYPE "public"."IdeaStatus" ADD VALUE 'needs_revision';
ALTER TYPE "public"."IdeaStatus" ADD VALUE 'conditional_approval';

-- DropForeignKey
ALTER TABLE "public"."Evaluation" DROP CONSTRAINT "Evaluation_evaluator_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Evaluation" DROP CONSTRAINT "Evaluation_idea_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Idea" DROP CONSTRAINT "Idea_assigned_evaluator_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Idea" DROP CONSTRAINT "Idea_submitter_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."IdeaComment" DROP CONSTRAINT "IdeaComment_idea_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."IdeaComment" DROP CONSTRAINT "IdeaComment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Profile" DROP CONSTRAINT "Profile_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."idea_attachments" DROP CONSTRAINT "idea_attachments_idea_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."idea_attachments" DROP CONSTRAINT "idea_attachments_uploaded_by_fkey";

-- DropTable
DROP TABLE "public"."Evaluation";

-- DropTable
DROP TABLE "public"."Idea";

-- DropTable
DROP TABLE "public"."IdeaComment";

-- DropTable
DROP TABLE "public"."Profile";

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'submitter',
    "department" TEXT,
    "specialization" "public"."EvaluationType"[] DEFAULT ARRAY[]::"public"."EvaluationType"[],
    "is_active" BOOLEAN DEFAULT true,
    "password_reset_required" BOOLEAN DEFAULT false,
    "preferred_language" VARCHAR(2) DEFAULT 'ar',
    "profile_picture_url" TEXT,
    "email_confirmed" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMPTZ,
    "blocked_at" TIMESTAMPTZ,
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "blocked_by_id" UUID,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ideas" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "public"."IdeaCategory" NOT NULL,
    "status" "public"."IdeaStatus" NOT NULL DEFAULT 'draft',
    "is_draft" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority_score" INTEGER NOT NULL DEFAULT 0,
    "implementation_cost" DECIMAL(10,2),
    "expected_roi" DECIMAL(10,2),
    "strategic_alignment_score" INTEGER DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMPTZ,
    "evaluated_at" TIMESTAMPTZ,
    "implemented_at" TIMESTAMPTZ,
    "idea_reference_code" VARCHAR,
    "strategic_alignment_selections" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "average_evaluation_score" DECIMAL(4,2),
    "feasibility_study_url" TEXT,
    "pricing_offer_url" TEXT,
    "prototype_images_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "current_stage" TEXT DEFAULT 'draft',
    "language" VARCHAR DEFAULT 'ar',
    "submitter_id" UUID NOT NULL,
    "assigned_evaluator_id" UUID,

    CONSTRAINT "ideas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."idea_comments" (
    "id" UUID NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idea_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "idea_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."evaluations" (
    "id" UUID NOT NULL,
    "evaluation_type" "public"."EvaluationType" NOT NULL DEFAULT 'technology',
    "feasibility_score" INTEGER,
    "impact_score" INTEGER,
    "innovation_score" INTEGER,
    "overall_score" INTEGER,
    "enrichment_score" INTEGER,
    "feedback" TEXT,
    "recommendation" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idea_id" UUID NOT NULL,
    "evaluator_id" UUID NOT NULL,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."evaluator_assignments" (
    "id" UUID NOT NULL,
    "idea_id" UUID NOT NULL,
    "evaluator_id" UUID NOT NULL,
    "evaluation_type" "public"."EvaluationType" NOT NULL,
    "assigned_by" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "evaluator_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."management_decisions" (
    "id" UUID NOT NULL,
    "idea_id" UUID NOT NULL,
    "decision_type" "public"."ManagementDecisionType" NOT NULL,
    "decision_by" UUID NOT NULL,
    "decision_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priority" "public"."PriorityLevel",
    "department_assignment" TEXT,
    "decision_reason_en" TEXT,
    "decision_reason_ar" TEXT,
    "feedback_en" TEXT,
    "feedback_ar" TEXT,
    "conditions_en" TEXT,
    "conditions_ar" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "management_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."idea_revisions" (
    "id" UUID NOT NULL,
    "idea_id" UUID NOT NULL,
    "revision_number" INTEGER NOT NULL,
    "requested_by" UUID NOT NULL,
    "requested_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revision_areas" TEXT[],
    "feedback_en" TEXT,
    "feedback_ar" TEXT,
    "submitter_response_en" TEXT,
    "submitter_response_ar" TEXT,
    "status" TEXT DEFAULT 'pending',
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idea_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_management_logs" (
    "id" UUID NOT NULL,
    "performed_by" UUID NOT NULL,
    "target_user_id" UUID NOT NULL,
    "action_type" TEXT NOT NULL,
    "action_details" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_management_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."idea_status_log" (
    "log_id" UUID NOT NULL,
    "idea_id" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "previous_status" TEXT,
    "changed_by" UUID NOT NULL,
    "user_role" "public"."UserRole" NOT NULL,
    "comments" TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idea_status_log_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "public"."idea_action_log" (
    "action_id" UUID NOT NULL,
    "idea_id" UUID NOT NULL,
    "performed_by" UUID NOT NULL,
    "user_role" "public"."UserRole" NOT NULL,
    "action_detail" TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idea_action_log_pkey" PRIMARY KEY ("action_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "public"."profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ideas_idea_reference_code_key" ON "public"."ideas"("idea_reference_code");

-- CreateIndex
CREATE UNIQUE INDEX "evaluations_idea_id_evaluator_id_evaluation_type_key" ON "public"."evaluations"("idea_id", "evaluator_id", "evaluation_type");

-- CreateIndex
CREATE UNIQUE INDEX "evaluator_assignments_idea_id_evaluation_type_key" ON "public"."evaluator_assignments"("idea_id", "evaluation_type");

-- CreateIndex
CREATE UNIQUE INDEX "evaluator_assignments_idea_id_evaluator_id_key" ON "public"."evaluator_assignments"("idea_id", "evaluator_id");

-- CreateIndex
CREATE UNIQUE INDEX "list_of_values_list_key_value_key_key" ON "public"."list_of_values"("list_key", "value_key");

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_blocked_by_id_fkey" FOREIGN KEY ("blocked_by_id") REFERENCES "public"."profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ideas" ADD CONSTRAINT "ideas_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."idea_comments" ADD CONSTRAINT "idea_comments_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."idea_comments" ADD CONSTRAINT "idea_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."idea_attachments" ADD CONSTRAINT "idea_attachments_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."idea_attachments" ADD CONSTRAINT "idea_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evaluations" ADD CONSTRAINT "evaluations_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evaluations" ADD CONSTRAINT "evaluations_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evaluator_assignments" ADD CONSTRAINT "evaluator_assignments_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evaluator_assignments" ADD CONSTRAINT "evaluator_assignments_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evaluator_assignments" ADD CONSTRAINT "evaluator_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."management_decisions" ADD CONSTRAINT "management_decisions_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."management_decisions" ADD CONSTRAINT "management_decisions_decision_by_fkey" FOREIGN KEY ("decision_by") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."idea_revisions" ADD CONSTRAINT "idea_revisions_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."idea_revisions" ADD CONSTRAINT "idea_revisions_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_management_logs" ADD CONSTRAINT "user_management_logs_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_management_logs" ADD CONSTRAINT "user_management_logs_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."idea_status_log" ADD CONSTRAINT "idea_status_log_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."idea_status_log" ADD CONSTRAINT "idea_status_log_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."idea_action_log" ADD CONSTRAINT "idea_action_log_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."idea_action_log" ADD CONSTRAINT "idea_action_log_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
