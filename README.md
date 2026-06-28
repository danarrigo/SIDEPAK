# KopDes (Koperasi Digital) 🚀

KopDes adalah platform modernisasi Koperasi di Indonesia yang mengintegrasikan layanan keuangan tradisional dengan elemen **Gamifikasi**, **Marketplace**, dan **Keterlibatan Komunitas**. Proyek ini dikembangkan untuk hackathon, bertujuan untuk meningkatkan partisipasi aktif generasi muda dalam berkoperasi melalui pengalaman pengguna yang interaktif dan menyenangkan.

## 🌟 Fitur Utama

- **Layanan Keuangan Digital**: Simpanan (Pokok, Wajib, Sukarela) dan Pinjaman yang terkelola dengan transparan.
- **Sistem Gamifikasi (KopDes Arena)**: 
  - Selesaikan Misi Harian (Quests) untuk mendapatkan poin.
  - Pertahankan *Login Streak* untuk bonus tambahan.
  - Bertanding di **Weekly Arena Battles** melawan anggota koperasi lain.
- **Marketplace & Power-Ups**: Gunakan poin Anda untuk berbelanja di ekosistem koperasi atau membeli *item* bantuan (*power-ups*) untuk memenangkan pertandingan.
- **Manajemen Koperasi (Governance)**: Lacak statistik koperasi, partisipasi acara, dan keaktifan UMKM.
- **Multi-Platform**: Terdiri dari Dashboard Web (Desktop/Admin) dan Aplikasi Mobile (Flutter).

## 🏗️ Struktur Proyek

Proyek ini menggunakan pendekatan *monorepo* yang memisahkan aplikasi menjadi dua bagian utama:

- [**`/desktop`**](./desktop/README.md): Aplikasi Web Dashboard dan Backend API yang dibangun menggunakan **Next.js 15 (App Router)**, **Supabase** (Auth & PostgreSQL), dan **Drizzle ORM**.
- [**`/mobile`**](./mobile/README.md): Aplikasi *Mobile* lintas platform yang dibangun menggunakan **Flutter**, tersinkronisasi secara *real-time* dengan Backend API Next.js.

## 🚀 Cara Memulai

Silakan masuk ke direktori masing-masing platform untuk panduan instalasi dan pengembangan lebih detail:
1. Buka [Desktop/Web README](./desktop/README.md) untuk menjalankan server lokal dan web dashboard.
2. Buka [Mobile README](./mobile/README.md) untuk menjalankan aplikasi Flutter di emulator atau perangkat fisik Anda.

---

*Dibuat dengan ❤️ untuk kemajuan Koperasi Indonesia.*
