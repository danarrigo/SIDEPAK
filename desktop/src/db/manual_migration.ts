import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log("Applying manual migration...");
    
    // Add columns to koperasi_season_scores
    await client.query(`
      ALTER TABLE "koperasi_season_scores" ADD COLUMN IF NOT EXISTS "total_wins" integer DEFAULT 0 NOT NULL;
      ALTER TABLE "koperasi_season_scores" ADD COLUMN IF NOT EXISTS "total_losses" integer DEFAULT 0 NOT NULL;
      ALTER TABLE "koperasi_season_scores" ADD COLUMN IF NOT EXISTS "total_draws" integer DEFAULT 0 NOT NULL;
    `);
    
    // Create cooperative_matches table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "cooperative_matches" (
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
    `);
    
    // Add constraints (ignore if exists, but PostgreSQL doesn't have IF NOT EXISTS for constraints easily in raw SQL without a DO block, so we use DO block)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cooperative_matches_season_id_seasons_id_fk') THEN
          ALTER TABLE "cooperative_matches" ADD CONSTRAINT "cooperative_matches_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cooperative_matches_cooperative_a_id_cooperatives_id_fk') THEN
          ALTER TABLE "cooperative_matches" ADD CONSTRAINT "cooperative_matches_cooperative_a_id_cooperatives_id_fk" FOREIGN KEY ("cooperative_a_id") REFERENCES "cooperatives"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cooperative_matches_cooperative_b_id_cooperatives_id_fk') THEN
          ALTER TABLE "cooperative_matches" ADD CONSTRAINT "cooperative_matches_cooperative_b_id_cooperatives_id_fk" FOREIGN KEY ("cooperative_b_id") REFERENCES "cooperatives"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
      END $$;
    `);
    
    // Add match_id to battles
    await client.query(`
      ALTER TABLE "battles" ADD COLUMN IF NOT EXISTS "match_id" integer;
    `);
    
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'battles_match_id_cooperative_matches_id_fk') THEN
          ALTER TABLE "battles" ADD CONSTRAINT "battles_match_id_cooperative_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "cooperative_matches"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
      END $$;
    `);
    
    await client.query('COMMIT');
    console.log("Migration successful!");
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
