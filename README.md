# SIDEPAK — Platform Koperasi Desa Tergamifikasi

> **TL;DR — 3 Fitur Utama SIDEPAK:**
> 1. **Gamifikasi & Sistem Battle PvP:** Mengubah aktivitas koperasi (seperti menabung dan menghadiri kegiatan) menjadi poin dan XP. Anggota secara otomatis dipasangkan dalam pertempuran 1v1 mingguan (KopDes/SIDEPAK Arena) untuk bersaing mendapatkan bonus poin.
> 2. **Otomatisasi WhatsApp (n8n):** Alur pesan dua arah otomatis terintegrasi AI (DeepSeek) via WhatsApp untuk melayani pertanyaan anggota secara mandiri (inbound) dan menyiarkan pengumuman proposal rapat maupun event koperasi (outbound).
> 3. **Panel Admin Skor Kesehatan Koperasi:** Dashboard khusus pengurus untuk memantau "Cooperative Health Score" (0-100) secara real-time yang dihitung secara ilmiah berdasarkan 5 dimensi: Kepatuhan Iuran, Penetrasi Digital, Partisipasi Governance (E-RAT), Kesehatan Kredit, dan Engagement Gamifikasi.

---

> SIDEPAK — Manajemen koperasi digital untuk *Koperasi Merah Putih Desa*.
> A monorepo dengan **dua aplikasi yang berbagi satu backend Supabase (PostgreSQL)**: dashboard admin berbasis Next.js dan aplikasi web/mobile Flutter untuk anggota.

---

## Daftar Isi

