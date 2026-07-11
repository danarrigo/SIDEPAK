# KopDes — Web Dashboard & Backend API 💻

This is the **Next.js admin dashboard** (used by cooperative operators and staff) **plus the REST API** consumed by the Flutter mobile app. Both clients share the same Supabase (PostgreSQL) backend.

For the project overview, see the [root README](../README.md). For the Flutter client, see [mobile/README.md](../mobile/README.md).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React Server Components)
- **Language**: TypeScript (strict)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom *Dark Slate & Yellow* theme
- **Database**: PostgreSQL hosted on [Supabase](https://supabase.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: Supabase Auth (server-side session refresh + JWT for API routes)
- **Deployment**: Vercel (auto-deploy on push to `main`)

---

## ✨ Features

- **Web Dashboard**: monitor savings balances, complete daily quests, manage the P2P marketplace, and participate in the weekly **KopDes Arena** battles.
- **REST API for mobile**: provides JSON endpoints (`/api/auth/*`, `/api/mobile-sync/*`) consumed by the Flutter app via JWT bearer tokens. The API runs all DB queries server-side through Drizzle — no client-side Supabase credentials leak to the mobile app.

---

## 📂 Source structure

```
desktop/src/
├── actions/              # Server-side DB actions (called by RSC pages)
│   ├── arena.ts          # Active battles, history
│   ├── auth.ts           # Supabase auth helpers
│   ├── dashboard.ts      # Member progress, point transactions
│   ├── events.ts         # Events & attendance
│   ├── financials.ts     # Savings, loans, dues
│   ├── gamification.ts   # Items, win rate, badges, leaderboards
│   ├── governance.ts     # Proposals, votes, koperasi stats
│   ├── members.ts        # Member profile lookups
│   ├── quests.ts         # Quests and per-member progress
│   └── shop.ts           # Item purchase, marketplace listings
├── app/
│   ├── (auth)/           # Public: /signin, /signup
│   ├── (dashboard)/      # Authenticated pages (see below)
│   └── api/              # REST API for the Flutter app
│       ├── auth/
│       │   ├── login/route.ts        # POST  /api/auth/login
│       │   └── signup/route.ts       # POST  /api/auth/signup
│       └── mobile-sync/
│           ├── route.ts              # GET   /api/mobile-sync
│           └── action/route.ts       # POST  /api/mobile-sync/action
├── components/           # Shared UI (Sidebar, BottomNav, MissionList, AutoMatchmake, ...)
├── db/schema/            # Drizzle table definitions
├── utils/supabase/       # Supabase server/client helpers
└── proxy.ts              # Next.js middleware: auth guard (excludes /api/*)
```

---

## 🗺️ Pages (App Router)

| Route | Auth | Role | Purpose |
|---|---|---|---|
| `/signin` | Public | All | Email/password sign-in |
| `/signup` | Public | All | New member registration |
| `/` | Required | Member | Home dashboard (savings, points, rank, missions) |
| `/quests` | Required | Member | Mission center + item shop |
| `/arena` | Required | Member | Active battle, history, auto-matchmake |
| `/governance` | Required | Member | E-RAT voting, proposal timeline, koperasi stats |
| `/governance/members` | Required | Member | Member directory |
| `/marketplace` | Required | Member | P2P marketplace admin view |
| `/savings` | Required | Member | Savings, loans, dues detail |
| `/profile` | Required | Member | Member card, progress stats, badges |
| `/admin` | Required | Admin | Admin landing, financial statistics, pending cash-out approvals |
| `/admin/members` | Required | Admin | Cooperative member directory, approval logs, and member status editor |
| `/admin/governance` | Required | Admin | E-RAT Proposal creation and management panel |
| `/admin/health` | Required | Admin | SIDEPAK Health Score visual dashboard and dimension details |
| `/admin/health/methodology` | Required | Admin | Scientific explanation and methodology description for the Health Score model |
| `/admin/profile` | Required | Admin | Admin profile details and personal credentials management |

---

## 🚀 Running locally

### 1. Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project-id.supabase.co:6543/postgres
```

| Variable | Used by | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Public; safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Public; safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only (API routes, server actions) | Bypasses RLS — keep secret |
| `DATABASE_URL` | Drizzle (server only) | Direct Postgres connection string |

### 2. Install dependencies

```bash
npm install
```

### 3. Sync the database schema (optional)

If you need to push the Drizzle schema to your Supabase Postgres:

```bash
npx drizzle-kit push
```

To insert dummy data (seed):

```bash
npx tsx scripts/seed-quests.ts
```

> Seeding will wipe and refill certain tables — existing login sessions may be invalidated.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. (Optional) Run the mobile app in parallel

In a second terminal, run the Flutter app on port 3001:

```bash
cd ../mobile
flutter pub get
flutter run -d chrome --web-port 3001 --web-hostname localhost
```

The Flutter app calls the Next.js API at `http://localhost:3000/api/...` so both must be running.

---

## 🔌 API reference

The Flutter app talks to the Next.js backend REST API. All return JSON and set CORS headers so a Flutter web build (on a different port) can call them. See the [root README § API Reference](../README.md#api-reference) for full request/response shapes.

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/login` | POST | — | Email/password sign-in → returns Supabase JWT + member profile |
| `/api/auth/signup` | POST | — | Register a new member → returns Supabase JWT + member profile |
| `/api/mobile-sync` | GET | `Bearer <token>` | Single bundle of all member data (9 parallel Drizzle queries) |
| `/api/mobile-sync/action` | POST | `Bearer <token>` | Write endpoint with discriminated `action` field |
| `/api/admin-member` | POST | `Bearer <token>` (Admin) | Updates a member's profile details (Admin role only) |
| `/api/withdraw` | POST | `Bearer <token>` | Initiates a digital wallet withdrawal request and creates Xendit payout |
| `/api/webhooks/xendit` | POST | — | Callback webhook receiver to update status of payouts from Xendit |
| `/api/delete-admin` | GET | — | Development utility endpoint to wipe admin profiles and progress |

### CORS handling

Every route exports an `OPTIONS()` handler that returns 204 with the required preflight headers. The Next.js middleware (`src/proxy.ts`) intentionally **excludes `/api/*`** from its auth-redirect matcher so that preflight requests are answered by the Route Handler rather than redirected to `/signin` (which would cause `Redirect is not allowed for a preflight request` errors).

---

## 🛡️ Auth guard (`src/proxy.ts`)

This is the Next.js middleware (using this version's `proxy` convention instead of `middleware.ts`):

- Refreshes the Supabase auth session cookie on every request.
- Redirects unauthenticated users to `/signin`.
- Redirects already-authenticated users away from `/signin` and `/signup`.
- Excludes `/api/*` (CORS preflight must be answered by the route, not redirected).

The matcher uses a negative lookahead:

```ts
'/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
```

---

## 🧪 Testing

```bash
npm test              # 50 Jest + React Testing Library tests
npm run lint          # ESLint
npx tsc --noEmit      # TypeScript strict check
```

All three must pass before a PR can be merged. CI runs them on every push to `main` (see `.github/workflows/desktop-ci.yml`).
