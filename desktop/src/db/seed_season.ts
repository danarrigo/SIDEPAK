import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { seasons } from './schema/gamification';

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log("Seeding season...");
  await db.insert(seasons).values({
    name: "Musim Tanam Raya",
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // 1 month from now
    isActive: true,
  });

  await pool.end();
  console.log("Seed complete!");
}
run();
