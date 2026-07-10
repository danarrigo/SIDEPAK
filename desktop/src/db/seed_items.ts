import { db } from './index';
import { items } from './schema/gamification';

async function seedItems() {
  console.log("Seeding items...");
  try {
    await db.insert(items).values([
      {
        name: "Voucher Diskon Koperasi 10%",
        description: "Dapatkan diskon 10% (maksimal Rp 20.000) untuk pembelanjaan offline di Toko Koperasi. Tunjukkan voucher ini ke petugas kasir.",
        priceInPoints: 1000,
        effectType: "voucher",
        effectValue: "discount_10",
      },
      {
        name: "Voucher Minyak Goreng 1L",
        description: "Tukarkan voucher ini dengan 1 Liter Minyak Goreng di Toko Koperasi fisik.",
        priceInPoints: 2500,
        effectType: "voucher",
        effectValue: "item_oil_1l",
      },
      {
        name: "Voucher Bebas Admin Pinjaman",
        description: "Bebas biaya admin untuk 1 kali pengajuan pinjaman baru. Berlaku untuk semua tipe pinjaman.",
        priceInPoints: 5000,
        effectType: "voucher",
        effectValue: "free_admin_fee",
      },
      {
        name: "Tiket Nonton Bareng",
        description: "Tiket eksklusif untuk acara Nonton Bareng Koperasi. Tunjukkan tiket ini pada saat acara.",
        priceInPoints: 1500,
        effectType: "voucher",
        effectValue: "ticket_nobar",
      },
      {
        name: "Freeze Streak",
        description: "Melindungi streak aktifmu selama 1 hari jika kamu lupa login.",
        priceInPoints: 500,
        effectType: "freeze_streak",
        effectValue: "1_day",
      }
    ]);
    console.log("Items seeded successfully!");
  } catch (err) {
    console.error("Error seeding items:", err);
  }
}

seedItems().then(() => process.exit(0)).catch(() => process.exit(1));
