"use server";
import { db } from "@/db";
import { battles } from "@/db/schema/activities";
import { members } from "@/db/schema/members";
import { or, eq, and, not } from "drizzle-orm";
import { memberProgress, pointTransactions } from "@/db/schema/gamification";
import { memberQuests } from "@/db/schema/achievements";

export async function getArenaData(memberId: number = 1) {
  try {
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

    return { activeBattles: battlesWithOpponents };
  } catch (error) {
    console.error("Arena DB Error:", error);
    return { activeBattles: [] };
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

export async function matchmakeWeeklyBattle(memberId: number) {
  try {
    const [currentMember] = await db.select().from(members).where(eq(members.id, memberId));
    if (!currentMember || !currentMember.cooperativeId) return { success: false, error: "Member tidak ditemukan atau belum terdaftar di koperasi." };

    const ongoingBattle = await db.select().from(battles).where(
      and(
        or(eq(battles.challengerId, memberId), eq(battles.opponentId, memberId)),
        eq(battles.status, 'ongoing')
      )
    );
    if (ongoingBattle.length > 0) return { success: false, error: "Anda sudah memiliki pertarungan aktif." };

    const coopMembers = await db.select().from(members).where(
      and(
        eq(members.cooperativeId, currentMember.cooperativeId as number),
        not(eq(members.id, memberId))
      )
    );

    if (coopMembers.length === 0) return { success: false, error: "Tidak ada lawan yang tersedia di koperasi ini." };

    const activeBattles = await db.select().from(battles).where(eq(battles.status, 'ongoing'));
    const busyIds = new Set<number>();
    activeBattles.forEach(b => {
      busyIds.add(b.challengerId);
      busyIds.add(b.opponentId);
    });

    const availableOpponents = coopMembers.filter(m => !busyIds.has(m.id));

    if (availableOpponents.length === 0) return { success: false, error: "Semua anggota koperasi sedang dalam pertarungan." };

    const randomOpponent = availableOpponents[Math.floor(Math.random() * availableOpponents.length)];

    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 7);

    const [newBattle] = await db.insert(battles).values({
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
    return { success: false, error: "Gagal menemukan lawan." };
  }
}

export async function getMemberStats(memberId: number) {
  try {
    const [progress] = await db.select().from(memberProgress).where(eq(memberProgress.memberId, memberId));
    const quests = await db.select().from(memberQuests).where(and(eq(memberQuests.memberId, memberId), eq(memberQuests.isCompleted, true)));
    const pts = await db.select().from(pointTransactions).where(eq(pointTransactions.memberId, memberId));
    
    const eventsCount = pts.filter(p => p.source === 'event').length;
    const shopCount = pts.filter(p => p.source === 'shop').length;
    const mkCount = pts.filter(p => p.source === 'marketplace').length;
    const loanCount = pts.filter(p => p.source === 'loan').length;
    const winCount = pts.filter(p => p.source === 'battle').length;

    return {
      missionsCompleted: quests.length,
      totalSavings: progress ? progress.walletBalance : 0,
      activeStreak: progress ? progress.currentStreak : 0,
      eventsJoined: eventsCount,
      shopPurchases: shopCount,
      marketplaceActivity: mkCount,
      loansCount: loanCount,
      battlesWon: winCount,
    };
  } catch (error) {
    console.error("Stats DB Error:", error);
    return { missionsCompleted: 0, totalSavings: 0, activeStreak: 0, eventsJoined: 0, shopPurchases: 0, marketplaceActivity: 0, loansCount: 0, battlesWon: 0 };
  }
}
