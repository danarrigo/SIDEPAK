"use server";
import { db } from "@/db";
import { battles, cooperativeMatches } from "@/db/schema/activities";
import { members } from "@/db/schema/members";
import { cooperatives } from "@/db/schema/cooperatives";
import { or, eq, and, not, desc, lte, gte } from "drizzle-orm";
import { memberProgress, pointTransactions, seasons } from "@/db/schema/gamification";
import { memberQuests } from "@/db/schema/achievements";
import { incrementQuestProgress } from "@/actions/quests";

export async function getArenaData(memberId: number = 1) {
  try {
    const [currentMember] = await db.select().from(members).where(eq(members.id, memberId));
    if (!currentMember || !currentMember.cooperativeId) return { activeBattles: [], currentMatch: null };

    // Get Active Season
    const [activeSeason] = await db.select().from(seasons).where(eq(seasons.isActive, true)).orderBy(desc(seasons.createdAt)).limit(1);

    let currentMatch = null;
    let rivalCooperative = null;

    if (activeSeason) {
      // Check if cooperative has an ongoing Head-to-Head match
      const now = new Date();
      const [match] = await db.select().from(cooperativeMatches).where(
        and(
          eq(cooperativeMatches.seasonId, activeSeason.id),
          or(
            eq(cooperativeMatches.cooperativeAId, currentMember.cooperativeId),
            eq(cooperativeMatches.cooperativeBId, currentMember.cooperativeId)
          ),
          lte(cooperativeMatches.startDate, now),
          gte(cooperativeMatches.endDate, now)
        )
      ).limit(1);

      if (match) {
        const rivalId = match.cooperativeAId === currentMember.cooperativeId ? match.cooperativeBId : match.cooperativeAId;
        const [rival] = await db.select().from(cooperatives).where(eq(cooperatives.id, rivalId)).limit(1);
        currentMatch = {
          ...match,
          isCoopA: match.cooperativeAId === currentMember.cooperativeId
        };
        rivalCooperative = rival;
      }
    }

    const activeBattles = await db.select().from(battles).where(
      and(
        or(
          eq(battles.challengerId, memberId),
          eq(battles.opponentId, memberId)
        ),
        eq(battles.status, 'ongoing')
      )
    );
    
    // Fetch opponent data
    const battlesWithOpponents = await Promise.all(activeBattles.map(async (battle) => {
      const opponentId = battle.challengerId === memberId ? battle.opponentId : battle.challengerId;
      const [opponent] = await db.select().from(members).where(eq(members.id, opponentId));
      return { ...battle, opponent };
    }));

    return { 
      activeBattles: battlesWithOpponents,
      currentMatch,
      rivalCooperative
    };
  } catch (error) {
    console.error("Arena DB Error:", error);
    return { activeBattles: [], currentMatch: null, rivalCooperative: null };
  }
}

export async function matchmakeGuildWarBattle(memberId: number) {
  try {
    const [currentMember] = await db.select().from(members).where(eq(members.id, memberId));
    if (!currentMember || !currentMember.cooperativeId) return { success: false, error: "Member tidak ditemukan atau belum terdaftar di koperasi." };

    // Find if the member already has an active battle
    const ongoingBattle = await db.select().from(battles).where(
      and(
        or(eq(battles.challengerId, memberId), eq(battles.opponentId, memberId)),
        eq(battles.status, 'ongoing')
      )
    );
    if (ongoingBattle.length > 0) return { success: false, error: "Anda sudah memiliki pertarungan aktif." };

    // Find Active Guild War match
    const [activeSeason] = await db.select().from(seasons).where(eq(seasons.isActive, true)).orderBy(desc(seasons.createdAt)).limit(1);
    if (!activeSeason) return { success: false, error: "Tidak ada musim yang sedang aktif." };

    const now = new Date();
    const [match] = await db.select().from(cooperativeMatches).where(
      and(
        eq(cooperativeMatches.seasonId, activeSeason.id),
        or(
          eq(cooperativeMatches.cooperativeAId, currentMember.cooperativeId),
          eq(cooperativeMatches.cooperativeBId, currentMember.cooperativeId)
        ),
        lte(cooperativeMatches.startDate, now),
        gte(cooperativeMatches.endDate, now)
      )
    ).limit(1);

    if (!match) return { success: false, error: "Koperasi Anda belum mendapatkan jadwal Guild War minggu ini." };

    const rivalId = match.cooperativeAId === currentMember.cooperativeId ? match.cooperativeBId : match.cooperativeAId;

    // Find members of Rival Cooperative
    const rivalMembers = await db.select().from(members).where(
      eq(members.cooperativeId, rivalId)
    );

    if (rivalMembers.length === 0) return { success: false, error: "Tidak ada lawan yang tersedia di koperasi rival." };

    // Filter out busy rival members
    const activeBattles = await db.select().from(battles).where(eq(battles.status, 'ongoing'));
    const busyIds = new Set<number>();
    activeBattles.forEach(b => {
      busyIds.add(b.challengerId);
      busyIds.add(b.opponentId);
    });

    const availableOpponents = rivalMembers.filter(m => !busyIds.has(m.id));

    if (availableOpponents.length === 0) return { success: false, error: "Semua anggota koperasi rival sedang bertarung." };

    const randomOpponent = availableOpponents[Math.floor(Math.random() * availableOpponents.length)];

    const endDate = new Date();
    endDate.setDate(now.getDate() + 1); // 1v1 battles last 1 day within a 7-day Guild War

    const [newBattle] = await db.insert(battles).values({
      matchId: match.id,
      challengerId: memberId,
      opponentId: randomOpponent.id,
      challengerPoints: 0,
      opponentPoints: 0,
      startDate: now,
      endDate: endDate,
      status: 'ongoing'
    }).returning();

    return { success: true, battle: newBattle, opponent: randomOpponent };
  } catch (error) {
    console.error("Matchmake Error:", error);
    return { success: false, error: "Gagal menemukan lawan dari koperasi rival." };
  }
}

