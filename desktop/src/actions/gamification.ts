"use server";
import { db } from "@/db";
import { items } from "@/db/schema/gamification";
import { memberBadges, badges } from "@/db/schema/achievements";
import { battles } from "@/db/schema/activities";
import { or, eq, and } from "drizzle-orm";

export async function getStoreItems() {
  try {
    const allItems = await db.select().from(items);
    return allItems;
  } catch (error) {
    console.error("Store Items Error:", error);
    return [];
  }
}

export async function getWinRate(memberId: number) {
  try {
    const pastBattles = await db.select().from(battles).where(
      and(
        or(
          eq(battles.challengerId, memberId),
          eq(battles.opponentId, memberId)
        ),
        eq(battles.status, 'completed')
      )
    );
    
    if (pastBattles.length === 0) return { winRate: 0, totalBattles: 0 };
    
    const wonBattles = pastBattles.filter(b => b.winnerId === memberId).length;
    const winRate = (wonBattles / pastBattles.length) * 100;
    
    return { winRate, totalBattles: pastBattles.length };
  } catch (error) {
    console.error("Win Rate Error:", error);
    return { winRate: 0, totalBattles: 0 };
  }
}

export async function getMemberBadges(memberId: number) {
  try {
    const earned = await db
      .select({
        id: badges.id,
        name: badges.name,
        description: badges.description,
        earnedAt: memberBadges.earnedAt,
      })
      .from(memberBadges)
      .innerJoin(badges, eq(memberBadges.badgeId, badges.id))
      .where(eq(memberBadges.memberId, memberId));
    return earned;
  } catch (error) {
    console.error("Member Badges Error:", error);
    return [];
  }
}
