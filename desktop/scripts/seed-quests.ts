 
import { db } from "../src/db/index";
import { quests } from "../src/db/schema/achievements";

async function seed() {
  // Clear existing quests so we can apply the updated list
  await db.delete(quests);
  
  const newQuests = [
    // Daily Quests (12)
    { title: "Absen Harian", description: "Buka aplikasi dan login ke akunmu hari ini.", rewardPoints: 50, frequency: "daily", targetCount: 1 },
    { title: "Cek Klasemen", description: "Buka halaman Peringkat untuk melihat posisi juara hari ini.", rewardPoints: 50, frequency: "daily", targetCount: 1 },
    { title: "Nabung Yuk!", description: "Lakukan 1x transaksi menabung hari ini.", rewardPoints: 200, frequency: "daily", targetCount: 1 },
    { title: "Kunjungan Toko", description: "Buka halaman toko (item shop) hari ini.", rewardPoints: 150, frequency: "daily", targetCount: 1 },
    { title: "Membantu Sesama", description: "Gunakan item prank ke 1 teman.", rewardPoints: 100, frequency: "daily", targetCount: 1 },
    { title: "Ksatria Arena", description: "Ikuti 1 battle di Arena hari ini (menang atau kalah).", rewardPoints: 150, frequency: "daily", targetCount: 1 },
    { title: "Berburu Diskon", description: "Kunjungi Item Shop 2 kali hari ini.", rewardPoints: 150, frequency: "daily", targetCount: 2 },
    { title: "Ayo Panen", description: "Klaim reward misi harian pertama kamu.", rewardPoints: 50, frequency: "daily", targetCount: 1 },
    { title: "Suara Anggota", description: "Berikan 1 vote pada proposal voting yang sedang aktif.", rewardPoints: 150, frequency: "daily", targetCount: 1 },
    { title: "Pemantau Harga", description: "Buka halaman Marketplace hari ini.", rewardPoints: 100, frequency: "daily", targetCount: 1 },
    { title: "Dompet Sehat", description: "Cek riwayat transaksimu di dompet/wallet.", rewardPoints: 50, frequency: "daily", targetCount: 1 },
    { title: "Peduli Koperasi", description: "Baca detail 1 event atau pengumuman koperasi.", rewardPoints: 50, frequency: "daily", targetCount: 1 },

    // Weekly Quests (10)
    { title: "Login Berturut", description: "Login 3 hari berturut-turut dalam minggu ini.", rewardPoints: 300, frequency: "weekly", targetCount: 3 },
    { title: "Duel Master", description: "Menangkan 1 battle di Arena Koperasi.", rewardPoints: 500, frequency: "weekly", targetCount: 1 },
    { title: "Bintang Desa", description: "Capai top 3 di Peringkat Mingguan.", rewardPoints: 2000, frequency: "weekly", targetCount: 1 },
    { title: "Raja Nabung", description: "Lakukan transaksi menabung sebanyak 3 kali minggu ini.", rewardPoints: 1500, frequency: "weekly", targetCount: 3 },
    { title: "Pecinta Belanja", description: "Beli 2 item apapun di toko (Item Shop) minggu ini.", rewardPoints: 1000, frequency: "weekly", targetCount: 2 },
    { title: "Pengepul XP", description: "Kumpulkan total 1000 XP dalam satu minggu.", rewardPoints: 500, frequency: "weekly", targetCount: 1000 },
    { title: "Gladiator Tangguh", description: "Ikuti 5 battle dalam minggu ini.", rewardPoints: 1200, frequency: "weekly", targetCount: 5 },
    { title: "Dewa Prank", description: "Gunakan item ke 3 teman berbeda minggu ini.", rewardPoints: 1000, frequency: "weekly", targetCount: 3 },
    { title: "Aktivis Koperasi", description: "Ikut serta atau hadiri 1 Event koperasi minggu ini.", rewardPoints: 800, frequency: "weekly", targetCount: 1 },
    { title: "Kolektor Poin", description: "Tukarkan koinmu di toko atau marketplace.", rewardPoints: 500, frequency: "weekly", targetCount: 1 }
  ];

  if (newQuests.length > 0) {
    await db.insert(quests).values(newQuests as any);
    console.log(`Inserted ${newQuests.length} new quests.`);
  } else {
    console.log("No new quests to insert.");
  }
}

seed().catch(console.error).finally(() => process.exit(0));
