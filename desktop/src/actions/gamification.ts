"use server";
import { db } from "@/db";
import { memberProgress, items, pointTransactions, memberItems } from "@/db/schema/gamification";
import { battles } from "@/db/schema/activities";
import { members } from "@/db/schema/members";
import { or, eq, and, desc } from "drizzle-orm";

export async function getMemberProgress(memberId: number) {
  try {
    const [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    return progress;
  } catch (error) {
    console.error("Member Progress Error:", error);
    return null;
  }
}

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

export async function awardPoints(memberId: number, amount: number, source: string, description?: string) {
  try {
    // Insert transaction
    await db.insert(pointTransactions).values({
      memberId,
      amount,
      source,
      description
    });

    // Get current progress
    let [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    
    if (!progress) {
      const [newProgress] = await db.insert(memberProgress).values({ memberId }).returning();
      progress = newProgress;
    }

    // Determine multiplier or flat value? The user said "dont worry about the conversion rate for now". So amount = amount.
    const newXp = progress.xp + amount;
    const newPointsBalance = progress.pointsBalance + amount;
    
    // Level calc: 1 level per 1000 XP
    const newLevel = Math.floor(newXp / 1000) + 1;

    // Update progress
    await db.update(memberProgress)
      .set({
        xp: newXp,
        pointsBalance: newPointsBalance,
        level: newLevel,
        updatedAt: new Date()
      })
      .where(eq(memberProgress.memberId, memberId));

    return { success: true, levelUp: newLevel > progress.level, newLevel };
  } catch (error) {
    console.error("Award Points Error:", error);
    return { success: false, error };
  }
}

export async function getLeaderboard(koperasiName: string) {
  try {
    const topMembers = await db
      .select({
        id: members.id,
        namaLengkap: members.namaLengkap,
        level: memberProgress.level,
        xp: memberProgress.xp,
        pointsBalance: memberProgress.pointsBalance,
      })
      .from(members)
      .innerJoin(memberProgress, eq(members.id, memberProgress.memberId))
      .where(eq(members.koperasi, koperasiName))
      .orderBy(desc(memberProgress.xp))
      .limit(10);
      
    return topMembers;
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return [];
  }
}

export async function useItem(memberId: number, itemId: number, targetMemberId?: number) {
  try {
    const [inventory] = await db.select().from(memberItems).where(
      and(eq(memberItems.memberId, memberId), eq(memberItems.itemId, itemId))
    );
    
    if (!inventory || inventory.quantity <= 0) {
      return { success: false, error: "Item tidak ditemukan atau habis." };
    }

    const [item] = await db.select().from(items).where(eq(items.id, itemId));
    
    // Deduct quantity
    await db.update(memberItems)
      .set({ quantity: inventory.quantity - 1 })
      .where(eq(memberItems.id, inventory.id));
      
    // Apply effect to target
    if (targetMemberId && item.effectType === 'prank') {
      await db.update(memberProgress)
        .set({ activeEffect: item.name }) // e.g. "Sakit Jantung"
        .where(eq(memberProgress.memberId, targetMemberId));
    }
      
    return { success: true, effect: item.effectType };
  } catch (error) {
    console.error("Use Item Error:", error);
    return { success: false, error: "Gagal menggunakan item." };
  }
}

export async function clearActiveEffect(memberId: number) {
  try {
    await db.update(memberProgress)
      .set({ activeEffect: null })
      .where(eq(memberProgress.memberId, memberId));
    return { success: true };
  } catch (error) {
    console.error("Clear Effect Error:", error);
    return { success: false, error: "Gagal menghapus efek." };
  }
}

export async function getMemberInventory(memberId: number) {
  try {
    const inventory = await db
      .select({
        id: memberItems.id,
        quantity: memberItems.quantity,
        item: items
      })
      .from(memberItems)
      .innerJoin(items, eq(memberItems.itemId, items.id))
      .where(eq(memberItems.memberId, memberId));
    return inventory.filter(inv => inv.quantity > 0);
  } catch (error) {
    console.error("Member Inventory Error:", error);
    return [];
  }
}

export async function getRecentPointTransactions(memberId: number) {
  try {
    const history = await db
      .select()
      .from(pointTransactions)
      .where(eq(pointTransactions.memberId, memberId))
      .orderBy(desc(pointTransactions.createdAt))
      .limit(5);
    return history;
  } catch (error) {
    console.error("Point Transactions Error:", error);
    return [];
  }
}
