"use server";
import { db } from "@/db";
import { memberProgress, items, pointTransactions, memberItems } from "@/db/schema/gamification";
import { memberBadges, badges, memberWeeklyChests, memberQuests } from "@/db/schema/achievements";
import { battles } from "@/db/schema/activities";
import { members } from "@/db/schema/members";
import { cooperatives } from "@/db/schema/cooperatives";
import { or, eq, and, desc, sql } from "drizzle-orm";
import { cache } from "react";

export const getMemberProgress = cache(async (memberId: number) => {
  try {
    const [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    return progress;
  } catch (error) {
    console.error("Member Progress Error:", error);
    return null;
  }
});

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
    // Get current progress
    let [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    
    if (!progress) {
      const [newProgress] = await db.insert(memberProgress).values({ memberId }).returning();
      progress = newProgress;
    }

    // Calculate streak multiplier
    let multiplier = 1.0;
    if (progress.currentStreak >= 7) {
      multiplier = 1.5;
    } else if (progress.currentStreak >= 3) {
      multiplier = 1.2;
    }

    const finalAmount = Math.floor(amount * multiplier);
    const streakText = multiplier > 1.0 ? ` (Streak x${multiplier})` : '';

    // Insert transaction
    await db.insert(pointTransactions).values({
      memberId,
      amount: finalAmount,
      source,
      description: description ? `${description}${streakText}` : `Poin tambahan${streakText}`
    });

    const newXp = progress.xp + finalAmount;
    const newPointsBalance = progress.pointsBalance + finalAmount;
    
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

    // Update active battle score
    const activeBattles = await db.select().from(battles).where(
      and(
        or(
          eq(battles.challengerId, memberId),
          eq(battles.opponentId, memberId)
        ),
        eq(battles.status, 'ongoing')
      )
    );
    
    if (activeBattles.length > 0) {
      const battle = activeBattles[0];
      if (battle.challengerId === memberId) {
        await db.update(battles).set({ challengerPoints: battle.challengerPoints + finalAmount }).where(eq(battles.id, battle.id));
      } else {
        await db.update(battles).set({ opponentPoints: battle.opponentPoints + finalAmount }).where(eq(battles.id, battle.id));
      }
    }

    return { success: true, levelUp: newLevel > progress.level, newLevel };
  } catch (error) {
    console.error("Award Points Error:", error);
    return { success: false, error };
  }
}

export async function getLeaderboard(cooperativeId: number) {
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
      .where(eq(members.cooperativeId, cooperativeId))
      .orderBy(desc(memberProgress.xp))
      .limit(10);
      
      return topMembers;
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return [];
  }
}

export async function getLeaderboardProvincial(provinsi: string) {
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
      .where(eq(members.provinsi, provinsi))
      .orderBy(desc(memberProgress.xp))
      .limit(10);
      
    return topMembers;
  } catch (error) {
    console.error("Leaderboard Provincial Error:", error);
    return [];
  }
}

