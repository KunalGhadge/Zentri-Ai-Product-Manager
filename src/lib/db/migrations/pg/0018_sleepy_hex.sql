CREATE TABLE "pm_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"insight_id" uuid NOT NULL,
	"feedback_id" uuid NOT NULL,
	"exact_quote" text NOT NULL,
	"start_offset" integer,
	"end_offset" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pm_execution_asset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feature_bet_id" uuid NOT NULL,
	"type" varchar(30) DEFAULT 'prd' NOT NULL,
	"version" text DEFAULT '1.0.0' NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pm_feature_bet_insight_link" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feature_bet_id" uuid NOT NULL,
	"insight_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pm_feature_bet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"volume_score" integer DEFAULT 1 NOT NULL,
	"severity_score" integer DEFAULT 1 NOT NULL,
	"business_impact_score" integer DEFAULT 1 NOT NULL,
	"confidence_score" integer DEFAULT 1 NOT NULL,
	"priority_score_final" real DEFAULT 0 NOT NULL,
	"priority_reasoning" text NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pm_insight" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pm_raw_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"source_name" text NOT NULL,
	"source_type" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"occurred_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"import_batch_id" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pm_workspace" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
DROP TABLE "evidence" CASCADE;--> statement-breakpoint
DROP TABLE "execution_asset" CASCADE;--> statement-breakpoint
DROP TABLE "feature_bet_insight_link" CASCADE;--> statement-breakpoint
DROP TABLE "feature_bet" CASCADE;--> statement-breakpoint
DROP TABLE "insight" CASCADE;--> statement-breakpoint
DROP TABLE "raw_feedback" CASCADE;--> statement-breakpoint
ALTER TABLE "pm_evidence" ADD CONSTRAINT "pm_evidence_insight_id_pm_insight_id_fk" FOREIGN KEY ("insight_id") REFERENCES "public"."pm_insight"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pm_evidence" ADD CONSTRAINT "pm_evidence_feedback_id_pm_raw_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."pm_raw_feedback"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pm_execution_asset" ADD CONSTRAINT "pm_execution_asset_feature_bet_id_pm_feature_bet_id_fk" FOREIGN KEY ("feature_bet_id") REFERENCES "public"."pm_feature_bet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pm_feature_bet_insight_link" ADD CONSTRAINT "pm_feature_bet_insight_link_feature_bet_id_pm_feature_bet_id_fk" FOREIGN KEY ("feature_bet_id") REFERENCES "public"."pm_feature_bet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pm_feature_bet_insight_link" ADD CONSTRAINT "pm_feature_bet_insight_link_insight_id_pm_insight_id_fk" FOREIGN KEY ("insight_id") REFERENCES "public"."pm_insight"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pm_feature_bet" ADD CONSTRAINT "pm_feature_bet_workspace_id_pm_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."pm_workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pm_insight" ADD CONSTRAINT "pm_insight_workspace_id_pm_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."pm_workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pm_raw_feedback" ADD CONSTRAINT "pm_raw_feedback_workspace_id_pm_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."pm_workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pm_raw_feedback" ADD CONSTRAINT "pm_raw_feedback_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pm_workspace" ADD CONSTRAINT "pm_workspace_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;