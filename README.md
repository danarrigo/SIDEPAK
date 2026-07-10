# SIDEPAK — Gamified Village Cooperative Platform

> SIDEPAK — Digital cooperative management for Indonesian *Koperasi Merah Putih Desa* (village cooperatives).
> A monorepo with **two apps sharing one Supabase (PostgreSQL) backend**: a Next.js admin dashboard and a Flutter web/mobile app for members.

---

## Table of Contents

- [What is SIDEPAK?](#what-is-SIDEPAK)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [The Two Apps](#the-two-apps)
- [Architecture](#architecture)
- [Core Domain Model](#core-domain-model)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Quick Start](#quick-start)
- [Building the Mobile APK](#building-the-mobile-apk)
- [CI/CD](#cicd)
- [Testing](#testing)
- [Project Scripts](#project-scripts)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)

---

## What is SIDEPAK?

**SIDEPAK (Koperasi Digital)** is a modern Indonesian village cooperative platform that integrates traditional financial services with **gamification**, a **member-to-member marketplace**, and **community engagement**. It is built to make cooperative participation feel as engaging as a mobile game, while keeping all the rigour of real accounting, savings, loans, and member governance.

The platform targets *Koperasi Merah Putih Desa* — the village-level cooperatives that are the backbone of rural Indonesian community finance. Two clients share the same Supabase (PostgreSQL) backend:

| Client | Audience | Purpose |
|---|---|---|
| **Desktop Admin Dashboard** (`desktop/`) | Cooperative operators, staff | Manage members, view transactions, create events, monitor governance, see analytics |
| **Member Web/Mobile App** (`mobile/`) | Cooperative members | View their savings, points, missions, marketplace, battles, profile |

See per-app guides for setup details:
- [Desktop Web Dashboard & API guide](./desktop/README.md)
- [Mobile (Flutter) guide](./mobile/README.md)

---

## Key Features

- **Digital financial services** — Savings (*Simpanan Pokok, Wajib, Sukarela*) and Loans (*Pinjaman*) tracked with full audit trail.
- **SIDEPAK Arena — gamification layer**
  - Complete **Daily Quests** to earn points (fully integrated with real app actions like savings, logins, and events).
  - Maintain a **Login Streak** for bonus rewards.
  - Compete in **Weekly Arena Battles** against other members (auto-matched).
- **Member-to-member marketplace** — Spend points to list and buy items in a P2P marketplace with optional item effects (e.g. `freeze_streak`, `prank`).
- **Cooperative governance (E-RAT)** — Members vote on proposals (*Setuju / Tolak / Abstain*); proposals resolve by quorum.
- **Multi-platform** — Desktop admin in Next.js, member app in Flutter (web + Android APK + iOS).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop dashboard | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Member app | Flutter, Dart 3.6 (web + Android + iOS) |
| Mobile state | `provider` (ChangeNotifier pattern) |
| Database | PostgreSQL via Supabase |
| ORM | Drizzle ORM |
| Auth | Supabase Auth (email/password, JWT) |
| API style | Next.js Server Actions (web) + REST Route Handlers (mobile) |
| Deployment | Google Cloud Run (Next.js) + Vercel (Flutter web) |
| Mobile packaging | Gradle / Android SDK (APK), Xcode (iOS) |
| CI | GitHub Actions |

---

## Repository Structure

```
SIDEPAK/
├── desktop/                          # Next.js admin dashboard
│   ├── src/
│   │   ├── actions/                  # Server-side DB actions (no raw SQL in components)
│   │   │   ├── arena.ts              # Battles: active + history
│   │   │   ├── auth.ts               # Supabase auth helpers
│   │   │   ├── dashboard.ts          # Member progress, point transactions
│   │   │   ├── events.ts             # Events & attendance
│   │   │   ├── financials.ts         # Savings, loans, dues
│   │   │   ├── gamification.ts       # Shop items, win rate, badges, leaderboards
│   │   │   ├── governance.ts         # Proposals, votes, koperasi stats
│   │   │   ├── members.ts            # Member profile lookups
│   │   │   ├── quests.ts             # Quests and member progress
│   │   │   └── shop.ts               # Item purchase, marketplace listings
│   │   ├── app/
│   │   │   ├── (auth)/               # Public auth pages (signin, signup)
│   │   │   ├── (dashboard)/          # Authenticated pages
│   │   │   │   ├── page.tsx          # Home dashboard
│   │   │   │   ├── arena/            # Battle arena
│   │   │   │   ├── governance/       # E-RAT voting, koperasi stats, members
│   │   │   │   ├── marketplace/      # P2P marketplace admin view
│   │   │   │   ├── profile/          # Member profile
│   │   │   │   ├── quests/           # Mission center & item shop
│   │   │   │   └── savings/          # Savings/loans/dues detail
│   │   │   └── api/                  # REST API for mobile
│   │   │       ├── auth/{login,signup}/route.ts
│   │   │       └── mobile-sync/{route.ts, action/route.ts}
│   │   ├── components/               # Shared UI (Sidebar, MissionList, AutoMatchmake, ...)
│   │   ├── db/schema/                # Drizzle table definitions
│   │   ├── utils/supabase/           # Supabase server/client helpers
│   │   └── proxy.ts                  # Next.js middleware (auth guard; excludes /api/*)
│   └── package.json
│
├── mobile/                           # Flutter app (web + Android + iOS)
│   ├── lib/
│   │   ├── main.dart                 # App entry, MaterialApp, Provider setup
│   │   ├── models/                   # Mission, ShopItem, HistoryItem
│   │   ├── providers/
│   │   │   └── koperasi_provider.dart   # Central ChangeNotifier
│   │   └── views/                    # 13 screens + 4 widgets (see mobile/README.md)
│   ├── test/                         # 65 widget/unit tests
│   └── pubspec.yaml
│
├── .github/workflows/
│   ├── desktop-ci.yml                # Lint + tsc + jest
│   └── mobile-ci.yml                 # Dart format + analyze + test
│
├── package.json                      # Root workspace (cross-app scripts)
├── context.md                        # Domain model spec
└── handoff.md                        # Engineering handoff doc
```

---

## The Two Apps

### 1. Desktop Admin Dashboard (`desktop/`)

The Next.js admin dashboard is used by cooperative operators and staff. It uses **Server Actions** for almost all data access (no separate API layer needed for the web UI), except for the small REST surface used by the mobile app.

**Pages**

| Route | Auth | Purpose |
|---|---|---|
| `/signin` | Public | Email/password sign-in |
| `/signup` | Public | New member registration |
| `/` (home) | Required | Savings total, points, rank, daily missions, koperasi stats |
| `/quests` | Required | Mission center + item shop |
| `/arena` | Required | Active battle view, history, auto-matchmake controls |
| `/governance` | Required | E-RAT voting, proposal timeline, koperasi stats |
| `/governance/members` | Required | Member directory with detail drill-down |
| `/marketplace` | Required | P2P marketplace administration view |
| `/savings` | Required | Savings, loans, and dues records |
| `/profile` | Required | Member card, progress stats, badge collection |

See [desktop/README.md](./desktop/README.md) for full setup, env vars, and the API reference.

### 2. Member Web/Mobile App (`mobile/`)

A single Flutter codebase that builds for **web (Chrome/Safari/Firefox)**, **Android (APK)**, and **iOS**. The web build is the primary target for member access during the hackathon demo; the Android APK is for field testing on phones.

**Screens**

| Screen | Purpose |
|---|---|
| Login / Sign Up | Email/password auth; persists JWT to `shared_preferences` |
| Home | Savings total, point balance, rank badge, daily missions, koperasi stats |
| Misi (Missions) | Rank label, weekly streak calendar, daily/weekly missions, item shop |
| Battle (Arena) | Active battle vs auto-matched opponent, comparison rows, history |
| Koperasi | Stats cards, E-RAT proposal voting, timeline |
| Profile | Rank badge, earned badges, impact stats, rank progression |
| Marketplace | Browse items, list own items, buy/spend points |
| Events | Community events list, join, create |
| Members Directory | Browse members, view detail |
| Simpanan | Savings breakdown (Pokok, Wajib, Sukarela) |

The Flutter app **does not** talk directly to Supabase. It talks to the **Next.js REST API** (`/api/auth/*` and `/api/mobile-sync/*`), which proxies through to Supabase with correct server-side credentials. This gives centralized auth, request validation, and a single place to add rate limiting later.

See [mobile/README.md](./mobile/README.md) for screen details, state management, and APK build instructions.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Supabase (PostgreSQL)                     │
│  users · members · member_progress · savings · loans · dues  │
│  battles · quests · member_quests · badges · member_badges   │
│  proposals · votes · items · member_items · point_tx         │
└──────────────────────────────────────────────────────────────┘
                          ▲
                          │  Drizzle ORM
                          │
       ┌──────────────────┴────────────────────┐
       │   Next.js (port 3000, Vercel)         │
       │                                       │
       │  ┌─────────────────────────────────┐  │
       │  │  React Server Components        │  │  ← admin dashboard pages
       │  │  src/app/(dashboard)/...        │  │
       │  └────────────┬────────────────────┘  │
       │               │                       │
       │       src/actions/*.ts (Server       │
       │       Actions — typed DB helpers)     │
       │                                       │
       │  ┌─────────────────────────────────┐  │
       │  │  REST Route Handlers            │  │  ← consumed by Flutter
       │  │  /api/auth/login                │  │
       │  │  /api/auth/signup               │  │
       │  │  /api/mobile-sync    (GET)      │  │
       │  │  /api/mobile-sync/action (POST) │  │
       │  └─────────────────────────────────┘  │
       │                                       │
       │  src/proxy.ts — auth guard            │
       │  (excludes /api/* from redirect)      │
       └──────────────────┬────────────────────┘
                          │  HTTP + JWT Bearer
       ┌──────────────────┴────────────────────┐
       │   Flutter App (port 3001 web)         │
       │   KoperasiProvider (ChangeNotifier)   │
       │   → views/*                            │
       └───────────────────────────────────────┘
```

---

## Core Domain Model

### 1. Points & Marketplace

Members earn points from quests, battles, events, and financial activity. Points are spent in a **member-to-member (P2P) marketplace** — there is no admin-stocked shop. All items are listed by members themselves; other members buy with their point balance. Items may carry an effect (e.g. `freeze_streak`, `prank`).

### 2. Ranks & Levels

Members gain XP from activities, which raises their **level**. Ranks are derived from level thresholds (5 tiers: Perunggu, Perak, Emas, Platinum, Legenda). Members also maintain **streaks** (current + longest) for consecutive daily activity.

| Rank | Level range |
|---|---|
| Perunggu (Bronze) | 1–2 |
| Perak (Silver) | 3–5 |
| Emas (Gold) | 6–9 |
| Platinum | 10–14 |
| Legenda (Legend) | 15+ |

### 3. Events

Cooperative-organized community events that members can join for XP/points (e.g. trash pickup, community garden day, financial literacy workshop). Events are scoped to a cooperative and tracked via the `event_participants` join table.

### 4. Leaderboards

Six ranking dimensions, all scoped within a cooperative and filterable by weekly / monthly / all-time:

- Points
- Level / XP
- Events participated
- Battle win rate
- Savings deposited
- Current/longest streak

### 5. Quests (Daily & Weekly)

Daily quests reset every day (e.g. "Make a deposit"). Weekly quests span a week (e.g. "Save 50k this week"). Each quest has a target action type, target count, and a points reward. Progress is tracked per member in `member_quests`.

### 6. Battles (Weekly PvP)

Each week, the system **automatically pairs members** into 1v1 battles. Each player's points earned that week are tracked. When the week ends, the higher-scorer wins a bonus. **All members are auto-enrolled by default** — no opt-in toggle.

---

## Database Schema

| Table | Purpose |
|---|---|
| `users` | Supabase auth users (UUID) |
| `cooperatives` | Cooperative entity |
| `members` | Member profile (NIK, nama lengkap, koperasi, nomor anggota) |
| `member_progress` | Level, XP, points balance, current/longest streak, last activity date |
| `point_transactions` | History of points earned/spent (with source: `quest`, `battle`, `saving`, `loan`, `purchase`, `sale`, …) |
| `savings` | Deposit/withdrawal transactions |
| `loans` | Loan records (interest rate, status, due date) |
| `dues` | Simpanan pokok (one-time) + Simpanan wajib (monthly) |
| `battles` | Battle records (challenger, opponent, weekly scores, winner, status) |
| `quests` | Quest definitions (daily / weekly / one-time) |
| `member_quests` | Per-member quest progress and completion |
| `items` | Marketplace items (member-listed, with optional effect) |
| `member_items` | Member-owned items and quantities |
| `badges` | Badge definitions (requirement type + value) |
| `member_badges` | Earned badges per member |
| `proposals` | Governance proposals (E-RAT agendas) |
| `votes` | Member votes on proposals (Setuju / Tolak / Abstain) |
| `events` | Community events |
| `event_participants` | Per-member event attendance |

---

## API Reference

The Flutter app uses a small REST surface exported from `desktop/src/app/api/`. All four routes return JSON and set permissive CORS headers so the Flutter web build can call them from a different port during dev.

### `POST /api/auth/login`

```jsonc
// Request
{ "email": "user@example.com", "password": "••••••" }

// 200 OK
{
  "success": true,
  "token": "eyJhbGciOi...",     // Supabase JWT
  "memberId": 42,
  "email": "user@example.com",
  "fullName": "Andi Wijaya"
}
```

### `POST /api/auth/signup`

```jsonc
{
  "email": "user@example.com",
  "password": "••••••",
  "namaLengkap": "Andi Wijaya",
  "nik": "3201234567890001",
  "nomorAnggota": "AGT-0042",
  "cooperativeId": 1
}
```

### `GET /api/mobile-sync` (auth required)

`Authorization: Bearer <token>`

Returns a single bundle covering everything the member app needs in one round-trip. The handler runs **9 parallel Drizzle queries** via `Promise.all` to keep latency low.

```jsonc
{
  "success": true,
  "data": {
    "dashboard": {
      "progress": {
        "pointsBalance": 1350,
        "currentStreak": 7,
        "longestStreak": 14,
        "level": 3,
        "lastActivityDate": "2026-06-28T00:00:00Z"
      },
      "transactions": [],
      "level": 3
    },
    "financials": {
      "savings": [], "loans": [], "dues": [],
      "simpananPokok": 750000,
      "simpananWajib": 750000,
      "simpananSukarela": 7254000
    },
    "quests": [
      { "id": 1, "title": "Setor simpanan hari ini", "rewardPoints": 50,
        "category": "daily", "progress": { "isCompleted": false } }
    ],
    "governance": {
      "activeProposals": [{ "id": 1, "title": "...", "status": "active" }],
      "totalMembers": 120,
      "totalAsetDesa": 84000000
    },
    "arena": {
      "activeBattles": [
        { "id": 1, "challengerId": 1, "opponentId": 2,
          "challengerPoints": 8200, "opponentPoints": 7500,
          "endDate": "2026-06-29T23:59:00Z",
          "opponent": { "namaLengkap": "Budi Santoso" } }
      ],
      "pastBattles": []
    },
    "koperasiStats": { "transaksi": 37, "anggotaBaru": 8, "omzetHarian": 0, "umkmAktif": 0 },
    "badges": [{ "id": 1, "name": "Kolektor Teladan", "description": "...",
                 "earnedAt": "2026-06-01T00:00:00Z" }],
    "winRate": { "winRate": 62.5, "totalBattles": 8 },
    "leaderboard": { /* points, level, events, battles, savings, streaks */ },
    "storeItems": [ /* marketplace items */ ],
    "memberInventory": [ /* owned items */ ],
    "marketplaceItems": [ /* P2P listings */ ],
    "memberEventParticipations": [ /* joined events */ ],
    "activeMembers": [ /* directory */ ]
  }
}
```

### `POST /api/mobile-sync/action` (auth required)

`Authorization: Bearer <token>`

Single write endpoint with a discriminated `action` field. The server validates the payload, mutates the relevant tables via Drizzle, and returns the updated view fragment.

```jsonc
{ "action": "complete_quest", "questId": 1 }
{ "action": "cast_vote",     "proposalId": 1, "vote": "Setuju" }
{ "action": "purchase_item", "itemId": 1 }
{ "action": "use_item",      "itemId": 1 }
```

### CORS

All four API routes export an `OPTIONS()` handler that returns 204 with the required preflight headers. The Next.js middleware (`src/proxy.ts`) intentionally **excludes `/api/*`** from its auth-redirect matcher so that preflight requests are answered by the Route Handler rather than redirected to `/signin` (which would cause `Redirect is not allowed for a preflight request` errors).

---

## Quick Start

### Prerequisites

- **Node.js** 20+ and npm 10+ (for `desktop/`)
- **Flutter** 3.27+ with Dart 3.6+ (for `mobile/`)
- A **Supabase** project (free tier is fine) with the schema applied

### Clone & install

```bash
git clone https://github.com/danarrigo/SIDEPAK
cd SIDEPAK
npm install                       # installs root workspace (desktop only)
```

### Set up the desktop env

```bash
cp desktop/.env.example desktop/.env.local
# then fill in your Supabase creds (see desktop/README.md)
```

### Run both apps

```bash
# Terminal 1 — Desktop dashboard
cd desktop
npm run dev                       # http://localhost:3000

# Terminal 2 — Flutter web app
cd mobile
flutter pub get
flutter run -d chrome --web-port 3001 --web-hostname localhost
# → opens http://localhost:3001
```

> The Flutter app expects the Next.js backend on `localhost:3000`. Both must run simultaneously.

For per-app setup, env vars, and Supabase schema application, see:
- [desktop/README.md](./desktop/README.md)
- [mobile/README.md](./mobile/README.md)

---

## Building the Mobile APK

```bash
cd mobile
flutter pub get

# Debug APK (single fat APK, ~140 MB, all ABIs)
flutter build apk --debug

# Release APK (single fat APK, ~51 MB, tree-shaken icons, debug-signed)
flutter build apk --release

# Per-ABI APKs (smaller, ~20 MB each)
flutter build apk --split-per-abi --release

# App Bundle for Play Store
flutter build appbundle --release
```

> **Signing for production:** the release APK above is signed with Flutter's default debug key. Before uploading to the Play Store, generate an upload keystore and configure `android/app/build.gradle.kts` to use it.

---

## CI/CD

Two GitHub Actions workflows run on every push to `main`:

| Workflow | Triggers | Steps |
|---|---|---|
| `desktop-ci.yml` | Push to `main`, PRs touching `desktop/` | `npm ci` → `npm run lint` → `tsc --noEmit` → `jest` |
| `mobile-ci.yml` | Push to `main`, PRs touching `mobile/` | `flutter pub get` → `dart format --set-exit-if-changed` → `flutter analyze` → `flutter test` |

The `desktop/` app is deployed to **Google Cloud Run** using the provided `Dockerfile`. The Flutter web build is deployed to Vercel at `https://hackathon-SIDEPAK.vercel.app`.

---

## Testing

| Suite | Command | Count |
|---|---|---|
| Desktop (Jest + RTL) | `cd desktop && npm test` | 50 unit/integration tests |
| Mobile (Flutter) | `cd mobile && flutter test` | 65 widget/unit tests |

Both suites must pass before a PR can be merged. CI runs both on every push to `main`.

---

## Project Scripts

The root `package.json` provides cross-app wrappers (handy in CI runners):

```bash
npm run test:desktop      # cd desktop && npm test
npm run test:mobile       # cd mobile && flutter test
npm run lint:desktop      # cd desktop && npm run lint
npm run analyze:mobile    # cd mobile && flutter analyze
```

---

## Known Limitations

- **`koperasiStats.omzetHarian` and `umkmAktif`** always return `0` in `/api/mobile-sync` — not yet populated in the DB; the UI shows `'-'` as a fallback.
- **Streak calendar** is approximated by walking backward from `lastActivityDate` for N days. There is no per-day activity log yet.
- **Battle comparison rows** (opponent's missions, savings) currently show `'-'` — opponent detail stats aren't fetched in the sync bundle.
- **Release APK is debug-signed** by default; a production keystore is needed before publishing to the Play Store.
- **Pinned Flutter package versions** in `mobile/pubspec.yaml` (`shared_preferences: ^2.5.3`, `flutter_lints: ^5.0.0`) are deliberately held back to match the CI's Flutter 3.27.x (Dart 3.6.0) toolchain. Bump them once the CI runner is upgraded to Flutter 3.34+ (Dart 3.9+).

---

## Contributing

1. Branch off `main` (`git checkout -b feature/your-feature`).
2. Make your changes. Add or update tests.
3. Run `npm run test:desktop` and `npm run test:mobile` locally.
4. Run `cd mobile && dart format lib test` if you touched any Dart file.
5. Push your branch and open a PR — CI will run both test suites automatically.
6. Squash-merge once approved.

---

*Built with ❤️ for the advancement of Indonesian village cooperatives.*
