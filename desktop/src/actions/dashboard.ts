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
