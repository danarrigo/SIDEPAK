import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import crypto from 'crypto';

// Gunakan koneksi langsung ke DB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool, { schema });

async function seedMockMembers() {
  console.log("Memulai injeksi data fiktif...");

  try {
    // 1. Dapatkan semua koperasi
    const coops = await db.select().from(schema.cooperatives);
    if (coops.length === 0) {
      console.log("Tidak ada koperasi di database. Injeksi dihentikan.");
      return;
    }
    console.log(`Ditemukan ${coops.length} koperasi.`);

    const mockNames = [
      "Budi Santoso", "Siti Aminah", "Ahmad Fauzi", "Dewi Lestari", "Andi Wijaya",
      "Rini Wulandari", "Agus Setiawan", "Rina Marlina", "Hendra Gunawan", "Eka Saputra",
      "Dedi Haryanto", "Maya Sari", "Rizki Aditya", "Nia Ramadhani", "Wahyu Pratama",
      "Nina Zatulini", "Fajar Nugraha", "Irfan Hakim", "Ayu Ting Ting", "Raffi Ahmad"
    ];

    const provinces = ["DKI Jakarta", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Banten"];
    let memberCount = 0;

    // 2. Loop untuk tiap koperasi agar minimal ada 1 member (kita buat 2-5 member per koperasi)
    for (const coop of coops) {
      // Random jumlah member untuk koperasi ini (minimal 1, maksimal 5)
      const numMembers = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < numMembers; i++) {
        // Buat User (Auth mock)
        const newUserId = crypto.randomUUID();
        const fakeEmail = `mock_${Date.now()}_${Math.floor(Math.random() * 10000)}@kopdes.id`;
        
        await db.insert(schema.users).values({
          id: newUserId,
          email: fakeEmail,
          role: 'member',
          isActive: true
        });

        // Buat Member
        const randomNameIndex = Math.floor(Math.random() * mockNames.length);
        const name = `${mockNames[randomNameIndex]} ${Math.floor(Math.random() * 100)}`;
        const nik = `317${Math.floor(Math.random() * 10000000000000).toString().padStart(13, '0')}`;
        const phone = `08${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;
        const province = provinces[Math.floor(Math.random() * provinces.length)];

        const [newMember] = await db.insert(schema.members).values({
          userId: newUserId,
          nomorAnggota: `MEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          statusAnggota: 'active',
          nik: nik,
          namaLengkap: name,
          nomorHp: phone,
          provinsi: province,
          cooperativeId: coop.id,
        }).returning();

        // Buat Member Progress (Gamifikasi & Rank Formula)
        // XP: Acak antara 0 hingga 60,000
        const randomXp = Math.floor(Math.random() * 60000);
        // Formula Level: Math.floor(XP / 1000) + 1
        const computedLevel = Math.floor(randomXp / 1000) + 1;
        
        // Wallet Balance: 0 hingga 25 juta
        const randomWalletBalance = Math.floor(Math.random() * 25000000);
        
        // Credit Score: 400 - 850
        const randomCreditScore = Math.floor(Math.random() * 450) + 400;

        await db.insert(schema.memberProgress).values({
          memberId: newMember.id,
          level: computedLevel,
          xp: randomXp,
          pointsBalance: Math.floor(randomXp * 0.8), // poin yang bisa dibelanjakan biasanya lebih sedikit dari XP
          walletBalance: randomWalletBalance,
          creditScore: randomCreditScore,
          currentStreak: Math.floor(Math.random() * 15),
          longestStreak: Math.floor(Math.random() * 30),
        });

        memberCount++;
      }
    }

    console.log(`Berhasil menyuntikkan ${memberCount} mock members tersebar di seluruh koperasi!`);
    console.log(`Silakan cek halaman Arena/Guild Wars untuk melihat efek variasi member ini.`);
    
  } catch (error) {
    console.error("Terjadi error saat injeksi data:", error);
  } finally {
    await pool.end();
  }
}

seedMockMembers();
