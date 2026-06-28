# KopDes - Mobile App 📱

Ini adalah aplikasi *mobile* untuk platform Koperasi Digital (KopDes). Aplikasi ini dirancang agar anggota koperasi dapat memantau aktivitas keuangan dan bermain (*gamification*) langsung dari *smartphone* mereka kapan saja, di mana saja.

## 🛠️ Tech Stack

- **Framework**: [Flutter](https://flutter.dev/) (Dart)
- **State Management**: Provider / Riverpod (atau bawaan Flutter).
- **UI/UX**: Desain kustom dengan tema *Dark Slate & Yellow*, mengikuti estetika *modern glassmorphism* yang sama dengan web.
- **Backend Integrasi**: Berkomunikasi langsung dengan *API Endpoint* Next.js (contoh: `/api/mobile-sync`) dan Supabase.

## ✨ Fitur Utama

- **Dashboard Genggaman**: Cek saldo tabungan dan progres misi langsung dari halaman utama.
- **KopDes Arena (Mobile)**: Animasi pertempuran dan *progress bar* mingguan yang terasa lebih hidup.
- **Sinkronisasi Real-Time**: Terhubung dengan rute `/api/mobile-sync` di web server untuk memastikan poin, status, dan data pengguna selalu akurat dan terhindar dari isu koneksi paralel (*pool exhaustion*).

## 🚀 Cara Menjalankan Secara Lokal

### 1. Persiapan Lingkungan

Pastikan Anda telah menginstal [Flutter SDK](https://docs.flutter.dev/get-started/install) dan memiliki *emulator* (Android/iOS) yang aktif atau perangkat fisik yang tersambung.

### 2. Instalasi Dependensi

Jalankan perintah berikut di dalam folder `mobile` untuk mengunduh semua *packages* yang diperlukan:

```bash
flutter pub get
```

### 3. Jalankan Aplikasi

Untuk menjalankan aplikasi dalam mode *debug*:

```bash
flutter run
```

*Jika Anda memiliki kendala sambungan ke localhost API web, pastikan Anda mengubah Base URL API di kode Dart untuk menunjuk ke IP lokal komputer Anda (bukan `localhost` atau `127.0.0.1`), atau arahkan langsung ke backend Vercel yang sudah di-*deploy*.*
