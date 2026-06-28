# ?? Handoff Document — HackathonKopdes

> Last updated: 2026-06-28
> Branch merged to `main` ?

---

## ?? Project Overview

**HackathonKopdes** is a digital cooperative management platform built for Indonesian village cooperatives (*Koperasi Merah Putih Desa*). It consists of two apps sharing the same backend:

| App | Tech Stack | Port |
|-----|-----------|------|
| **Desktop Web App** | Next.js 14 (App Router), TypeScript, Drizzle ORM, Supabase Auth | `3000` |
| **Mobile App** | Flutter (Web target), Dart, Provider state management | `3001` |

The backend database is **PostgreSQL via Supabase**, with Drizzle ORM handling all queries.

---

## ?? Repository Structure

```
HackathonKopdes/
+-- desktop/                    # Next.js web application
¦   +-- src/
¦   ¦   +-- actions/            # Server-side DB actions (no raw SQL in components)
¦   ¦   ¦   +-- arena.ts        # Battle system: active battles, history
¦   ¦   ¦   +-- auth.ts         # Supabase auth helpers
¦   ¦   ¦   +-- dashboard.ts    # Member progress & point transactions
¦   ¦   ¦   +-- financials.ts   # Savings, loans, dues
¦   ¦   ¦   +-- gamification.ts # Shop items, win rate, member badges
¦   ¦   ¦   +-- governance.ts   # Proposals, votes, koperasi stats
¦   ¦   ¦   +-- members.ts      # Member profile lookups
¦   ¦   ¦   +-- quests.ts       # Quest definitions & member progress
¦   ¦   ¦   +-- shop.ts         # Item purchase & use logic
¦   ¦   +-- app/
¦   ¦   ¦   +-- (auth)/         # Public auth pages
¦   ¦   ¦   ¦   +-- signin/     # Login page
¦   ¦   ¦   ¦   +-- signup/     # Registration page
¦   ¦   ¦   +-- (dashboard)/    # Protected pages (require auth)
¦   ¦   ¦   ¦   +-- page.tsx    # Home dashboard
¦   ¦   ¦   ¦   +-- arena/      # Battle arena
¦   ¦   ¦   ¦   +-- governance/ # E-RAT voting & koperasi stats
¦   ¦   ¦   ¦   +-- profile/    # Member profile
¦   ¦   ¦   ¦   +-- quests/     # Mission center & item shop
¦   ¦   ¦   +-- api/            # REST API endpoints (for mobile)
¦   ¦   ¦       +-- auth/
¦   ¦   ¦       ¦   +-- login/route.ts    # POST /api/auth/login
¦   ¦   ¦       ¦   +-- signup/route.ts   # POST /api/auth/signup
¦   ¦   ¦       +-- mobile-sync/
¦   ¦   ¦           +-- route.ts          # GET /api/mobile-sync (main data fetch)
¦   ¦   ¦           +-- action/route.ts   # POST /api/mobile-sync/action (writes)
¦   ¦   +-- db/
¦   ¦   ¦   +-- schema/         # Drizzle ORM table definitions
¦   ¦   ¦       +-- users.ts         # Supabase auth users mirror
¦   ¦   ¦       +-- members.ts       # Member profiles (NIK, name, koperasi)
¦   ¦   ¦       +-- gamification.ts  # member_progress, items, member_items, point_transactions
¦   ¦   ¦       +-- achievements.ts  # badges, member_badges, quests, member_quests
¦   ¦   ¦       +-- activities.ts    # battles table
¦   ¦   ¦       +-- financials.ts    # savings, loans, dues
¦   ¦   ¦       +-- governance.ts    # proposals, votes
¦   ¦   ¦       +-- cooperatives.ts  # cooperative entity
¦   ¦   +-- components/
¦   ¦   ¦   +-- layout/Sidebar.tsx   # Navigation sidebar
¦   ¦   ¦   +-- MissionList.tsx      # Reusable mission list component
¦   ¦   +-- utils/supabase/
¦   ¦   ¦   +-- client-api.ts        # Supabase client for API routes (JWT token auth)
¦   ¦   +-- proxy.ts                 # Next.js middleware - auth guard (excludes /api/*)
¦   +-- .env.local                   # Environment variables (not committed)
¦
+-- mobile/                     # Flutter mobile web app
    +-- lib/
        +-- main.dart            # App entry, MaterialApp, Provider setup, navigation
        +-- models/
        ¦   +-- mission.dart     # Mission model
        ¦   +-- shop_item.dart   # ShopItem model
        ¦   +-- history_item.dart # Battle history item model
        +-- providers/
        ¦   +-- koperasi_provider.dart  # Central state (ChangeNotifier)
        +-- views/
            +-- login_view.dart  # Sign-in form
            +-- signup_view.dart # Sign-up form
            +-- home_view.dart   # Dashboard: savings, points, missions, coop stats
            +-- misi_view.dart   # Mission center, streak calendar, item shop
            +-- battle_view.dart # Arena: active battle, history
            +-- koperasi_view.dart # Koperasi stats, e-RAT voting, timeline
            +-- profile_view.dart  # Profile, rank, badges, impact stats
```

