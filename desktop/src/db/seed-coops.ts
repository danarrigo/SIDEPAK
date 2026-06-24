import { db } from "./index";
import { cooperatives } from "./schema";

async function main() {
  console.log("Seeding Mock Cooperatives...");

  await db.insert(cooperatives).values([
    {
      name: "Koperasi Sukamaju",
      provinsi: "Jawa Barat",
      kabupaten: "Bandung",
      kecamatan: "Lembang",
      desa: "Sukamaju"
    },
    {
      name: "Koperasi Tani Makmur",
      provinsi: "Jawa Barat",
      kabupaten: "Bandung",
      kecamatan: "Lembang",
      desa: "Cibogo"
    },
    {
      name: "Koperasi Sejahtera",
      provinsi: "Jawa Barat",
      kabupaten: "Bandung",
      kecamatan: "Lembang",
      desa: "Wangunsari"
    },
    {
      name: "Koperasi Maju Bersama",
      provinsi: "Jawa Tengah",
      kabupaten: "Semarang",
      kecamatan: "Banyumanik",
      desa: "Srondol Kulon"
    }
  ]);

  console.log("Seeding complete!");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
