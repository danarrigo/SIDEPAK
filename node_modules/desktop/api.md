# API Documentation

This project uses Next.js Server Actions to securely communicate with the Supabase PostgreSQL database. All actions are located in the `src/actions/` directory and run exclusively on the server.

## Dashboard Data (`src/actions/dashboard.ts`)

### `getDashboardData(userId: number)`
Retrieves aggregated progress and stats for the dashboard.
- **Returns**: `{ progress: MemberProgress, stats: KoperasiStat }`
- **Usage**: Used in the main dashboard (`src/app/page.tsx`).

## Governance Data (`src/actions/governance.ts`)

### `getGovernanceData(userId: number)`
Retrieves voting proposals and active member counts.
- **Returns**: `{ proposals: Proposal[], memberCount: number, votingPower: number }`
- **Usage**: Used in the Governance tab (`src/app/governance/page.tsx`).

## Member Data (`src/actions/members.ts`)

### `getMemberData(userId: number)`
Retrieves details for a specific member.
- **Returns**: `User` object.
- **Usage**: Used for user profile display and naming throughout the app.

## Quests & Gamification (`src/actions/quests.ts`)

### `getActiveQuests(userId: number)`
Retrieves active daily and weekly quests for the user along with their progress.
- **Returns**: `(Quest & { progress?: MemberQuest })[]`
- **Usage**: Used in the Quests tab (`src/app/quests/page.tsx`).

## Financials (`src/actions/financials.ts`)

### `getFinancialsData(userId: number)`
Retrieves a user's active savings accounts, active loans, and cooperative dues.
- **Returns**: `{ savings: Saving[], loans: Loan[], dues: Dues[] }`
- **Usage**: Used in the Profile tab (`src/app/profile/page.tsx`).

## Arena (`src/actions/arena.ts`)

### `getArenaData(userId: number)`
Retrieves active battle/engagement scenarios.
- **Returns**: `{ battles: Battle[] }` (currently stubbed)
- **Usage**: Used in the Arena tab (`src/app/arena/page.tsx`).
