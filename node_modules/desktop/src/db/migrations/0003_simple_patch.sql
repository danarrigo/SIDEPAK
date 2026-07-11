CREATE TABLE "koperasi_season_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"koperasi_id" integer NOT NULL,
	"season_id" integer NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "koperasi_season_scores" ADD CONSTRAINT "koperasi_season_scores_koperasi_id_cooperatives_id_fk" FOREIGN KEY ("koperasi_id") REFERENCES "public"."cooperatives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "koperasi_season_scores" ADD CONSTRAINT "koperasi_season_scores_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;