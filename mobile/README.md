# KopDes — Aplikasi Mobile 📱

Klien Flutter untuk platform koperasi KopDes. Sebuah **basis kode tunggal** yang dikompilasi untuk **web (Chrome/Safari/Firefox)**, **Android (APK)**, dan **iOS**. Build web adalah target utama untuk demo hackathon; Android APK untuk pengujian lapangan pada ponsel nyata.

Untuk gambaran umum proyek, silakan lihat [README utama di root](../README.md). Untuk backend Next.js, lihat [desktop/README.md](../desktop/README.md).

---

## 🛠️ Tech Stack (Teknologi)

- **Framework**: [Flutter](https://flutter.dev/) (Dart 3.6, Flutter 3.27+)
- **Manajemen State**: [`provider`](https://pub.dev/packages/provider) — satu `KoperasiProvider` (`ChangeNotifier`) memegang semua state aplikasi
- **UI/UX**: Tema kustom *Dark Slate & Yellow* yang cocok dengan dashboard web desktop
- **HTTP**: Paket Dart `http` untuk memanggil Next.js REST API
- **Penyimpanan Lokal**: `shared_preferences` (dikunci ke versi `^2.5.3` untuk kompatibilitas Dart 3.6.0) — menyimpan token JWT
- **Integrasi Backend**: REST API Next.js di `/api/auth/*` dan `/api/mobile-sync/*` (tidak ada akses langsung Supabase dari aplikasi)

---

## ✨ Fitur

- **Dashboard Saku** — Total simpanan, saldo poin, lencana peringkat, dan misi harian dalam sekali pandang.
- **KopDes Arena (Mobile)** — Tampilan pertempuran beranimasi, bar kemajuan mingguan, dan riwayat pertarungan.
- **Pusat Misi** — Misi harian & mingguan, toko item, dan kalender streak mingguan (Senin-Minggu).
- **Marketplace** — Telusuri barang dagangan P2P, daftarkan barang jualan pribadi, dan transaksi menggunakan saldo poin.
- **Tata Kelola (E-RAT)** — Memberikan suara (Setuju / Tolak / Abstain) pada proposal aktif pedesaan beserta linimasa kebijakan.
- **SIDEPAK Health Score (Mobile)** — Tampilan visual dimensi kesehatan koperasi langsung di dalam aplikasi anggota.
- **Mode Admin** — Layar mobile admin untuk pengurus guna melihat bagan keuangan koperasi serta menyetujui kueri simpanan/penarikan saldo anggota.
- **Real-Time Sync** — Semua data ditarik dari `/api/mobile-sync` (satu bundle data, dijalankan dengan 9 kueri database paralel di server), menghindari masalah kehabisan pool koneksi Postgres.

---

## 📂 Struktur Kode Sumber

```
mobile/lib/
├── main.dart                       # Entrypoint aplikasi, setup MaterialApp, setup Provider, navigasi
├── models/
│   ├── mission.dart                # Model misi / quest
│   ├── shop_item.dart              # Model item marketplace
│   └── history_item.dart           # Model riwayat battle PvP
├── providers/
│   └── koperasi_provider.dart      # ChangeNotifier utama (State global & pemanggilan API)
└── views/
    ├── login_view.dart
    ├── signup_view.dart
    ├── home_view.dart              # Beranda: simpanan, poin, misi, statistik koperasi
    ├── misi_view.dart              # Pusat misi, kalender streak, toko item
    ├── battle_view.dart            # Arena: pertempuran PvP aktif, riwayat
    ├── koperasi_view.dart          # Statistik koperasi, voting E-RAT, linimasa
    ├── profile_view.dart           # Profil, peringkat, lencana pencapaian, statistik dampak
    ├── marketplace_view.dart       # Pasar P2P antar-anggota
    ├── events_view.dart            # Kegiatan komunitas
    ├── members_directory_view.dart # Direktori daftar anggota
    ├── member_detail_view.dart     # Detail anggota
    ├── simpanan_view.dart          # Detail simpanan (Pokok / Wajib / Sukarela)
    └── widgets/
        ├── create_event_form.dart
        ├── leaderboard_section.dart
        ├── marketplace_list_form.dart
        └── prank_overlay.dart
```

---

## 🗺️ Layar

| Layar | Target Pengguna | Tujuan |
|---|---|---|
| **Login** | Semua | Masuk akun email/password; menyimpan JWT ke `shared_preferences` |
| **Sign Up** | Semua | Registrasi anggota baru (NIK, nama lengkap, …) |
| **Onboarding** | Semua | Layar slide pengantar koperasi digital SIDEPAK |
| **Home** | Anggota | Saldo simpanan, saldo poin, lencana peringkat aktif, misi harian, statistik koperasi |
| **Misi (Missions)** | Anggota | Label peringkat, kalender streak mingguan (Senin-Minggu), misi harian/mingguan, toko item |
| **Battle (Arena)** | Anggota | Battle mingguan vs lawan acak, bar perbandingan, hitung mundur berakhirnya battle, riwayat |
| **Koperasi** | Anggota | Kartu statistik (transaksi, anggota baru, omzet, UMKM), voting proposal E-RAT, linimasa |
| **Profile** | Anggota | Lencana peringkat, koleksi lencana pencapaian, kartu dampak, diagram kemajuan level |
| **Health Score** | Anggota | Visualisasi status dimensi kesehatan koperasi saat ini |
| **Marketplace** | Anggota | Pasar P2P: belanja barang, daftarkan dagangan baru, beli pakai poin |
| **Events** | Anggota | Kegiatan komunitas: daftar event, buat event baru, ikut serta |
| **Members Directory** | Anggota | Telusuri semua anggota koperasi pedesaan, detail profil |
| **Simpanan** | Anggota | Rincian simpanan (Pokok, Wajib, Sukarela) |
| **Admin Dashboard** | Admin | Ringkasan metrik keuangan, saldo kas, persetujuan penarikan saldo anggota |
| **Admin Members** | Admin | Layar manajemen anggota untuk pengurus mengubah data anggota |
| **Admin Profile** | Admin | Kredensial akun pengurus & profil admin |

---

## 🧠 Manajemen State

Semua state klien disimpan di dalam `KoperasiProvider` (`ChangeNotifier`). Provider ini adalah satu-satunya komponen yang memanggil API REST Next.js; komponen UI membaca state menggunakan `Provider.of<KoperasiProvider>(context)` atau `context.watch`.

| Field | Sumber Backend | Deskripsi |
|---|---|---|
| `points` | `member_progress.pointsBalance` | Saldo poin saat ini |
| `streak` | `member_progress.currentStreak` | Streak login aktif (hari) |
| `level` | `member_progress.level` | Level anggota (1–20+) |
| `rankName` | Dihitung dari `level` | Perunggu / Perak / Emas / Platinum / Legenda |
| `weeklyStreakDays` | Dihitung dari `lastActivityDate` + `streak` | Peta streak Senin–Minggu |
| `userWinRate` | `getWinRate()` atau kueri battle aktif | Persentase kemenangan battle |
| `missions` | `getActiveQuests()` | Misi harian & mingguan |
| `historyList` | `getBattleHistory()` | Rekam riwayat pertempuran sebelumnya |
| `activeBattle` | `getArenaData()` | Detail battle mingguan yang sedang berjalan |
| `activeProposals` | `getGovernanceData()` | Agenda voting proposal E-RAT aktif |
| `earnedBadges` | `getMemberBadges()` | Lencana yang diraih oleh anggota |
| `simpananPokok` / `Wajib` / `Sukarela` | `getFinancialsData()` | Rincian detail simpanan finansial |

---

## 🚀 Menjalankan Secara Lokal

### 1. Prasyarat

Pastikan Anda memiliki [Flutter SDK](https://docs.flutter.dev/get-started/install) (versi 3.27+, Dart 3.6+) dan emulator (Android/iOS) atau browser Chrome siap pakai.

### 2. Instalasi Dependensi

```bash
flutter pub get
```

### 3. Menjalankan Aplikasi

```bash
# Web (Utama untuk keperluan demo hackathon)
flutter run -d chrome --web-port 3001 --web-hostname localhost

# Android emulator / perangkat fisik
flutter run -d android

# iOS simulator (Khusus macOS)
flutter run -d ios
```

> **Catatan:** Aplikasi Flutter mencari backend Next.js di `http://localhost:3000`. Jika Anda menguji melalui emulator perangkat mobile fisik, ubah base URL ke alamat IP LAN komputer Anda (misal: `http://192.168.1.10:3000`).

### 4. Format & Analisis Kode

```bash
dart format lib test                  # Menerapkan pemformatan kode Dart kanonikal
flutter analyze                       # Menjalankan analisis statis kode
```

---

## 📦 Membangun Paket APK

```bash
# Debug APK (~140 MB)
flutter build apk --debug

# Release APK (~51 MB)
flutter build apk --release

# Per-ABI APK (dipisah berdasarkan prosesor target, ~20 MB masing-masing)
flutter build apk --split-per-abi --release
```

---

## 🧪 Pengujian (Testing)

```bash
flutter test                          # Menjalankan 65 uji unit dan widget
flutter analyze                       # static analysis
dart format --output=none --set-exit-if-changed lib test   # CI lint check
```

---

## 📝 Versi Dependensi yang Dikunci

File `mobile/pubspec.yaml` mengunci beberapa dependensi ke versi lama agar sesuai dengan SDK Flutter 3.27.x (Dart 3.6.0) yang digunakan oleh runner CI GitHub Actions:

```yaml
flutter_lints: ^5.0.0   # ^6.0.0 memerlukan Dart >=3.8.0
shared_preferences: ^2.5.3   # ^2.5.5 memerlukan Dart >=3.9.0
```
