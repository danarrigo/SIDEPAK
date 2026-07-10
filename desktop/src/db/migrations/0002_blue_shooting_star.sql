ALTER TABLE "proposals" ALTER COLUMN "status" SET DEFAULT 'pending_approval';--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "status" varchar(50) DEFAULT 'pending_approval' NOT NULL;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "creator_id" integer;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_creator_id_members_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;