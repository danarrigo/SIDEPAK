# KopDes — Mobile App 📱

A Flutter client for the KopDes cooperative platform. A **single codebase** that builds for **web (Chrome/Safari/Firefox)**, **Android (APK)**, and **iOS**. The web build is the primary target for the hackathon demo; the Android APK is for field testing on actual phones.

For the project overview, see the [root README](../README.md). For the Next.js backend, see [desktop/README.md](../desktop/README.md).

---

## 🛠️ Tech Stack

- **Framework**: [Flutter](https://flutter.dev/) (Dart 3.6, Flutter 3.27+)
- **State management**: [`provider`](https://pub.dev/packages/provider) — single `KoperasiProvider` (`ChangeNotifier`) holds all app state
- **UI/UX**: Custom *Dark Slate & Yellow* theme matching the web dashboard
- **HTTP**: Dart `http` package against the Next.js REST API
- **Persistence**: `shared_preferences` (pinned to `^2.5.3` for Dart 3.6.0 compat) — stores the JWT
- **Backend integration**: Next.js REST endpoints at `/api/auth/*` and `/api/mobile-sync/*` (no direct Supabase access from the app)

---

## ✨ Features

- **Pocket dashboard** — savings total, point balance, rank badge, daily missions at a glance
- **KopDes Arena (mobile)** — animated battle view, weekly progress bar, battle history
- **Mission center** — daily/weekly quests, item shop, weekly streak calendar (Mon–Sun)
- **Marketplace** — browse P2P listings, list your own items, buy/spend points
- **Governance (E-RAT)** — vote on proposals (Setuju / Tolak / Abstain), view timeline
- **SIDEPAK Health Score (mobile)** — visual breakdown of the cooperative's health dimensions directly inside the member app
- **Admin Mode** — mobile views for administrators to inspect financial statistics and approve pending member deposit or withdrawal requests
- **Real-time sync** — all data is fetched from `/api/mobile-sync` (single bundle, 9 parallel Drizzle queries on the server), avoiding the Postgres pool exhaustion issues that plagued earlier split-fetch implementations

---

## 📂 Source structure

```
mobile/lib/
├── main.dart                       # App entry, MaterialApp, Provider setup, routing
├── models/
│   ├── mission.dart                # Quest / mission model
│   ├── shop_item.dart              # Marketplace item model
│   └── history_item.dart           # Battle history entry model
├── providers/
│   └── koperasi_provider.dart      # Central ChangeNotifier (all state + API calls)
└── views/
    ├── login_view.dart
    ├── signup_view.dart
    ├── home_view.dart              # Dashboard: savings, points, missions, coop stats
    ├── misi_view.dart              # Mission center, streak calendar, item shop
    ├── battle_view.dart            # Arena: active battle, history
    ├── koperasi_view.dart          # Koperasi stats, E-RAT voting, timeline
    ├── profile_view.dart           # Profile, rank, badges, impact stats
    ├── marketplace_view.dart       # P2P marketplace
    ├── events_view.dart            # Community events
    ├── members_directory_view.dart # Member directory
    ├── member_detail_view.dart     # Member detail
    ├── simpanan_view.dart          # Savings detail (Pokok / Wajib / Sukarela)
    └── widgets/
        ├── create_event_form.dart
        ├── leaderboard_section.dart
        ├── marketplace_list_form.dart
        └── prank_overlay.dart
```

---

## 🗺️ Screens

| Screen | Audience | Purpose |
|---|---|---|
| **Login** | All | Email/password sign-in; persists JWT to `shared_preferences` |
| **Sign Up** | All | New member registration (NIK, nama lengkap, …) |
| **Onboarding** | All | Onboarding carousel introducing the cooperative concept and application features |
| **Home** | Member | Savings total, point balance, current rank badge, daily missions, koperasi stats |
| **Misi (Missions)** | Member | Rank label, weekly streak calendar (Mon–Sun), daily/weekly missions, item shop |
| **Battle (Arena)** | Member | Active battle vs auto-matched opponent, comparison rows, end date countdown, history |
| **Koperasi** | Member | Stats cards (transaksi, anggota baru, omzet harian, UMKM aktif), E-RAT proposal voting, timeline |
| **Profile** | Member | Rank badge, earned badges, impact cards (savings, battles won, events joined), rank progression meter |
| **Health Score** | Member | View of the cooperative's health dimensions (dues compliance, digital penetration, governance, etc.) |
| **Marketplace** | Member | P2P marketplace: browse items, list own items, buy/spend points |
| **Events** | Member | Community events list, join event, create event form |
| **Members Directory** | Member | Browse all members, view individual member detail |
| **Simpanan** | Member | Detailed savings breakdown (Pokok, Wajib, Sukarela) |
| **Admin Dashboard** | Admin | Operational metrics summary, cooperative balances, and pending deposit/withdrawal lists |
| **Admin Members** | Admin | Operator view of all members and their registration statuses |
| **Admin Profile** | Admin | Admin credentials settings and profile overview |

---

## 🧠 State management

All client state lives in a single `KoperasiProvider` (`ChangeNotifier`). The provider is the only place that calls the REST API; views read from it via `Provider.of<KoperasiProvider>(context)` or `context.watch`.

| Field | Backend source | Description |
|---|---|---|
| `points` | `member_progress.pointsBalance` | Current point balance |
| `streak` | `member_progress.currentStreak` | Active login streak (days) |
| `level` | `member_progress.level` | Member level (1–20+) |
| `rankName` | Computed from `level` | Perunggu / Perak / Emas / Platinum / Legenda |
| `weeklyStreakDays` | Computed from `lastActivityDate` + `streak` | Mon–Sun streak map |
| `userWinRate` | `getWinRate()` or active battle scores | Win rate percentage |
| `missions` | `getActiveQuests()` | Daily & weekly missions |
| `historyList` | `getBattleHistory()` | Past battle records |
| `activeBattle` | `getArenaData()` | Current ongoing battle |
| `activeProposals` | `getGovernanceData()` | E-RAT active agenda |
| `earnedBadges` | `getMemberBadges()` | Badges earned by user |
| `simpananPokok` / `Wajib` / `Sukarela` | `getFinancialsData()` | Savings breakdown |

### Rank tier system

| Rank | Required level |
|---|---|
| Perunggu (Bronze) | 1–2 |
| Perak (Silver) | 3–5 |
| Emas (Gold) | 6–9 |
| Platinum | 10–14 |
| Legenda (Legend) | 15+ |

### Auth flow

```
Mobile App                          Next.js API
    │                                    │
    ├── POST /api/auth/login ──────────► │
    │   { email, password }              ├── supabase.auth.signInWithPassword()
    │                                    ├── db.select(members).where(userId)
    │ ◄── { token, memberId, fullName } ─┤
    │                                    │
    │   Save to SharedPreferences        │
    │   (token, memberId, email, name)   │
    │                                    │
    ├── GET /api/mobile-sync ──────────► │
    │   Authorization: Bearer <token>    ├── supabase.auth.getUser(token)
    │                                    ├── resolve memberId from members table
    │ ◄── { success, data: {...} } ──────┤── 9 parallel Drizzle queries
```

The JWT is read back from `shared_preferences` on app launch; if it is still valid, the login screen is skipped.

---

## 🚀 Running locally

### 1. Prerequisites

Install [Flutter SDK](https://docs.flutter.dev/get-started/install) (3.27+, Dart 3.6+) and have an active emulator (Android/iOS) or a connected physical device.

### 2. Install dependencies

```bash
flutter pub get
```

### 3. Run the app

```bash
# Web (default for hackathon demo)
flutter run -d chrome --web-port 3001 --web-hostname localhost

# Android emulator / device
flutter run -d android

# iOS simulator (macOS only)
flutter run -d ios
```

> The Flutter app expects the Next.js backend on `http://localhost:3000`. If you have trouble connecting to `localhost` from a mobile device, point the base URL to your machine's LAN IP (e.g. `http://192.168.1.10:3000`) — but for the hackathon demo the Vercel-deployed backend works without any local setup.

### 4. Format & analyze

```bash
dart format lib test                  # apply canonical Dart formatting
flutter analyze                       # static analysis (must be clean)
```

---

## 📦 Building the APK

```bash
# Debug APK (single fat APK, ~140 MB, all ABIs)
flutter build apk --debug
# → build/app/outputs/flutter-apk/app-debug.apk

# Release APK (single fat APK, ~51 MB, tree-shaken icons, debug-signed)
flutter build apk --release
# → build/app/outputs/flutter-apk/app-release.apk

# Per-ABI APKs (smaller, ~20 MB each — better for distribution)
flutter build apk --split-per-abi --release
# → build/app/outputs/flutter-apk/app-arm64-v8a-release.apk
# → build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk
# → build/app/outputs/flutter-apk/app-x86_64-release.apk

# App Bundle for Play Store
flutter build appbundle --release
# → build/app/outputs/bundle/release/app-release.aab
```

> **Signing for production:** the release APK above is signed with Flutter's default debug key. Before uploading to the Play Store, generate an upload keystore and configure `android/app/build.gradle.kts` to use it. See the Flutter docs on [app signing](https://docs.flutter.dev/deployment/android#signing-the-app).

---

## 🧪 Testing

```bash
flutter test                          # 65 widget + unit tests
flutter analyze                       # static analysis
dart format --output=none --set-exit-if-changed lib test   # CI formatting gate
```

All three must pass before a PR can be merged. CI runs them on every push to `main` (see `.github/workflows/mobile-ci.yml`).

---

## 📝 Package version pins

`mobile/pubspec.yaml` deliberately pins a few packages below their latest major versions to match the CI's Flutter 3.27.x (Dart 3.6.0) toolchain:

```yaml
flutter_lints: ^5.0.0   # ^6.0.0 needs Dart >=3.8.0
shared_preferences: ^2.5.3   # ^2.5.5 needs Dart >=3.9.0
```

Bump them once the CI runner is upgraded to Flutter 3.34+ (Dart 3.9+).
