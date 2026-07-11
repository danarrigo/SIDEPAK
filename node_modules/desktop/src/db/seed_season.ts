import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { seasons } from './schema/gamification';
import { cooperatives } from './schema/cooperatives';
import { cooperativeMatches } from './schema/activities';
import { eq } from 'drizzle-orm';

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log("Seeding season...");
  
  // 1. Fetch all cooperatives
  const allCoops = await db.select().from(cooperatives);
  let coopIds = allCoops.map(c => c.id);
  
  if (coopIds.length < 2) {
    console.log("Not enough cooperatives to generate matches.");
    await pool.end();
    return;
  }

  // If odd, add a dummy 'null' for a bye week
  if (coopIds.length % 2 !== 0) {
    coopIds.push(null as any);
  }

  const numRounds = coopIds.length - 1;
  const numMatchesPerRound = coopIds.length / 2;

  const seasonStart = new Date();
  // Season ends after all rounds are played (each round is 1 week)
  const seasonEnd = new Date(seasonStart);
  seasonEnd.setDate(seasonStart.getDate() + (numRounds * 7));

  // 2. Insert Season
  const [newSeason] = await db.insert(seasons).values({
    name: `Musim ${seasonStart.getFullYear()} - ${seasonStart.getMonth() + 1}`,
    startDate: seasonStart,
    endDate: seasonEnd,
    isActive: true,
  }).returning();

  console.log(`Created Season: ${newSeason.id} with ${numRounds} rounds.`);

  // 3. Generate Round-Robin Schedule
  const matchesToInsert = [];

  for (let round = 0; round < numRounds; round++) {
    const roundStart = new Date(seasonStart);
    roundStart.setDate(seasonStart.getDate() + (round * 7));
    
    const roundEnd = new Date(roundStart);
    roundEnd.setDate(roundStart.getDate() + 7);

    for (let i = 0; i < numMatchesPerRound; i++) {
      const coopA = coopIds[i];
      const coopB = coopIds[coopIds.length - 1 - i];

      // If neither is the dummy 'null', schedule a match
      if (coopA !== null && coopB !== null) {
        matchesToInsert.push({
          seasonId: newSeason.id,
          cooperativeAId: coopA,
          cooperativeBId: coopB,
          startDate: roundStart,
          endDate: roundEnd,
          status: round === 0 ? 'ongoing' : 'scheduled' // First round is ongoing, rest are scheduled
        });
      }
    }

    // Rotate array: keep index 0 fixed, rotate the rest right
    const first = coopIds[0];
    const rest = coopIds.slice(1);
    const last = rest.pop() as number;
    rest.unshift(last);
    coopIds = [first, ...rest];
  }

  // 4. Insert Matches
  if (matchesToInsert.length > 0) {
    await db.insert(cooperativeMatches).values(matchesToInsert);
    console.log(`Inserted ${matchesToInsert.length} matches for the season.`);
  }

  await pool.end();
  console.log("Seed complete!");
}
run();
