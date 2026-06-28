/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "../src/db/index";
import { quests } from "../src/db/schema/achievements";

async function seed() {
  const allQuests = await db.select().from(quests);
  const existingTitles = allQuests.map(q => q.title);
  
  const newQuests = [
    { title: "Nabung Yuk!", description: "Lakukan 1x transaksi menabung hari ini.", rewardPoints: 200, frequency: "daily", targetCount: 1 },
    { title: "Login Berturut", description: "Login 3 hari berturut-turut.", rewardPoints: 300, frequency: "weekly", targetCount: 3 },
    { title: "Voting Pintar", description: "Berikan 1 suara pada proposal yang sedang berjalan.", rewardPoints: 150, frequency: "daily", targetCount: 1 },
    { title: "Pejuang Acara", description: "Hadir di 1 event koperasi bulan ini.", rewardPoints: 800, frequency: "monthly", targetCount: 1 },
    { title: "Bayar Iuran", description: "Selesaikan iuran wajib bulan ini.", rewardPoints: 500, frequency: "monthly", targetCount: 1 },
    { title: "Duel Master", description: "Menangkan 3 battle di Arena Koperasi.", rewardPoints: 1000, frequency: "weekly", targetCount: 3 },
    { title: "Membantu Sesama", description: "Gunakan item prank ke 1 teman.", rewardPoints: 100, frequency: "daily", targetCount: 1 },
    { title: "Bintang Desa", description: "Capai top 3 di Peringkat Mingguan.", rewardPoints: 2000, frequency: "weekly", targetCount: 1 }
  ].filter(q => !existingTitles.includes(q.title));

  if (newQuests.length > 0) {
    await db.insert(quests).values(newQuests as any);
    console.log(`Inserted ${newQuests.length} new quests.`);
  } else {
    console.log("No new quests to insert.");
  }
}

seed().catch(console.error).finally(() => process.exit(0));
