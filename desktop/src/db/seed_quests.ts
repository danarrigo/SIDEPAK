import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    }
  });
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool, { schema });

async function seedQuests() {
  console.log("Memulai injeksi data Misi (Quests)...");

  try {
    const defaultQuests = [
      {
        title: "Sering Mampir",
        description: "Login ke dashboard hari ini.",
        rewardPoints: 50,
        frequency: "daily",
        actionType: "daily_login",
        targetCount: 1,
      },
      {
        title: "Penabung Rajin",
        description: "Lakukan simpanan sukarela hari ini.",
        rewardPoints: 100,
        frequency: "daily",
        actionType: "saving",
        targetCount: 1,
      },
      {
        title: "Jiwa Sosial",
        description: "Ikuti setidaknya 1 event koperasi.",
        rewardPoints: 150,
        frequency: "weekly",
        actionType: "join_event",
        targetCount: 1,
      },
      {
        title: "Tepat Waktu",
        description: "Bayar cicilan pinjamanmu minggu ini.",
        rewardPoints: 200,
        frequency: "weekly",
        actionType: "pay_loan",
        targetCount: 1,
      },
      {
        title: "Sultan Koperasi",
        description: "Lakukan simpanan sukarela sebanyak 3 kali dalam seminggu.",
        rewardPoints: 300,
        frequency: "weekly",
        actionType: "saving",
        targetCount: 3,
      }
    ];

    for (const quest of defaultQuests) {
      await db.insert(schema.quests).values(quest);
    }

    console.log(`Berhasil menyuntikkan ${defaultQuests.length} misi ke dalam database!`);
  } catch (error) {
    console.error("Terjadi error saat injeksi quests:", error);
  } finally {
    await pool.end();
  }
}

seedQuests();
