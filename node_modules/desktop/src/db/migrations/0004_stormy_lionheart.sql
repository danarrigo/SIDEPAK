CREATE TABLE "cooperative_matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"season_id" integer NOT NULL,
	"cooperative_a_id" integer NOT NULL,
	"cooperative_b_id" integer NOT NULL,
	"score_a" integer DEFAULT 0 NOT NULL,
	"score_b" integer DEFAULT 0 NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" varchar(50) DEFAULT 'ongoing' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "koperasi_season_scores" ADD COLUMN "total_wins" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "koperasi_season_scores" ADD COLUMN "total_losses" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "koperasi_season_scores" ADD COLUMN "total_draws" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "battles" ADD COLUMN "match_id" integer;--> statement-breakpoint
ALTER TABLE "cooperative_matches" ADD CONSTRAINT "cooperative_matches_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cooperative_matches" ADD CONSTRAINT "cooperative_matches_cooperative_a_id_cooperatives_id_fk" FOREIGN KEY ("cooperative_a_id") REFERENCES "public"."cooperatives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cooperative_matches" ADD CONSTRAINT "cooperative_matches_cooperative_b_id_cooperatives_id_fk" FOREIGN KEY ("cooperative_b_id") REFERENCES "public"."cooperatives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battles" ADD CONSTRAINT "battles_match_id_cooperative_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."cooperative_matches"("id") ON DELETE cascade ON UPDATE no action;