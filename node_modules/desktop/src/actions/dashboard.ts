"use server";
import { db } from "@/db";
import { memberProgress, pointTransactions } from "@/db/schema/gamification";
import { eq, desc } from "drizzle-orm";

export async function getDashboardData(memberId: number) {
  try {
    const [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    
    const transactions = await db.select()
      .from(pointTransactions)
      .where(eq(pointTransactions.memberId, memberId))
      .orderBy(desc(pointTransactions.createdAt))
      .limit(5);

    return { progress, transactions };
  } catch (error) {
    console.error("Dashboard DB Error:", error);
    return { progress: null, transactions: [] };
  }
}

/**
 * Records the member's "activity" for today and adjusts the streak counters.
 *
 * Called from the mobile-sync API route on every successful sync, so the
 * streak reflects the user actually opening the app each day. Without this,
 * a freshly-registered member who never completes a quest / deposit / event
 * would see currentStreak=0 forever (the bug reported in commit cb7b9d1).
 *
 * Streak rules (UTC, normalized to midnight):
 *   - lastActivityDate == today            -> no-op (already counted today)
 *   - lastActivityDate == yesterday        -> streak += 1
 *   - lastActivityDate older or null      -> streak = 1 (reset, fresh start)
 * In all "update" branches, lastActivityDate := today and longestStreak is
 * bumped if the new streak exceeds it.
 */
export async function updateStreakOnActivity(memberId: number) {
  try {
    const [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    
    const now = new Date();
    // Use WIB (UTC+7) for streak calculation
    const wibNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const todayWib = new Date(
      Date.UTC(wibNow.getUTCFullYear(), wibNow.getUTCMonth(), wibNow.getUTCDate())
    );
    const yesterdayWib = new Date(todayWib);
    yesterdayWib.setUTCDate(yesterdayWib.getUTCDate() - 1);

    const lastActivity = progress?.lastActivityDate
      ? new Date(progress.lastActivityDate)
      : null;
    let lastActivityWib: Date | null = null;
    
    if (lastActivity) {
      // Treat the stored lastActivityDate as UTC since that's how we save it below
      lastActivityWib = new Date(
        Date.UTC(
          lastActivity.getUTCFullYear(),
          lastActivity.getUTCMonth(),
          lastActivity.getUTCDate()
        )
      );
    }

    // Already counted today — no-op
    if (lastActivityWib && lastActivityWib.getTime() === todayWib.getTime()) {
      return;
    }

    let newStreak: number;
    if (lastActivityWib && lastActivityWib.getTime() === yesterdayWib.getTime()) {
      newStreak = (progress?.currentStreak ?? 0) + 1;
    } else {
      newStreak = 1;
    }

    const newLongest = Math.max(progress?.longestStreak ?? 0, newStreak);

    if (!progress) {
      await db.insert(memberProgress).values({
        memberId,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActivityDate: todayWib,
        updatedAt: now,
      });
    } else {
      await db
        .update(memberProgress)
        .set({
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActivityDate: todayWib,
          updatedAt: now,
        })
        .where(eq(memberProgress.id, progress.id));
    }
  } catch (error) {
    // Streak update is best-effort — never fail the sync because of this.
    console.error("updateStreakOnActivity DB Error:", error);
  }
}
