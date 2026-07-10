import { Pool } from 'pg';

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  console.log("Creating tables manually...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "seasons" (
      "id" serial PRIMARY KEY,
      "name" varchar(255) NOT NULL,
      "start_date" timestamp NOT NULL,
      "end_date" timestamp NOT NULL,
      "is_active" boolean DEFAULT false NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "koperasi_season_scores" (
      "id" serial PRIMARY KEY,
      "koperasi_id" integer NOT NULL REFERENCES cooperatives("id") ON DELETE CASCADE,
      "season_id" integer NOT NULL REFERENCES seasons("id") ON DELETE CASCADE,
      "total_xp" integer DEFAULT 0 NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  console.log("Tables created!");
  await pool.end();
}
run();
