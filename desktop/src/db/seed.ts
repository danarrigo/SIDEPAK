import { db } from "./index";
import { users, cooperatives, members, memberProgress, pointTransactions, savings, proposals } from "./schema";
import { items } from "./schema/gamification";
import { quests } from "./schema/achievements";
import crypto from "crypto";

async function main() {
  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    console.log("DB already seeded.");
    return;
  }
  
  console.log("Seeding Database...");
  
  const userId = crypto.randomUUID();
  await db.insert(users).values({
    id: userId,
    email: "bagus@kopdes.id",
    role: "member"
  });
  
  const [coop] = await db.insert(cooperatives).values({
    name: "Koperasi Sukamaju",
    provinsi: "Jawa Barat",
    kabupaten: "Bandung",
    kecamatan: "Lembang",
    desa: "Sukamaju"
  }).returning();
  
  const [member] = await db.insert(members).values({
    userId,
    nomorAnggota: "8829 2024 1992 0012",
    statusAnggota: "active",
    nik: "3201234567890001",
    namaLengkap: "Bagus Pratama",
    koperasi: coop.name
  }).returning();
  
  await db.insert(memberProgress).values({
    memberId: member.id,
    level: 12,
    xp: 2450,
    pointsBalance: 1250,
    currentStreak: 14,
    longestStreak: 21
  });
  
  await db.insert(pointTransactions).values([
    { memberId: member.id, amount: 50, source: 'quest', description: 'Menyelesaikan Misi Harian' },
    { memberId: member.id, amount: 200, source: 'saving', description: 'Setoran Sukarela' },
    { memberId: member.id, amount: -100, source: 'purchase', description: 'Membeli Voucher Token Listrik' }
  ]);
  
  await db.insert(savings).values([
    { memberId: member.id, amount: 500000, type: 'deposit', description: 'Setoran Awal' },
    { memberId: member.id, amount: 100000, type: 'deposit', description: 'Setoran Wajib' },
    { memberId: member.id, amount: 250000, type: 'deposit', description: 'Setoran Sukarela' }
  ]);
  
  await db.insert(proposals).values([
    { title: "Integrasi Solar Panel RT 01-05", description: "Pengajuan Kredit Kolektif Pengadaan Solar Panel Desa.", status: "active", targetQuorumPercentage: 65, startDate: new Date(), endDate: new Date(Date.now() + 86400000) }
  ]);

  // Seed Items
  await db.insert(items).values([
    { name: "Sakit Jantung", description: "Beri efek jantungan (jumpscare) pada teman koperasimu!", priceInPoints: 50, effectType: "prank", effectValue: "sakit_jantung" },
    { name: "Freeze Streak", description: "Pertahankan streakmu meskipun kamu lupa login sehari.", priceInPoints: 100, effectType: "freeze_streak", effectValue: "1" },
    { name: "Poin Bomb", description: "Raih 2x XP dari semua aktivitas besok.", priceInPoints: 300, effectType: "point_bomb", effectValue: "2x" }
  ]);

  // Seed Quests
  await db.insert(quests).values([
    { title: "Nabung Yuk!", description: "Lakukan 1x transaksi menabung hari ini.", rewardPoints: 200, frequency: "daily", targetCount: 1 },
    { title: "Bayar Iuran", description: "Selesaikan iuran wajib bulan ini.", rewardPoints: 500, frequency: "monthly", targetCount: 1 },
    { title: "Duel Master", description: "Menangkan 3 battle di Arena Koperasi.", rewardPoints: 1000, frequency: "weekly", targetCount: 3 }
  ]);

  // Add dummy members for leaderboard
  const dummyIds = [crypto.randomUUID(), crypto.randomUUID()];
  await db.insert(users).values([
    { id: dummyIds[0], email: "dummy1@kopdes.id", role: "member" },
    { id: dummyIds[1], email: "dummy2@kopdes.id", role: "member" }
  ]);

  const insertedDummies = await db.insert(members).values([
    { userId: dummyIds[0], nomorAnggota: "8829 2024 1992 0013", statusAnggota: "active", nik: "3201234567890002", namaLengkap: "Siti Rahmawati", koperasi: coop.name },
    { userId: dummyIds[1], nomorAnggota: "8829 2024 1992 0014", statusAnggota: "active", nik: "3201234567890003", namaLengkap: "Budi Santoso", koperasi: coop.name }
  ]).returning();

  await db.insert(memberProgress).values([
    { memberId: insertedDummies[0].id, level: 10, xp: 1900, pointsBalance: 800, currentStreak: 5, longestStreak: 10 },
    { memberId: insertedDummies[1].id, level: 15, xp: 3200, pointsBalance: 2100, currentStreak: 30, longestStreak: 30 }
  ]);

  console.log("Seeding complete!");
  process.exit(0);
}

main().catch(console.error);
