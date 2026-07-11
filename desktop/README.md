# KopDes — Dashboard Web & Backend API 💻

Aplikasi ini adalah **dashboard admin Next.js** (digunakan oleh pengurus dan staf koperasi) **ditambah dengan API REST** yang dikonsumsi oleh aplikasi mobile Flutter. Kedua klien menggunakan backend Supabase (PostgreSQL) yang sama.

Untuk gambaran umum proyek, silakan merujuk pada [README utama di root](../README.md). Untuk aplikasi mobile Flutter, lihat [mobile/README.md](../mobile/README.md).

---

## 🛠️ Tech Stack (Teknologi)

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React Server Components)
- **Bahasa**: TypeScript (strict)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan tema kustom *Dark Slate & Yellow*
- **Database**: PostgreSQL yang di-host di [Supabase](https://supabase.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Autentikasi**: Supabase Auth (penyegaran sesi sisi server + verifikasi token JWT untuk rute API)
- **Deployment**: Vercel (auto-deploy saat melakukan push ke `main`)

---

## ✨ Fitur

- **Dashboard Web Anggota**: Memantau saldo simpanan, menyelesaikan misi harian, berbelanja di marketplace P2P, dan ikut bersaing di pertarungan **KopDes Arena** 1v1 mingguan.
- **Dashboard Web Admin**: Panel khusus pengurus untuk mengelola anggota koperasi, menyetujui penarikan/simpanan saldo dompet digital, membuat proposal tata kelola E-RAT, dan menganalisis statistik kesehatan koperasi menggunakan visualisasi Skor Kesehatan Koperasi SIDEPAK.
- **REST API untuk Mobile**: Menyediakan endpoint JSON (`/api/auth/*`, `/api/mobile-sync/*`, `/api/withdraw`, dll.) yang dikonsumsi oleh aplikasi Flutter melalui autentikasi token JWT. API menjalankan semua kueri database di sisi server menggunakan Drizzle — tidak ada kredensial sensitif Supabase yang bocor ke sisi klien mobile.

---

## 📂 Struktur Kode Sumber

```
desktop/src/
├── actions/              # Logika DB server-side (dipanggil oleh halaman RSC)
│   ├── arena.ts          # Battle arena, riwayat PvP
│   ├── auth.ts           # Pembantu auth Supabase
│   ├── dashboard.ts      # Kemajuan anggota, transaksi poin
│   ├── events.ts         # Kegiatan & kehadiran anggota
│   ├── financials.ts     # Tabungan, pinjaman, iuran wajib
│   ├── gamification.ts   # Papan peringkat, win rate, lencana
│   ├── governance.ts     # Pembuatan proposal E-RAT, suara, statistik
│   ├── members.ts        # Detail profil anggota
│   ├── quests.ts         # Misi & status pengerjaan anggota
│   └── shop.ts           # Pembelian barang, marketplace
├── app/
│   ├── (auth)/           # Publik: /signin, /signup
│   ├── (dashboard)/      # Halaman terproteksi (dashboard anggota & admin)
│   └── api/              # API REST untuk aplikasi Flutter
│       ├── auth/
│       │   ├── login/route.ts        # POST  /api/auth/login
│       │   └── signup/route.ts       # POST  /api/auth/signup
│       ├── admin-member/
│       │   └── route.ts              # POST  /api/admin-member (edit profil anggota oleh admin)
│       ├── withdraw/
│       │   └── route.ts              # POST  /api/withdraw (tarik saldo dompet digital)
│       ├── webhooks/
│       │   └── xendit/route.ts       # POST  /api/webhooks/xendit (webhook status pembayaran)
│       ├── delete-admin/
│       │   └── route.ts              # GET   /api/delete-admin (utilitas pembersih)
│       └── mobile-sync/
│           ├── route.ts              # GET   /api/mobile-sync
│           └── action/route.ts       # POST  /api/mobile-sync/action
├── components/           # Komponen UI bersama (Sidebar, BottomNav, MissionList, ...)
├── db/schema/            # Definisi tabel Drizzle ORM
├── utils/supabase/       # Helper Supabase server/klien
└── proxy.ts              # Middleware Next.js: auth guard (mengecualikan /api/*)
```

---

## 🗺️ Halaman (App Router)

| Rute | Auth | Peran | Tujuan |
|---|---|---|---|
| `/signin` | Publik | Semua | Masuk akun email/password |
| `/signup` | Publik | Semua | Pendaftaran anggota baru |
| `/` | Wajib | Anggota | Beranda dashboard anggota (simpanan, poin, peringkat, misi) |
| `/quests` | Wajib | Anggota | Pusat misi harian/mingguan & toko item |
| `/arena` | Wajib | Anggota | Battle arena 1v1 aktif, riwayat pertarungan, cari lawan |
| `/governance` | Wajib | Anggota | Voting proposal E-RAT, linimasa kebijakan, statistik koperasi |
| `/governance/members` | Wajib | Anggota | Daftar anggota koperasi |
| `/marketplace` | Wajib | Anggota | Pasar P2P antar-anggota |
| `/savings` | Wajib | Anggota | Rincian simpanan, pinjaman, dan iuran wajib |
| `/profile` | Wajib | Anggota | Tampilan kartu anggota, XP/level, koleksi lencana |
| `/admin` | Wajib | Admin | Beranda dashboard admin, bagan kas, persetujuan penarikan saldo |
| `/admin/members` | Wajib | Admin | Direktori anggota koperasi, rekam pendaftaran, ubah data anggota |
| `/admin/governance` | Wajib | Admin | Panel pembuatan proposal kebijakan E-RAT |
| `/admin/health` | Wajib | Admin | Visualisasi Skor Kesehatan Koperasi SIDEPAK |
| `/admin/health/methodology` | Wajib | Admin | Panduan dan penjelasan metodologi 5 dimensi Skor Kesehatan Koperasi |
| `/admin/profile` | Wajib | Admin | Profil admin & kredensial pengurus |

---

## 🚀 Menjalankan Secara Lokal

### 1. Variabel Lingkungan (Env Vars)

Salin `.env.example` ke `.env.local` dan lengkapi dengan kredensial Supabase Anda:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://project-id-anda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key-anda
SUPABASE_SERVICE_ROLE_KEY=service-role-key-anda
DATABASE_URL=postgresql://postgres:password@db.project-id-anda.supabase.co:6543/postgres
```

| Variabel | Digunakan oleh | Catatan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Klien & Server | Publik; aman dipublikasikan |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Klien & Server | Publik; aman dipublikasikan |
| `SUPABASE_SERVICE_ROLE_KEY` | Server saja (API, Server Actions) | Melewati kebijakan RLS — jaga kerahasiaannya |
| `DATABASE_URL` | Drizzle (Server saja) | URL koneksi langsung ke PostgreSQL Supabase |

### 2. Instalasi Dependensi

```bash
npm install
```

### 3. Sinkronisasi Skema Database (Opsional)

Jika Anda perlu memperbarui skema database Supabase PostgreSQL sesuai Drizzle schema:

```bash
npx drizzle-kit push
```

Untuk memasukkan data tiruan (seeding) untuk keperluan demo:

```bash
npx tsx scripts/seed-quests.ts
```

> **Catatan:** Seeding akan menghapus dan mengisi ulang data pada tabel tertentu — sesi masuk akun saat ini mungkin tidak valid lagi.

### 4. Mulai Server Pengembangan (Dev Server)

```bash
npm run dev
```

Buka halaman [http://localhost:3000](http://localhost:3000) pada browser Anda.

### 5. Menjalankan Aplikasi Mobile Flutter Secara Bersamaan

Di terminal terpisah, jalankan aplikasi Flutter pada port 3001:

```bash
cd ../mobile
flutter pub get
flutter run -d chrome --web-port 3001 --web-hostname localhost
```

Aplikasi Flutter akan memanggil API REST Next.js di `http://localhost:3000/api/...`, sehingga kedua aplikasi ini harus berjalan bersamaan.

---

## 🔌 Referensi API

Aplikasi Flutter berkomunikasi dengan backend Next.js melalui API REST. Seluruh rute mengembalikan respons JSON dan menyetel CORS header agar dapat dipanggil dari port yang berbeda. Lihat [README Utama § Referensi API](../README.md#referensi-api) untuk contoh struktur JSON lengkap.

| Endpoint | Metode | Auth | Tujuan |
|---|---|---|---|
| `/api/auth/login` | POST | — | Masuk akun email/password → mengembalikan JWT Supabase + profil |
| `/api/auth/signup` | POST | — | Pendaftaran anggota baru → mengembalikan JWT Supabase + profil |
| `/api/mobile-sync` | GET | `Bearer <token>` | Bundle kueri data keanggotaan (9 kueri database paralel via Drizzle) |
| `/api/mobile-sync/action` | POST | `Bearer <token>` | Transaksi tulis berdasarkan parameter `action` |
| `/api/admin-member` | POST | `Bearer <token>` (Admin) | Memperbarui detail profil anggota (Hanya untuk Admin) |
| `/api/withdraw` | POST | `Bearer <token>` | Mengajukan transaksi penarikan dompet digital melalui Xendit Payouts |
| `/api/webhooks/xendit` | POST | — | Menerima webhook status transfer uang dari Xendit |
| `/api/delete-admin` | GET | — | Menghapus akun admin untuk keperluan pengujian lokal |

### Penanganan CORS

Semua rute API mengekspor penangan `OPTIONS()` yang mengembalikan respons 204 beserta headers preflight yang dibutuhkan. Middleware Next.js (`src/proxy.ts`) secara khusus **mengecualikan rute `/api/*`** dari pemeriksaan alihan auth, agar kueri preflight dijawab langsung oleh rute API tanpa terlempar ke halaman `/signin`.

---

## 🛡️ Pengaman Autentikasi Middleware (`src/proxy.ts`)

Menggunakan middleware Next.js (konvensi berkas `proxy` untuk versi ini):
- Menyegarkan sesi autentikasi Supabase cookie pada setiap permintaan halaman.
- Mengalihkan pengguna yang belum login ke `/signin`.
- Mengalihkan pengguna yang sudah login menjauhi rute `/signin` dan `/signup`.
- Mengecualikan rute `/api/*` dari alihan otomatis agar kueri preflight CORS tidak terganggu.

---

## 🧪 Pengujian (Testing)

```bash
npm test              # Menjalankan 50 pengujian unit Jest + React Testing Library
npm run lint          # ESLint
npx tsc --noEmit      # Pemeriksaan tipe TypeScript strict
```

Semua pemeriksaan harus sukses sebelum perubahan digabungkan ke branch utama (`main`). Pemeriksaan berjalan otomatis di pipeline CI GitHub Actions (`.github/workflows/desktop-ci.yml`).
