"use server";
import { db } from "@/db";
import { battles } from "@/db/schema/activities";
import { members } from "@/db/schema/members";
import { or, eq, and } from "drizzle-orm";

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
