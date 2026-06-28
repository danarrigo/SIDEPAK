# KopDes — Gamified Cooperative (Koperasi) Platform

## Overview

KopDes is a **gamified cooperative management platform** that transforms the traditional Indonesian *Koperasi Desa* (Village Cooperative) experience into an engaging, game-like system. Members earn **points** and **XP** through financial activities, community events, and quests — making cooperative participation fun and rewarding.

The platform consists of a **Next.js desktop admin/dashboard** and a **Flutter mobile app** for members, backed by **Supabase (PostgreSQL)**.

---

## Core Systems

### 1. Points & Marketplace

Members earn points through quests, battles, events, and financial activities. Points can be spent in the **member marketplace**.

- The marketplace is **member-to-member (P2P)** — members list items, and only members can buy.
- There is **no admin-stocked shop**. All items are posted by members themselves.
- Items have a name, description, point price, and optionally an effect (e.g. `freeze_streak`, `prank`).
- Members can **buy items** from other members using their point balance.
- Members can **list their own items** for sale on the marketplace.
- Point transactions are logged with source tracking (`quest`, `battle`, `saving`, `loan`, `purchase`, `sale`, etc.).

### 2. Ranks & Levels

Members progress through a **rank system** based on their level.

- **XP** is earned from activities (quests, events, battles, financial actions).
- XP accumulates to increase a member's **level**.
- Ranks are derived from level thresholds (e.g. Level 1–5 = Bronze, 6–10 = Silver, etc.).
- Leveling up may unlock new shop items or features.
- Members maintain **streaks** (current + longest) for consecutive daily activity.

### 3. Events

Cooperative-organized community events that members can join.

- Events are **created by the cooperative** (admin) with a name, description, start/end date.
- Examples: trash pickup weekend, community garden day, financial literacy workshop.
- Members can **join events** to earn XP and/or points upon participation.
- Events are scoped to a specific cooperative.
- **Requires an `event_participants` table** to track which members joined which event and their attendance status.

### 4. Leaderboards

Multiple ranking systems to foster healthy competition across different dimensions.

| Leaderboard | Ranked By |
|---|---|
| **Points** | Total points earned |
| **Level / XP** | Member level and XP |
| **Events** | Number of events participated in |
| **Battles** | Battle win count / win rate |
| **Savings** | Total savings deposited |
| **Streaks** | Current or longest activity streak |

- Each leaderboard can be filtered by time period (weekly, monthly, all-time).
- Leaderboards are scoped **within a cooperative**.
- Drives engagement through social visibility and friendly competition.

### 5. Quests (Daily & Weekly)

Recurring challenges that encourage regular cooperative engagement.

- **Daily quests**: Small tasks reset each day (e.g. "Make a deposit", "Log in today").
- **Weekly quests**: Larger goals spanning a week (e.g. "Save 50k this week", "Join 1 event").
- Each quest has a **reward in points**, an **action type** (saving, borrowing, etc.), and a **target count**.
- Progress is tracked per member; completed quests are marked and timestamped.

### 6. Battles (Weekly PvP)

Weekly 1v1 competitions between members, **auto-matched by the system**.

- Each week, the system **automatically pairs members** into battles (no manual challenging).
- Each player's **points earned during that week** are tracked.
- At the end of the week, the player with more points **wins** and receives bonus points.
- Battle status: `ongoing` → `completed`, with a `winnerId` (null if draw).
- **All members are automatically enrolled** in weekly matchmaking by default (no opt-in toggle).

---

## Member Actions

| Action | Description |
|---|---|
| **Buy items** | Spend points to purchase items from the cooperative shop |
| **List items on marketplace** | Put personal items up for sale on the P2P marketplace |
| **Join events** | Participate in cooperative community events |
| **Save money (Simpanan)** | Deposit money into cooperative savings |
| **Borrow money (Pinjaman)** | Take out loans from the cooperative |
| **Pay monthly dues (Iuran)** | Mandatory monthly fee to maintain membership |
| **Complete quests** | Fulfill daily/weekly quest objectives for point rewards |
| **Battle other members** | Compete in weekly point battles against another member |
| **Vote on proposals** | Participate in cooperative governance by voting on proposals |

---

## Financial System

### Savings (Simpanan)
- Members deposit and withdraw money.
- Each transaction is recorded with type (`deposit` / `withdrawal`).

### Loans (Pinjaman)
- Members can borrow money from the cooperative.
- Loans have an interest rate, status (`pending` → `approved` → `paid` / `defaulted`), and due date.

### Dues (Iuran)
- **Monthly fee** (`iuran wajib`) — mandatory recurring payment.
- **Initial fee** (`iuran pokok`) — one-time membership registration fee.
- Tracked with `paid` / `unpaid` status.

---

## Governance

- **Proposals** are created by the cooperative with a title, description, quorum target, and voting window.
- Members cast **votes** (`agree`, `reject`, `abstain`).
- Proposals resolve as `passed` or `rejected` based on quorum and vote outcomes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop dashboard | Next.js (App Router) |
| Mobile app | Flutter |
| Database | PostgreSQL via Supabase |
| ORM | Drizzle ORM |
| Auth | Supabase Auth |

---

## Entity Relationships (Simplified)

```
User (auth)
 └── Member (profile, belongs to a Cooperative)
      ├── MemberProgress (level, xp, points, streak)
      ├── MemberItems (purchased items)
      ├── PointTransactions (point history)
      ├── MemberQuests (quest progress)
      ├── MemberBadges (earned badges)
      ├── Savings / Loans / Dues (financials)
      ├── Votes (governance participation)
      ├── Battles (auto-matched, as challenger or opponent)
      └── EventParticipants (event attendance)

Cooperative
 ├── Members
 ├── Events (with EventParticipants)
 └── Proposals

Marketplace
 └── Items (listed by members, bought by members)
```
