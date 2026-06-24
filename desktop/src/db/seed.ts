import { db } from "./index";
import { users, cooperatives, members, memberProgress, pointTransactions, savings, proposals } from "./schema";
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

  console.log("Seeding complete!");
  process.exit(0);
}

main().catch(console.error);