export async function getLeaderboardNational() {
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
      .orderBy(desc(memberProgress.xp))
      .limit(10);
      
    return topMembers;
  } catch (error) {
    console.error("Leaderboard National Error:", error);
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

export async function getCooperativeLeaderboard() {
  try {
    const topCooperatives = await db
      .select({
        id: cooperatives.id,
        namaLengkap: cooperatives.name,
        level: sql<number>`cast(avg(${memberProgress.level}) as integer)`,
        xp: sql<number>`cast(sum(${memberProgress.xp}) as integer)`,
        pointsBalance: sql<number>`cast(sum(${memberProgress.pointsBalance}) as integer)`,
      })
      .from(cooperatives)
      .innerJoin(members, eq(cooperatives.id, members.cooperativeId))
      .innerJoin(memberProgress, eq(members.id, memberProgress.memberId))
      .groupBy(cooperatives.id, cooperatives.name)
      .orderBy(desc(sql`sum(${memberProgress.pointsBalance})`))
      .limit(10);
      
    return topCooperatives;
  } catch (error) {
    console.error("Cooperative Leaderboard Error:", error);
    return [];
  }
}

export async function claimStreakReward(memberId: number) {
  try {
    let [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    if (!progress) {
      const [newProgress] = await db.insert(memberProgress).values({ memberId }).returning();
      progress = newProgress;
    }
    
    // Check if already claimed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastUpdate = progress.updatedAt ? new Date(progress.updatedAt) : new Date(0);
    lastUpdate.setHours(0, 0, 0, 0);
    
    if (lastUpdate.getTime() === today.getTime() && progress.currentStreak > 0) {
      return { success: false, error: "Streak hari ini sudah diklaim." };
    }
    
    // Calculate new streak
    const isConsecutive = (today.getTime() - lastUpdate.getTime()) === 86400000; // 1 day in ms
    const newStreak = isConsecutive ? progress.currentStreak + 1 : 1;
    
    await db.update(memberProgress).set({
      currentStreak: newStreak,
      updatedAt: new Date()
    }).where(eq(memberProgress.memberId, memberId));
    
    await awardPoints(memberId, 50, 'streak', `Reward streak harian (${newStreak} hari)`);
    
    return { success: true, streak: newStreak };
  } catch (error) {
    console.error("Streak Error:", error);
    return { success: false, error: "Gagal klaim streak." };
  }
}

export async function resolveWeeklyBattles() {
  try {
    const now = new Date();
    
    const expiredBattles = await db.select().from(battles).where(
      and(
        eq(battles.status, 'ongoing'),
        sql`${battles.endDate} < ${now}`
      )
    );
    
    for (const battle of expiredBattles) {
      let winnerId = null;
      if (battle.challengerPoints > battle.opponentPoints) {
        winnerId = battle.challengerId;
      } else if (battle.opponentPoints > battle.challengerPoints) {
        winnerId = battle.opponentId;
      }
      
      await db.update(battles).set({
        status: 'completed',
        winnerId
      }).where(eq(battles.id, battle.id));
      
      if (winnerId) {
        await awardPoints(winnerId, 500, 'battle', 'Memenangkan pertandingan mingguan!');
      }
    }
    
    return { success: true, resolvedCount: expiredBattles.length };
  } catch (error) {
    console.error("Resolve Battles Error:", error);
    return { success: false, error: "Gagal menyelesaikan battle mingguan." };
  }
}

export async function getClaimedChests(memberId: number) {
  try {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const weekStartDate = new Date(today.setDate(diff));
    weekStartDate.setHours(0, 0, 0, 0);

    const claimed = await db.select()
      .from(memberWeeklyChests)
      .where(
        and(
          eq(memberWeeklyChests.memberId, memberId),
          sql`${memberWeeklyChests.weekStartDate} >= ${weekStartDate}`
        )
      );
    return claimed.map(c => c.chestIndex);
  } catch (error) {
    console.error("Get Claimed Chests Error:", error);
    return [];
  }
}

export async function claimWeeklyChest(memberId: number, chestIndex: number) {
  try {
    // 1. Get completed missions count
    const completed = await db.select().from(memberQuests).where(
      and(
        eq(memberQuests.memberId, memberId),
        eq(memberQuests.isCompleted, true)
      )
    );
    const completedCount = completed.length;

    const chestMilestones = [6, 12, 18, 24, 30];
    const target = chestMilestones[chestIndex];
    if (target === undefined || completedCount < target) {
      return { success: false, error: "Misi belum cukup untuk membuka peti ini." };
    }

    // 2. Check if already claimed this week
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const weekStartDate = new Date(today.setDate(diff));
    weekStartDate.setHours(0, 0, 0, 0);

    const existing = await db.select().from(memberWeeklyChests).where(
      and(
        eq(memberWeeklyChests.memberId, memberId),
        eq(memberWeeklyChests.chestIndex, chestIndex),
        sql`${memberWeeklyChests.weekStartDate} >= ${weekStartDate}`
      )
    );

    if (existing.length > 0) {
      return { success: false, error: "Peti ini sudah diklaim minggu ini." };
    }

    // 3. Insert claim
    await db.insert(memberWeeklyChests).values({
      memberId,
      chestIndex,
      weekStartDate
    });

    // 4. Award points based on chest tier
    const rewards = [100, 250, 500, 1000, 2500];
    const rewardPoints = rewards[chestIndex] || 100;
    await awardPoints(memberId, rewardPoints, 'chest', `Hadiah Peti Harta ke-${chestIndex + 1}`);

    return { success: true, rewardPoints };
  } catch (error) {
    console.error("Claim Weekly Chest Error:", error);
    return { success: false, error: "Gagal klaim peti." };
  }
}