---

## ?? Architecture

```
+-------------------------------------------------------------+
¦                    Supabase (PostgreSQL)                     ¦
¦  users · members · member_progress · savings · loans · dues ¦
¦  battles · quests · member_quests · badges · member_badges  ¦
¦  proposals · votes · items · member_items · point_tx        ¦
+-------------------------------------------------------------+
                      ¦  Drizzle ORM
         +------------?------------+
         ¦   Next.js (port 3000)   ¦
         ¦  +-----------------+   ¦
         ¦  ¦  Server Actions  ¦   ¦  ? Web pages use these directly
         ¦  +-----------------+   ¦
         ¦           ¦             ¦
         ¦  +--------?--------+   ¦
         ¦  ¦   REST API      ¦   ¦  ? Mobile app uses these via HTTP
         ¦  ¦ /api/mobile-sync¦   ¦
         ¦  ¦ /api/auth/*     ¦   ¦
         ¦  +-----------------+   ¦
         +-------------------------+
                      ¦ HTTP + JWT Bearer token
         +------------?------------+
         ¦  Flutter App (port 3001) ¦
         ¦  KoperasiProvider        ¦
         ¦  (ChangeNotifier)        ¦
         +-------------------------+
```

---

## ?? API Reference

### Authentication

| Endpoint | Method | Body | Returns |
|----------|--------|------|---------|
| `/api/auth/login` | POST | `{ email, password }` | `{ token, memberId, fullName, email }` |
| `/api/auth/signup` | POST | `{ email, password, namaLengkap, nik, ... }` | `{ token, memberId, fullName, email }` |

### Mobile Data Sync

| Endpoint | Method | Auth | Returns |
|----------|--------|------|---------|
| `/api/mobile-sync` | GET | `Bearer <token>` | Full user data bundle |
| `/api/mobile-sync/action` | POST | `Bearer <token>` | Write-back for quests, votes, shop |

#### GET /api/mobile-sync Response Shape

```json
{
  "success": true,
  "data": {
    "dashboard": {
      "progress": {
        "pointsBalance": 1350,
        "currentStreak": 7,
        "level": 3,
        "lastActivityDate": "2026-06-28T00:00:00Z",
        "longestStreak": 14
      },
      "transactions": [],
      "level": 3
    },
    "financials": {
      "savings": [],
      "loans": [],
      "dues": [],
      "simpananPokok": 750000,
      "simpananWajib": 750000,
      "simpananSukarela": 7254000
    },
    "quests": [
      { "id": 1, "title": "...", "rewardPoints": 50, "category": "daily", "progress": { "isCompleted": false } }
    ],
    "governance": {
      "activeProposals": [{ "id": 1, "title": "...", "status": "active" }],
      "totalMembers": 120,
      "totalAsetDesa": 84000000
    },
    "arena": {
      "activeBattles": [
        {
          "id": 1, "challengerId": 1, "opponentId": 2,
          "challengerPoints": 8200, "opponentPoints": 7500,
          "endDate": "2026-06-29T23:59:00Z",
          "opponent": { "namaLengkap": "Budi Santoso" }
        }
      ],
      "pastBattles": []
    },
    "koperasiStats": {
      "transaksi": 37, "anggotaBaru": 8, "omzetHarian": 0, "umkmAktif": 0
    },
    "badges": [{ "id": 1, "name": "...", "description": "...", "earnedAt": "..." }],
    "winRate": { "winRate": 62.5, "totalBattles": 8 }
  }
}
```

#### POST /api/mobile-sync/action Body

```json
{ "action": "complete_quest", "questId": 1 }
{ "action": "cast_vote", "proposalId": 1, "vote": "Setuju" }
{ "action": "purchase_item", "itemId": 1 }
{ "action": "use_item", "itemId": 1 }
```

---

## ?? Database Schema Summary

| Table | Purpose |
|-------|---------|
| `users` | Supabase auth users (UUID) |
| `members` | Member profile: NIK, nama, koperasi, nomor anggota |
| `member_progress` | Level, XP, points balance, streak, lastActivityDate |
| `point_transactions` | History of points earned/spent |
| `savings` | Deposit/withdrawal transactions |
| `loans` | Loan records |
| `dues` | Simpanan pokok & wajib payments |
| `battles` | Battle records: challenger, opponent, scores, winner, status |
| `quests` | Quest definitions (daily/weekly/one-time) |
| `member_quests` | Per-member quest progress & completion |
| `items` | Shop items (booster effects) |
| `member_items` | Member-owned items & quantities |
| `badges` | Badge definitions (requirement type/value) |
| `member_badges` | Earned badges per member |
| `proposals` | Governance proposals (E-RAT agendas) |
| `votes` | Member votes on proposals |

