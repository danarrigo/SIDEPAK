import { db } from "./index";
import { items } from "./schema/gamification";
import { quests } from "./schema/achievements";

async function main() {
  try {
    await db.insert(items).values([
      { name: "Sakit Jantung", description: "Beri efek jantungan (jumpscare) pada teman koperasimu!", priceInPoints: 50, effectType: "prank", effectValue: "sakit_jantung" },
      { name: "Freeze Streak", description: "Pertahankan streakmu meskipun kamu lupa login sehari.", priceInPoints: 100, effectType: "freeze_streak", effectValue: "1" },
      { name: "Poin Bomb", description: "Raih 2x XP dari semua aktivitas besok.", priceInPoints: 300, effectType: "point_bomb", effectValue: "2x" }
    ]);

    await db.insert(quests).values([
      { title: "Nabung Yuk!", description: "Lakukan 1x transaksi menabung hari ini.", rewardPoints: 200, frequency: "daily", targetCount: 1 },
      { title: "Bayar Iuran", description: "Selesaikan iuran wajib bulan ini.", rewardPoints: 500, frequency: "monthly", targetCount: 1 },
      { title: "Duel Master", description: "Menangkan 3 battle di Arena Koperasi.", rewardPoints: 1000, frequency: "weekly", targetCount: 3 }
    ]);
    console.log("Seeded extra gamification data");
  } catch(e) {
    console.error("Probably already seeded or error", e);
  }
  process.exit(0);
}
main();
