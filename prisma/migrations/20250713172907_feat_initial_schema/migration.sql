-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('submitter', 'evaluator', 'management', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "public"."IdeaStatus" AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'implemented');

-- CreateEnum
CREATE TYPE "public"."IdeaCategory" AS ENUM ('innovation', 'process_improvement', 'cost_reduction', 'customer_experience', 'technology', 'sustainability');

-- CreateEnum
CREATE TYPE "public"."AttachmentFileType" AS ENUM ('feasibility', 'pricing_offer', 'prototype');

-- CreateEnum
CREATE TYPE "auth"."CodeChallengeMethod" AS ENUM ('s256', 'plain');

-- CreateEnum
CREATE TYPE "auth"."FactorType" AS ENUM ('totp', 'phone_sms', 'webauthn');

-- CreateEnum
CREATE TYPE "auth"."FactorStatus" AS ENUM ('unverified', 'verified');

-- CreateEnum
CREATE TYPE "auth"."TokenType" AS ENUM ('email_verification', 'password_reset', 'confirmation_token');

-- CreateEnum
CREATE TYPE "auth"."AuthenticationLevel" AS ENUM ('aal1', 'aal2', 'aal3');

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'submitter',
    "department" TEXT,
    "email_confirmed" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."translations" (
    "id" UUID NOT NULL,
    "interface_name" TEXT NOT NULL,
    "position_key" TEXT NOT NULL,
    "english_text" TEXT NOT NULL,
    "arabic_text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Idea" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "public"."IdeaCategory" NOT NULL,
    "status" "public"."IdeaStatus" NOT NULL DEFAULT 'draft',
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
    "average_evaluation_score" DECIMAL,
    "feasibility_study_url" TEXT,
    "pricing_offer_url" TEXT,
    "prototype_images_urls" TEXT[],
    "current_stage" TEXT DEFAULT 'draft',
    "language" VARCHAR DEFAULT 'ar',
    "submitter_id" UUID NOT NULL,
    "assigned_evaluator_id" UUID,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IdeaComment" (
    "id" UUID NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idea_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "IdeaComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."idea_attachments" (
    "id" UUID NOT NULL,
    "idea_id" UUID NOT NULL,
    "file_type" "public"."AttachmentFileType" NOT NULL,
    "file_name" TEXT,
    "file_url" TEXT,
    "uploaded_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idea_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."list_of_values" (
    "id" SERIAL NOT NULL,
    "list_key" TEXT NOT NULL,
    "value_key" TEXT NOT NULL,
    "value_en" TEXT NOT NULL,
    "value_ar" TEXT NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "list_of_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Evaluation" (
    "id" UUID NOT NULL,
    "feasibility_score" INTEGER,
    "impact_score" INTEGER,
    "innovation_score" INTEGER,
    "overall_score" INTEGER,
    "feedback" TEXT,
    "recommendation" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idea_id" UUID NOT NULL,
    "evaluator_id" UUID NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."audit_log_entries" (
    "instance_id" UUID,
    "id" UUID NOT NULL,
    "payload" JSONB,
    "created_at" TIMESTAMPTZ,
    "ip_address" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "audit_log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."flow_state" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "auth_code" TEXT NOT NULL,
    "code_challenge_method" "auth"."CodeChallengeMethod" NOT NULL,
    "code_challenge" TEXT NOT NULL,
    "provider_type" TEXT NOT NULL,
    "provider_access_token" TEXT,
    "provider_refresh_token" TEXT,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    "authentication_method" TEXT NOT NULL,
    "auth_code_issued_at" TIMESTAMPTZ,

    CONSTRAINT "flow_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."identities" (
    "user_id" UUID NOT NULL,
    "identity_data" JSONB NOT NULL,
    "provider" TEXT NOT NULL,
    "last_sign_in_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    "provider_id" TEXT NOT NULL,
    "email" TEXT,
    "id" UUID NOT NULL,

    CONSTRAINT "identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."instances" (
    "id" UUID NOT NULL,
    "uuid" UUID,
    "raw_base_config" TEXT,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."mfa_amr_claims" (
    "session_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "authentication_method" TEXT NOT NULL,
    "id" UUID NOT NULL,

    CONSTRAINT "mfa_amr_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."mfa_challenges" (
    "id" UUID NOT NULL,
    "factor_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "verified_at" TIMESTAMPTZ,
    "ip_address" INET NOT NULL,
    "otp_code" TEXT,
    "web_authn_session_data" JSONB,

    CONSTRAINT "mfa_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."mfa_factors" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "friendly_name" TEXT,
    "factor_type" "auth"."FactorType" NOT NULL,
    "status" "auth"."FactorStatus" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "secret" TEXT,
    "phone" TEXT,
    "last_challenged_at" TIMESTAMPTZ,
    "web_authn_credential" JSONB,
    "web_authn_aaguid" UUID,

    CONSTRAINT "mfa_factors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."one_time_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_type" "auth"."TokenType" NOT NULL,
    "token_hash" TEXT NOT NULL,
    "relates_to" TEXT NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "one_time_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."refresh_tokens" (
    "instance_id" UUID,
    "token" VARCHAR,
    "user_id" VARCHAR,
    "revoked" BOOLEAN,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    "id" BIGSERIAL NOT NULL,
    "parent" VARCHAR,
    "session_id" UUID,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."saml_providers" (
    "id" UUID NOT NULL,
    "sso_provider_id" UUID NOT NULL,
    "entity_id" TEXT NOT NULL,
    "metadata_xml" TEXT NOT NULL,
    "metadata_url" TEXT,
    "attribute_mapping" JSONB,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    "name_id_format" TEXT,

    CONSTRAINT "saml_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."saml_relay_states" (
    "id" UUID NOT NULL,
    "sso_provider_id" UUID NOT NULL,
    "request_id" TEXT NOT NULL,
    "for_email" TEXT,
    "redirect_to" TEXT,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    "flow_state_id" UUID,

    CONSTRAINT "saml_relay_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."schema_migrations" (
    "version" VARCHAR NOT NULL,

    CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version")
);

-- CreateTable
CREATE TABLE "auth"."sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    "factor_id" UUID,
    "aal" "auth"."AuthenticationLevel",
    "not_after" TIMESTAMPTZ,
    "refreshed_at" TIMESTAMP(0),
    "user_agent" TEXT,
    "ip" INET,
    "tag" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."sso_domains" (
    "id" UUID NOT NULL,
    "sso_provider_id" UUID NOT NULL,
    "domain" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "sso_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."sso_providers" (
    "id" UUID NOT NULL,
    "resource_id" TEXT,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "sso_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."users" (
    "instance_id" UUID,
    "id" UUID NOT NULL,
    "aud" VARCHAR,
    "role" VARCHAR,
    "email" VARCHAR,
    "encrypted_password" VARCHAR,
    "invited_at" TIMESTAMPTZ,
    "confirmation_token" VARCHAR,
    "confirmation_sent_at" TIMESTAMPTZ,
    "recovery_token" VARCHAR,
    "recovery_sent_at" TIMESTAMPTZ,
    "email_change" VARCHAR,
    "email_change_sent_at" TIMESTAMPTZ,
    "last_sign_in_at" TIMESTAMPTZ,
    "raw_app_meta_data" JSONB,
    "raw_user_meta_data" JSONB,
    "is_super_admin" BOOLEAN,
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    "email_change_token_new" VARCHAR,
    "phone_confirmed_at" TIMESTAMPTZ,
    "phone_change_sent_at" TIMESTAMPTZ,
    "email_confirmed_at" TIMESTAMPTZ,
    "confirmed_at" TIMESTAMPTZ,
    "phone_change_token" VARCHAR NOT NULL DEFAULT '',
    "phone" VARCHAR,
    "phone_change" VARCHAR NOT NULL DEFAULT '',
    "email_change_token_current" VARCHAR NOT NULL DEFAULT '',
    "email_change_confirm_status" INTEGER DEFAULT 0,
    "banned_until" TIMESTAMPTZ,
    "reauthentication_token" VARCHAR NOT NULL DEFAULT '',
    "reauthentication_sent_at" TIMESTAMPTZ,
    "is_sso_user" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "public"."Profile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "translations_interface_name_position_key_key" ON "public"."translations"("interface_name", "position_key");

-- CreateIndex
CREATE UNIQUE INDEX "Idea_idea_reference_code_key" ON "public"."Idea"("idea_reference_code");

-- CreateIndex
CREATE UNIQUE INDEX "mfa_factors_last_challenged_at_key" ON "auth"."mfa_factors"("last_challenged_at");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "auth"."refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "saml_providers_entity_id_key" ON "auth"."saml_providers"("entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "auth"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "auth"."users"("phone");

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Idea" ADD CONSTRAINT "Idea_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "public"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Idea" ADD CONSTRAINT "Idea_assigned_evaluator_id_fkey" FOREIGN KEY ("assigned_evaluator_id") REFERENCES "public"."Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IdeaComment" ADD CONSTRAINT "IdeaComment_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "public"."Idea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IdeaComment" ADD CONSTRAINT "IdeaComment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."idea_attachments" ADD CONSTRAINT "idea_attachments_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "public"."Idea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."idea_attachments" ADD CONSTRAINT "idea_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evaluation" ADD CONSTRAINT "Evaluation_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "public"."Idea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Evaluation" ADD CONSTRAINT "Evaluation_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "public"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."identities" ADD CONSTRAINT "identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."mfa_amr_claims" ADD CONSTRAINT "mfa_amr_claims_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."mfa_challenges" ADD CONSTRAINT "mfa_challenges_factor_id_fkey" FOREIGN KEY ("factor_id") REFERENCES "auth"."mfa_factors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."mfa_factors" ADD CONSTRAINT "mfa_factors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."one_time_tokens" ADD CONSTRAINT "one_time_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."saml_providers" ADD CONSTRAINT "saml_providers_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."saml_relay_states" ADD CONSTRAINT "saml_relay_states_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."saml_relay_states" ADD CONSTRAINT "saml_relay_states_flow_state_id_fkey" FOREIGN KEY ("flow_state_id") REFERENCES "auth"."flow_state"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."sso_domains" ADD CONSTRAINT "sso_domains_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