---

## ?? Mobile App — State Management

All state lives in `KoperasiProvider` (ChangeNotifier).

### Key State Fields

| Field | Source | Description |
|-------|--------|-------------|
| `points` | `member_progress.pointsBalance` | Current point balance |
| `streak` | `member_progress.currentStreak` | Active login streak (days) |
| `level` | `member_progress.level` | Member level (1–20+) |
| `rankName` | Computed from `level` | Perunggu / Perak / Emas / Platinum / Legenda |
| `weeklyStreakDays` | Computed from `lastActivityDate` + `streak` | Mon–Sun streak map |
| `userWinRate` | `getWinRate()` or active battle scores | % win rate |
| `missions` | `getActiveQuests()` | Daily & weekly missions |
| `historyList` | `getBattleHistory()` | Past battle records |
| `activeBattle` | `getArenaData()` | Current ongoing battle |
| `activeProposals` | `getGovernanceData()` | E-RAT active agenda |
| `earnedBadges` | `getMemberBadges()` | Badges earned by user |
| `simpananPokok/Wajib/Sukarela` | `getFinancialsData()` | Savings breakdown |

### Rank Tier System

| Rank | Required Level |
|------|---------------|
| Perunggu | 1–2 |
| Perak | 3–5 |
| Emas | 6–9 |
| Platinum | 10–14 |
| Legenda | 15+ |

---

## ? Features Completed

### Desktop Web App
- [x] Sign-in / Sign-up with Supabase Auth
- [x] Dashboard: savings summary, point balance, rank, missions
- [x] Arena: active battle view, battle history
- [x] Governance: E-RAT voting (Setuju / Tolak / Abstain), proposal timeline
- [x] Quests: daily & weekly missions with point rewards, item shop
- [x] Profile: member card, progress stats

### Mobile App (Flutter)
- [x] Sign-in / Sign-up screens with Supabase Auth via REST API
- [x] JWT session persistence using `shared_preferences`
- [x] `GET /api/mobile-sync` — single endpoint for all data (parallel fetch with Promise.all)
- [x] `POST /api/mobile-sync/action` — write-back for quests, votes, shop
- [x] CORS fix: Next.js middleware bypasses `/api/*` routes so preflight OPTIONS succeeds
- [x] Home: savings total, point balance, rank (dynamic), daily missions, koperasi stats
- [x] Misi: rank label (dynamic), streak calendar (computed from DB), daily/weekly missions, shop
- [x] Battle: player names from DB, opponent from active battle, comparison rows from real data, end date from DB
- [x] Koperasi: stats cards from backend, E-RAT proposal title from active governance proposal
- [x] Profile: rank badge (dynamic), achievements from earned badges, impact cards from real data, rank progression UI

---

## ?? Environment Setup

### Required Env Vars (`desktop/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

### Running Locally

```bash
# Terminal 1 — Desktop (Next.js)
cd desktop
npm install
npm run dev          # http://localhost:3000

# Terminal 2 — Mobile (Flutter Web)
cd mobile
flutter pub get
flutter run -d chrome --web-port 3001 --web-hostname localhost
# http://localhost:3001
```

> The Flutter app expects the Next.js backend on `localhost:3000`. Both must run simultaneously.

---

## ?? Auth Flow (Mobile)

```
Mobile App                          Next.js API
    ¦                                    ¦
    +-- POST /api/auth/login -----------?¦
    ¦   { email, password }              +-- supabase.auth.signInWithPassword()
    ¦                                    +-- db.select(members).where(userId)
    ¦?-- { token, memberId, fullName } --¦
    ¦                                    ¦
    ¦   Save to SharedPreferences        ¦
    ¦   (token, memberId, email, name)   ¦
    ¦                                    ¦
    +-- GET /api/mobile-sync -----------?¦
    ¦   Authorization: Bearer <token>    +-- supabase.auth.getUser(token)
    ¦                                    +-- resolve memberId from members table
    ¦?-- { success: true, data: {...} } -¦-- 9x parallel DB queries (Promise.all)
```

---

## ?? Known Limitations

- **`koperasiStats.omzetHarian` and `umkmAktif`** always return `0` — not yet populated in DB. UI shows `'-'` fallback.
- **Streak calendar** is approximated: computed backward from `lastActivityDate` for N days. No per-day activity log exists.
- **Battle comparison rows** (opponent's missions, savings) always show `'-'` — opponent detail stats are not fetched.
- **`streakDays`** (old hardcoded map) removed from provider. Use `weeklyStreakDays` going forward.

---

## ?? Branch History

| Branch | Status |
|--------|--------|
| `main` | ? Production-ready, fully merged |
| `mobile` | Merged into main |
| `feature/auth` | Merged into main by team |