- [Apa itu SIDEPAK?](#apa-itu-sidepak)
- [Fitur Utama](#fitur-utama)
- [Tech Stack (Teknologi)](#tech-stack-teknologi)
- [Struktur Repositori](#struktur-repositori)
- [Dua Aplikasi](#dua-aplikasi)
- [Arsitektur](#arsitektur)
- [Otomatisasi WhatsApp (n8n)](#otomatisasi-whatsapp-n8n)
- [Model Domain Utama](#model-domain-utama)
- [Skema Database](#skema-database)
- [Referensi API](#referensi-api)
- [Quick Start (Panduan Memulai)](#quick-start-panduan-memulai)
- [Membangun APK Mobile](#membangun-apk-mobile)
- [CI/CD](#cicd)
- [Pengujian (Testing)](#pengujian-testing)
- [Script Proyek](#script-proyek)
- [Batasan Diketahui](#batasan-diketahui)
- [Kontribusi](#kontribusi)

---

## Apa itu SIDEPAK?

**SIDEPAK (Koperasi Digital)** adalah platform manajemen koperasi pedesaan modern yang mengintegrasikan layanan keuangan tradisional dengan **gamifikasi**, **pasar (marketplace) anggota-ke-anggota (P2P)**, dan **partisipasi komunitas**. Sistem ini dirancang untuk membuat partisipasi koperasi semenarik game seluler, sembari mempertahankan ketelitian akuntansi riil, tabungan, pinjaman, dan tata kelola anggota.

Platform ini menargetkan *Koperasi Merah Putih Desa* — koperasi tingkat desa yang menjadi tulang punggung keuangan masyarakat pedesaan di Indonesia. Dua aplikasi klien berbagi backend Supabase (PostgreSQL) yang sama:

| Klien | Tujuan |
|---|---|
| **Aplikasi Mobile** (`mobile/`) | Untuk kenyamanan saat menggunakan HP |
| **Aplikasi Website** (`desktop/`) | Untuk jika tidak ingin melakukan download atau sedang tidak menggunakan handphone |

**Akun Demo:**
- Anggota Biasa: `janedoe@gmail.com` / `janedoe`
- Administrator: `admin@gmail.com` / `admindoe`

Panduan setup aplikasi:
- [Panduan Dashboard Web Desktop & API](./desktop/README.md)
- [Panduan Mobile (Flutter)](./mobile/README.md)

---

## Fitur Utama

- **Layanan Keuangan Digital** — Tabungan (*Simpanan Pokok, Wajib, Sukarela*) dan Pinjaman (*Pinjaman*) yang tercatat dengan jejak audit lengkap.
- **SIDEPAK Health Score** — Mesin penilaian kesehatan koperasi deterministik yang mengukur kesehatan koperasi berdasarkan 5 dimensi terbobot (Kepatuhan iuran, penetrasi digital, partisipasi tata kelola/E-RAT, kesehatan kredit, dan keterlibatan gamifikasi).
- **Dompet Digital & Pencairan Xendit** — Fungsionalitas dompet dalam aplikasi yang terintegrasi dengan Xendit Payouts untuk memproses penarikan saldo secara digital langsung ke rekening bank anggota.
- **SIDEPAK Arena — Lapisan Gamifikasi**
  - **Misi Harian & Mingguan** untuk mendapatkan poin (terintegrasi dengan aksi riil aplikasi seperti menabung, login harian, dan ikut event).
  - **Streak Login** harian untuk mendapatkan bonus poin.
  - **Battle Arena Mingguan** 1v1 melawan anggota lain (dipasangkan otomatis oleh sistem).
- **Marketplace Antar-Anggota (P2P)** — Membelanjakan poin untuk mendaftarkan dan membeli barang dari sesama anggota, lengkap dengan efek item opsional (seperti `freeze_streak`, `prank`).
- **Tata Kelola Koperasi (E-RAT)** — Anggota memberikan suara pada proposal kebijakan (*Setuju / Tolak / Abstain*) secara digital; proposal diselesaikan berdasarkan kuorum.
- **Multi-platform & Multi-Role** — Portal khusus Admin dan Anggota yang tersedia di Next.js (desktop) dan Flutter (mobile/web).

---

## Tech Stack (Teknologi)

| Lapisan | Teknologi |
|---|---|
| Dashboard Desktop | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Aplikasi Anggota | Flutter, Dart 3.6 (web + Android + iOS) |
| State Mobile | `provider` (pola ChangeNotifier) |
| Database | PostgreSQL via Supabase |
| ORM | Drizzle ORM |
| Autentikasi | Supabase Auth (email/password, JWT) |
| Gaya API | Next.js Server Actions (web) + REST Route Handlers (mobile) |
| Deployment | Google Cloud Run (Next.js) + Vercel (Flutter web) |
| Packaging Mobile | Gradle / Android SDK (APK), Xcode (iOS) |
| CI (Integrasi Kontinu) | GitHub Actions |

---

## Struktur Repositori

```
SIDEPAK/
├── desktop/                          # Dashboard admin & backend API Next.js
│   ├── src/
│   │   ├── actions/                  # Logika server-side DB (tidak ada SQL mentah di komponen UI)
│   │   │   ├── arena.ts              # Battle arena: aktif & riwayat
│   │   │   ├── auth.ts               # Pembantu auth Supabase
│   │   │   ├── dashboard.ts          # Kemajuan anggota, transaksi poin
│   │   │   ├── events.ts             # Manajemen event & kehadiran
│   │   │   ├── financials.ts         # Tabungan, pinjaman, iuran
│   │   │   ├── gamification.ts       # Item toko, tingkat kemenangan, lencana, papan peringkat
│   │   │   ├── governance.ts         # Proposal, suara (voting), statistik koperasi
│   │   │   ├── members.ts            # Pencarian profil anggota
│   │   │   ├── quests.ts             # Misi & kemajuan anggota
│   │   │   └── shop.ts               # Pembelian item, pendaftaran marketplace
│   │   ├── app/
│   │   │   ├── (auth)/               # Halaman auth publik (signin, signup)
│   │   │   ├── (dashboard)/          # Halaman terproteksi autentikasi
│   │   │   │   ├── page.tsx          # Dashboard home anggota
│   │   │   │   ├── arena/            # Arena pertarungan PvP
│   │   │   │   ├── governance/       # Voting E-RAT, statistik, daftar anggota
│   │   │   │   ├── marketplace/      # Tampilan marketplace admin
│   │   │   │   ├── profile/          # Profil & lencana anggota
│   │   │   │   ├── quests/           # Pusat misi & toko item
│   │   │   │   └── savings/          # Detail simpanan/pinjaman/iuran
│   │   │   └── api/                  # API REST untuk aplikasi mobile
│   │   │       ├── auth/{login,signup}/route.ts
│   │   │       └── mobile-sync/{route.ts, action/route.ts}
│   │   ├── components/               # Komponen UI bersama (Sidebar, MissionList, AutoMatchmake, ...)
│   │   ├── db/schema/                # Definisi tabel Drizzle ORM
│   │   ├── utils/supabase/           # Pembantu server/klien Supabase
│   │   └── proxy.ts                  # Middleware Next.js (auth guard; mengecualikan /api/*)
│   └── package.json
│
├── mobile/                           # Aplikasi Flutter (web + Android + iOS)
│   ├── lib/
│   │   ├── main.dart                 # Entrypoint aplikasi, MaterialApp, setup Provider
│   │   ├── models/                   # Model data (Mission, ShopItem, HistoryItem)
│   │   ├── providers/
│   │   │   └── koperasi_provider.dart   # ChangeNotifier pusat (state utama)
│   │   └── views/                    # Layar aplikasi & widget kustom (lihat mobile/README.md)
│   ├── test/                         # 65 pengujian unit dan widget
│   └── pubspec.yaml
│
├── .github/workflows/
│   ├── desktop-ci.yml                # CI Desktop: Lint + tsc + jest
│   └── mobile-ci.yml                 # CI Mobile: Dart format + analyze + test
│
├── n8n/                              # Otomatisasi WhatsApp n8n
│   ├── My workflow.sanitized.json    # File ekspor workflow bersih (redaksi rahasia)
│   └── SETUP.md                      # Cara konfigurasi ulang kredensial di n8n
│
├── package.json                      # Workspace root (script lintas-aplikasi)
├── context.md                        # Spesifikasi domain model
└── handoff.md                        # Dokumen serah terima teknis (handoff)
```

---

## Dua Aplikasi

### 1. Dashboard Admin Desktop (`desktop/`)

Dashboard Next.js mencakup dua peran utama: **Anggota** (yang menggunakan fitur dashboard standar) dan **Admin** (yang mengelola operasional koperasi). Menggunakan **Server Actions** untuk hampir semua akses data (tidak memerlukan lapisan API terpisah untuk UI web), kecuali untuk API REST kecil yang digunakan oleh aplikasi mobile.

**Halaman**

| Rute | Auth | Peran | Tujuan |
|---|---|---|---|
| `/signin` | Publik | Semua | Masuk dengan email & password |
| `/signup` | Publik | Semua | Pendaftaran anggota baru |
| `/` (home) | Wajib | Anggota | Total simpanan, poin, peringkat, misi harian, statistik koperasi |
| `/quests` | Wajib | Anggota | Pusat misi + toko item |
| `/arena` | Wajib | Anggota | Tampilan arena pertarungan aktif, riwayat pertarungan, kontrol pencarian lawan otomatis |
| `/governance` | Wajib | Anggota | Voting E-RAT, linimasa proposal, statistik koperasi |
| `/governance/members` | Wajib | Anggota | Direktori anggota koperasi |
| `/marketplace` | Wajib | Anggota | Tampilan pasar P2P (Peer-to-Peer) |
| `/savings` | Wajib | Anggota | Rekam data simpanan, pinjaman, dan iuran wajib |
| `/profile` | Wajib | Anggota | Kartu anggota digital, status level/XP, koleksi lencana |
| `/admin` | Wajib | Admin | Beranda admin, statistik keuangan koperasi, persetujuan penarikan saldo |
| `/admin/members` | Wajib | Admin | Manajemen profil anggota, persetujuan pendaftaran, editor status |
| `/admin/governance` | Wajib | Admin | Panel pembuatan dan pengelolaan proposal kebijakan E-RAT |
| `/admin/health` | Wajib | Admin | Dashboard visual Skor Kesehatan Koperasi SIDEPAK beserta detail dimensinya |
| `/admin/health/methodology` | Wajib | Admin | Penjelasan ilmiah dan metodologi perhitungan Skor Kesehatan Koperasi |
| `/admin/profile` | Wajib | Admin | Detail profil admin dan pengaturan kredensial |

Lihat [desktop/README.md](./desktop/README.md) untuk detail setup, variabel lingkungan (env vars), dan referensi API lengkap.

### 2. Aplikasi Web/Mobile Anggota (`mobile/`)

Satu basis kode Flutter yang dibangun untuk **web (Chrome/Safari/Firefox)**, **Android (APK)**, dan **iOS**. Aplikasi anggota ini juga dilengkapi dengan integrasi **Mode Admin** mobile untuk pengurus.

**Layar**

| Layar | Target Pengguna | Tujuan |
|---|---|---|
| Login / Sign Up | Semua | Autentikasi email/password; menyimpan JWT secara lokal di `shared_preferences` |
| Onboarding | Semua | Slide pengantar yang menjelaskan konsep koperasi digital SIDEPAK |
| Home | Anggota | Total simpanan, saldo poin, lencana peringkat aktif, misi harian, statistik koperasi |
| Misi (Missions) | Anggota | Kalender streak mingguan (Senin-Minggu), misi harian & mingguan, toko item |
| Battle (Arena) | Anggota | Tampilan battle mingguan melawan lawan otomatis, bar perbandingan poin, hitung mundur |
| Koperasi | Anggota | Kartu statistik (transaksi, anggota baru, omzet), voting proposal E-RAT, linimasa |
| Profile | Anggota | Lencana peringkat, koleksi pencapaian, kartu dampak sosial (tabungan, kemenangan battle) |
| Health Score | Anggota | Tampilan visual metrik kesehatan koperasi saat ini |
| Marketplace | Anggota | Pasar P2P: telusuri barang, daftarkan barang jualan pribadi, beli barang pakai poin |
| Events | Anggota | Daftar kegiatan komunitas koperasi, gabung event, formulir pembuatan event baru |
| Members Directory | Anggota | Telusuri semua anggota koperasi lainnya, detail profil anggota |
| Simpanan | Anggota | Rincian detail simpanan (Pokok, Wajib, Sukarela) |
| Admin Dashboard | Admin | Statistik operasional admin mobile, saldo kas koperasi, persetujuan simpanan/penarikan |
| Admin Members | Admin | Direktori pengurus mobile untuk mengedit profil anggota dan status persetujuan |
| Admin Profile | Admin | Pengaturan akun dan informasi profil admin |

Aplikasi Flutter **tidak** terhubung langsung ke database Supabase. Aplikasi ini berkomunikasi dengan **Next.js REST API** (`/api/auth/*` dan `/api/mobile-sync/*`), yang memproksi kueri ke Supabase menggunakan kredensial tingkat server yang aman.

Lihat [mobile/README.md](./mobile/README.md) untuk detail layar, manajemen state, dan petunjuk kompilasi APK.

---

## Arsitektur

```
┌──────────────────────────────────────────────────────────────┐
│                     Supabase (PostgreSQL)                     │
│  users · members · member_progress · savings · loans · dues  │
│  battles · quests · member_quests · badges · member_badges   │
│  proposals · votes · items · member_items · point_tx         │
│  wallet_transactions · disbursements · marketplace_tx ...    │
└──────────────────────────────────────────────────────────────┘
                          ▲
                          │  Drizzle ORM
                          │
       ┌──────────────────┴────────────────────┐
       │   Next.js (port 3000, Vercel)         │
       │                                       │
       │  ┌─────────────────────────────────┐  │
       │  │  React Server Components        │  │  ← Halaman dashboard admin & anggota
       │  │  src/app/(dashboard)/...        │  │
       │  └────────────┬────────────────────┘  │
       │               │                       │
       │       src/actions/*.ts (Server       │
       │       Actions — helper database)      │
       │                                       │
       │  ┌─────────────────────────────────┐  │
       │  │  REST Route Handlers            │  │  ← Dikonsumsi oleh Flutter
       │  │  /api/auth/login                │  │
       │  │  /api/auth/signup               │  │
       │  │  /api/mobile-sync    (GET)      │  │
       │  │  /api/mobile-sync/action (POST) │  │
       │  └─────────────────────────────────┘  │
       │                                       │
       │  src/proxy.ts — auth guard            │
       │  (mengecualikan /api/* dari redirect) │
       └──────────────────┬────────────────────┘
                          │  HTTP + JWT Bearer
       ┌──────────────────┴────────────────────┐
       │   Flutter App (port 3001 web)         │
       │   KoperasiProvider (ChangeNotifier)   │
       │   → views/*                           │
       └───────────────────────────────────────┘
```

---

## Otomatisasi WhatsApp (n8n)

Keterlibatan anggota didorong oleh satu **workflow n8n** yang menangani lalu lintas WhatsApp baik masuk (*inbound*) maupun keluar (*outbound*). Workflow ini disimpan di folder [`n8n/`](./n8n/) dalam bentuk file JSON yang telah disanitasi.

### Aliran Percabangan

| Aliran | Pemicu | Fungsi |
|---|---|---|
| **Inbound** | Webhook WhatsApp `messages` | Membaca pesan teks anggota, menjalankan agen AI (DeepSeek) dengan hak kueri Supabase **read-only** (dibatasi sesuai `wa_id` pengirim), lalu membalas via WhatsApp. Riwayat obrolan disimpan dinamis berdasarkan `wa_id`. |
| **Outbound — Events** | Jadwal Rutin (Per Jam) | Agen AI memindai tabel `events` dengan filter `n8n_sent = false`, mencari anggota koperasi yang bersangkutan, mengirimkan notifikasi WhatsApp, lalu memperbarui status `n8n_sent = true` agar tidak disiarkan ulang. |
| **Outbound — Proposals** | Jadwal Rutin (Per Jam) | Pola yang sama seperti cabang event, namun menargetkan tabel `proposals` untuk menyiarkan proposal rapat anggota (E-RAT). |

---

## Model Domain Utama

### 1. Poin & Marketplace
Anggota mendapatkan poin dari misi, battle arena, partisipasi event, dan transaksi keuangan. Poin dibelanjakan di **marketplace antar-anggota (P2P)**. Semua barang diposting oleh anggota itu sendiri (tidak ada stok admin). Barang dapat memiliki efek opsional (misalnya `freeze_streak`, `prank`).

### 2. Level & Peringkat
Anggota mengumpulkan XP dari aktivitas untuk naik level. Lencana peringkat ditentukan berdasarkan ambang batas level:
*   **Perunggu (Bronze):** Level 1-2
*   **Perak (Silver):** Level 3-5
*   **Emas (Gold):** Level 6-9
*   **Platinum:** Level 10-14
*   **Legenda (Legend):** Level 15+

### 3. Papan Peringkat (Leaderboard)
Enam dimensi peringkat yang dikelompokkan per koperasi dan dapat difilter secara mingguan, bulanan, atau sepanjang waktu: poin, level/XP, partisipasi event, rasio kemenangan battle, total tabungan, dan login streak.

### 4. Battle Arena (PvP Mingguan)
Setiap minggu, sistem **secara otomatis memasangkan anggota** secara acak dalam pertempuran 1v1. Pemenang ditentukan di akhir minggu berdasarkan akumulasi poin tertinggi yang dikumpulkan dalam minggu tersebut.

### 5. Skor Kesehatan Koperasi (SIDEPAK Health Score)
Skor gabungan (0-100) untuk menentukan peringkat kesehatan koperasi pedesaan:
*   **Sehat ($\ge 60$):** Koperasi berjalan sangat aktif dan tertib administrasi.
*   **Waspada ($35\text{--}59$):** Membutuhkan pengawasan, terdapat kelambatan pada iuran atau keaktifan anggota.
*   **Kritis ($< 35$):** Koperasi berisiko tinggi kolaps karena kurangnya iuran atau partisipasi digital.

Dihitung berdasarkan 5 metrik terbobot: Kepatuhan Iuran (35%), Penetrasi Digital (25%), Partisipasi Tata Kelola (20%), Kesehatan Kredit (10%), dan Gamifikasi (10%).

---

## Skema Database

| Tabel | Tujuan |
|---|---|
| `users` | Akun pengguna auth Supabase (UUID) |
| `cooperatives` | Entitas koperasi pedesaan |
| `members` | Profil anggota (NIK, nama lengkap, koperasi, nomor anggota, no hp, status) |
| `member_progress` | Level, XP, saldo poin, streak, tanggal aktivitas, saldo dompet digital, skor kredit |
| `point_transactions` | Catatan masuk/keluar poin beserta sumbernya (`quest`, `battle`, `saving`, dll.) |
| `savings` | Transaksi setoran/penarikan simpanan sukarela |
| `loans` | Rekam pinjaman anggota (bunga, status persetujuan, batas tempo) |
| `dues` | Pembayaran iuran pokok (sekali) dan iuran wajib (bulanan) |
| `battles` | Riwayat pertarungan mingguan 1v1 antara anggota |
| `quests` | Definisi misi harian, mingguan, dan sekali selesai |
| `member_quests` | Status kemajuan pengerjaan misi per anggota |
| `items` | Definisi item booster toko yang dapat dibeli dengan poin |
| `member_items` | Inventaris item yang dimiliki anggota beserta jumlahnya |
| `badges` | Definisi lencana pencapaian |
| `member_badges` | Lencana yang berhasil didapatkan oleh anggota |
| `proposals` | Proposal kebijakan tata kelola koperasi (E-RAT) |
| `votes` | Hak suara anggota terhadap proposal (Setuju / Tolak / Abstain) |
| `events` | Kegiatan komunitas koperasi |
| `event_participants` | Kehadiran partisipasi anggota pada event |
| `wallet_transactions` | Riwayat transaksi dompet digital |
| `disbursements` | Rekam permintaan penarikan saldo riil terintegrasi Xendit |
| `marketplace_transactions` | Catatan transaksi jual-beli barang P2P antar-anggota |
| `seasons` | Pengaturan rentang musim aktif untuk liga PvP |
| `koperasi_season_scores` | Poin akumulasi kemenangan koperasi dalam satu musim pertarungan |

---

## Referensi API

Aplikasi Flutter berkomunikasi dengan API REST di `desktop/src/app/api/`.

### `POST /api/auth/login`
```jsonc
// Request
{ "email": "user@example.com", "password": "••••••" }

// Response (200 OK)
{
  "success": true,
  "token": "eyJhbGciOi...",     // JWT Supabase
  "memberId": 42,
  "email": "user@example.com",
  "fullName": "Andi Wijaya"
}
```

### `POST /api/auth/signup`
```jsonc
// Request
{
  "email": "user@example.com",
  "password": "••••••",
  "namaLengkap": "Andi Wijaya",
  "nik": "3201234567890001",
  "nomorAnggota": "AGT-0042",
  "cooperativeId": 1
}
```

### `GET /api/mobile-sync` (membutuhkan autentikasi)
`Authorization: Bearer <token>`
Mengembalikan seluruh data yang dibutuhkan oleh aplikasi anggota dalam satu kali panggilan API (menjalankan 9 kueri database paralel via `Promise.all`).

### `POST /api/mobile-sync/action` (membutuhkan autentikasi)
`Authorization: Bearer <token>`
Endpoint tunggal untuk transaksi tulis menggunakan parameter pembeda `action`.
```jsonc
{ "action": "complete_quest", "questId": 1 }
{ "action": "cast_vote",     "proposalId": 1, "vote": "Setuju" }
{ "action": "purchase_item", "itemId": 1 }
{ "action": "use_item",      "itemId": 1 }
```

### `POST /api/admin-member` (membutuhkan autentikasi admin)
`Authorization: Bearer <token>`
Mengubah detail profil anggota koperasi. Hanya dapat diakses oleh user dengan role `admin`.
```jsonc
{
  "memberId": 12,
  "data": {
    "namaLengkap": "Budi Santoso",
    "nomorHp": "081234567890",
    "statusAnggota": "active"
  }
}
```

### `POST /api/withdraw` (membutuhkan autentikasi)
`Authorization: Bearer <token>`
Mengajukan penarikan saldo dompet digital. Saldo dipotong dari `member_progress.wallet_balance` dan pencairan diproses ke rekening bank tujuan melalui Xendit.
```jsonc
{
  "amount": 25000,
  "bankCode": "BCA",
  "accountNumber": "1234567890",
  "accountName": "Andi Wijaya"
}
```

### `POST /api/webhooks/xendit`
Menerima status penarikan dari Xendit. Memperbarui status disbursement menjadi `COMPLETED` atau `FAILED` (saldo otomatis dikembalikan apabila transaksi gagal).
```jsonc
{
  "external_id": "withdraw-42-1718090000000",
  "status": "COMPLETED",
  "amount": 25000
}
```

### `GET /api/delete-admin` (dev utility)
Menghapus seluruh akun pengurus berstatus `admin` untuk keperluan reset pengujian database.

---

## Quick Start (Panduan Memulai)

### Prasyarat
*   **Node.js** v20+ dan npm v10+
*   **Flutter SDK** v3.27+ dengan Dart v3.6+
*   Database **Supabase** (PostgreSQL)

### Instalasi
```bash
git clone https://github.com/danarrigo/SIDEPAK
cd SIDEPAK
npm install
```

### Jalankan Aplikasi secara Lokal
```bash
# Terminal 1 — Dashboard Desktop Next.js
cd desktop
cp .env.example .env.local  # kemudian isi variabel kredensial Supabase Anda
npm run dev                 # Berjalan pada http://localhost:3000

# Terminal 2 — Aplikasi Flutter
cd mobile
flutter pub get
flutter run -d chrome --web-port 3001 --web-hostname localhost  # Berjalan pada http://localhost:3001
```

---

## Membangun APK Mobile

Untuk mengkompilasi file paket instalasi Android:
```bash
cd mobile
flutter pub get

# Debug APK (file instalasi debug, ~140 MB)
flutter build apk --debug

# Release APK (produksi standar, ~51 MB)
flutter build apk --release

# Per-ABI APK (ukuran kecil dipisah per jenis prosesor ponsel, ~20 MB)
flutter build apk --split-per-abi --release
```

---

## CI/CD

Dua alur pengujian GitHub Actions berjalan otomatis setiap kali ada kode yang didorong (*push*) ke branch `main`:
*   `desktop-ci.yml` — Menjalankan uji `npm run lint` → `tsc --noEmit` → `jest` di folder `desktop/`.
*   `mobile-ci.yml` — Menjalankan pemeriksaan format Dart, analisis statis, dan `flutter test`.

Dashboard Next.js di-deploy ke **Google Cloud Run** menggunakan Dockerfile, sedangkan Flutter Web di-deploy ke **Vercel** di alamat `https://hackathon-SIDEPAK.vercel.app`.

---

## Pengujian (Testing)

*   **Uji Desktop (Jest & RTL):** `cd desktop && npm test`
*   **Uji Mobile (Flutter Widget):** `cd mobile && flutter test`

---

## Batasan Diketahui

*   **`omzetHarian` & `umkmAktif`** masih di-hardcode `0` karena tabel di database belum terisi.
*   **Streak Kalender** dihitung mundur secara dinamis dari `lastActivityDate` anggota, belum didukung riwayat aktivitas harian yang permanen.
*   **Rilis APK** ditandatangani menggunakan *debug key* bawaan Flutter. Kunci keystore kustom diperlukan sebelum didistribusikan ke Google Play Store.

---

## Kontribusi

1. Buat branch baru dari `main` (`git checkout -b feature/fitur-anda`).
2. Terapkan perubahan kode Anda dan tambahkan file tes baru bila diperlukan.
3. Jalankan seluruh uji pengujian lokal.
4. Buat Pull Request (PR) untuk digabungkan kembali ke branch `main`.

---

*Dibuat dengan ❤️ untuk kemajuan Koperasi Indonesia.*
