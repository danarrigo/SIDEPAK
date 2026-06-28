# KopDes - Web Dashboard & Backend API 💻

Bagian ini adalah repositori untuk aplikasi Web (Dashboard Anggota/Admin) sekaligus penyedia rute API Backend yang akan dikonsumsi oleh aplikasi Mobile.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan skema tema khusus (*Dark Slate & Yellow*).
- **Database**: PostgreSQL (di-hosting melalui [Supabase](https://supabase.com/)).
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: Supabase Auth (Server & Client side).

## ✨ Fitur Utama

- **Web Dashboard**: Pantau saldo simpanan, ikuti *quests* harian, kelola *marketplace*, dan berpartisipasi dalam Koperasi Arena mingguan.
- **API Rute Khusus Mobile**: Menyediakan API *endpoint* (seperti `/api/mobile-sync`) untuk menyinkronkan data gamifikasi, statistik, dan status pengguna ke aplikasi Flutter.

## 🚀 Cara Menjalankan Secara Lokal

### 1. Persiapan Lingkungan (Environment Variables)

Salin file `.env.example` menjadi `.env.local` dan isi kredensial Supabase serta Database Anda:

```bash
cp .env.example .env.local
```

Contoh isi `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:6543/postgres
```

### 2. Instalasi Dependensi

Jalankan perintah berikut di dalam folder `desktop`:

```bash
npm install
```

### 3. Setup Database (Opsional)

Jika Anda perlu men-sinkronisasi skema database ke Supabase, jalankan Drizzle push:

```bash
npx drizzle-kit push
```

Untuk memasukkan data *dummy* (*seed*):
```bash
npx tsx scripts/seed-quests.ts
```
*(Catatan: Seeding database dapat menghapus data tabel tertentu, hati-hati terhadap invalidasi sesi login yang sudah ada).*

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat aplikasinya.