export async function finishBattle(battleId: number, memberId: number, won: boolean) {
  try {
    const [battle] = await db.select().from(battles).where(eq(battles.id, battleId));
    if (!battle) return { success: false, error: "Battle not found" };

    const opponentId = battle.challengerId === memberId ? battle.opponentId : battle.challengerId;
    const winnerId = won ? memberId : opponentId;

    await db.update(battles).set({
      status: 'completed',
      winnerId: winnerId
    }).where(eq(battles.id, battleId));

    // Update Guild War Score if part of a match
    if (battle.matchId) {
      const [match] = await db.select().from(cooperativeMatches).where(eq(cooperativeMatches.id, battle.matchId));
      if (match && match.status === 'ongoing') {
        const [winnerMember] = await db.select().from(members).where(eq(members.id, winnerId));
        if (winnerMember && winnerMember.cooperativeId === match.cooperativeAId) {
          await db.update(cooperativeMatches).set({ scoreA: match.scoreA + 1 }).where(eq(cooperativeMatches.id, match.id));
        } else if (winnerMember && winnerMember.cooperativeId === match.cooperativeBId) {
          await db.update(cooperativeMatches).set({ scoreB: match.scoreB + 1 }).where(eq(cooperativeMatches.id, match.id));
        }
      }
    }

    // Award XP
    await db.insert(pointTransactions).values({
      memberId: winnerId,
      amount: 100, // Winner gets 100 XP
      source: 'battle',
      description: 'Menang 1v1 Guild War'
    });
    
    const [winnerProgress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, winnerId));
    if (winnerProgress) {
      await db.update(memberProgress).set({ xp: winnerProgress.xp + 100 }).where(eq(memberProgress.id, winnerProgress.id));
    }

    // Trigger play_arena quest for both players
    await incrementQuestProgress(memberId, 'play_arena', 1);
    if (opponentId !== memberId) {
      await incrementQuestProgress(opponentId, 'play_arena', 1);
    }

    return { success: true };
  } catch (error) {
    console.error("Finish Battle Error:", error);
    return { success: false, error: "Failed to finish battle" };
  }
}

export async function getBattleHistory(memberId: number = 1) {
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
    
    const battlesWithOpponents = await Promise.all(pastBattles.map(async (battle) => {
      const opponentId = battle.challengerId === memberId ? battle.opponentId : battle.challengerId;
      const [opponent] = await db.select().from(members).where(eq(members.id, opponentId));
      return { ...battle, opponent };
    }));

    return { pastBattles: battlesWithOpponents };
  } catch (error) {
    console.error("Arena History DB Error:", error);
    return { pastBattles: [] };
  }
}

export async function getMemberStats(memberId: number) {
  try {
    const [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    const pts = await db.select().from(pointTransactions).where(eq(pointTransactions.memberId, memberId));
    
    const winPts = pts.filter(p => p.source === 'battle').reduce((a, c) => a + c.amount, 0);

    return {
      missionsCompleted: 0,
      totalSavings: progress ? progress.walletBalance : 0,
      savingsPts: 0,
      activeStreak: 0,
      eventsJoined: 0,
      shopPurchases: 0,
      marketplaceActivity: 0,
      loansCount: 0,
      battlesWon: winPts,
    };
  } catch (error) {
    console.error("Stats DB Error:", error);
    return { missionsCompleted: 0, totalSavings: 0, savingsPts: 0, activeStreak: 0, eventsJoined: 0, shopPurchases: 0, marketplaceActivity: 0, loansCount: 0, battlesWon: 0 };
  }
}
