"use server";

import { db } from "@/db";
import { seasons, koperasiSeasonScores } from "@/db/schema/gamification";
import { cooperatives } from "@/db/schema/cooperatives";
import { cooperativeMatches } from "@/db/schema/activities";
import { eq, and, desc, asc } from "drizzle-orm";

export async function getCurrentSeason() {
  const [activeSeason] = await db
    .select()
    .from(seasons)
    .where(eq(seasons.isActive, true))
    .orderBy(desc(seasons.createdAt))
    .limit(1);
    
  return activeSeason || null;
}

export async function getLeagueLeaderboard(seasonId: number) {
  const scores = await db
    .select({
      id: koperasiSeasonScores.id,
      koperasiId: koperasiSeasonScores.koperasiId,
      totalWins: koperasiSeasonScores.totalWins,
      totalLosses: koperasiSeasonScores.totalLosses,
      totalDraws: koperasiSeasonScores.totalDraws,
      totalPoints: koperasiSeasonScores.totalPoints,
      koperasiName: cooperatives.name,
    })
    .from(koperasiSeasonScores)
    .innerJoin(cooperatives, eq(koperasiSeasonScores.koperasiId, cooperatives.id))
    .where(eq(koperasiSeasonScores.seasonId, seasonId))
    .orderBy(desc(koperasiSeasonScores.totalWins), desc(koperasiSeasonScores.totalPoints))
    .limit(50);
    
  return scores;
}

export async function addPointsToKoperasi(koperasiId: number, pointsAmount: number) {
  if (pointsAmount <= 0) return;
  
  const activeSeason = await getCurrentSeason();
  if (!activeSeason) return;
  
  const [score] = await db
    .select()
    .from(koperasiSeasonScores)
    .where(and(
      eq(koperasiSeasonScores.koperasiId, koperasiId),
      eq(koperasiSeasonScores.seasonId, activeSeason.id)
    ));
    
  if (!score) {
    await db.insert(koperasiSeasonScores).values({
      koperasiId,
      seasonId: activeSeason.id,
      totalPoints: pointsAmount
    });
  } else {
    await db.update(koperasiSeasonScores)
      .set({
        totalPoints: score.totalPoints + pointsAmount,
        updatedAt: new Date(),
      })
      .where(eq(koperasiSeasonScores.id, score.id));
  }
}

export async function generateWeeklyGuildWars() {
  try {
    const activeSeason = await getCurrentSeason();
    if (!activeSeason) return { success: false, error: "No active season" };

    // Mark previous matches as completed and assign Wins to koperasiSeasonScores
    const ongoingMatches = await db.select().from(cooperativeMatches)
      .where(and(eq(cooperativeMatches.seasonId, activeSeason.id), eq(cooperativeMatches.status, 'ongoing')));

    for (const match of ongoingMatches) {
      await db.update(cooperativeMatches).set({ status: 'completed' }).where(eq(cooperativeMatches.id, match.id));
      
      let winnerId = null;
      let loserId = null;
      let draw = false;

      if (match.scoreA > match.scoreB) {
        winnerId = match.cooperativeAId;
        loserId = match.cooperativeBId;
      } else if (match.scoreB > match.scoreA) {
        winnerId = match.cooperativeBId;
        loserId = match.cooperativeAId;
      } else {
        draw = true;
      }

      const updateScore = async (coopId: number, isWin: boolean, isDraw: boolean) => {
        const [score] = await db.select().from(koperasiSeasonScores).where(
          and(eq(koperasiSeasonScores.koperasiId, coopId), eq(koperasiSeasonScores.seasonId, activeSeason.id))
        );
        if (score) {
          await db.update(koperasiSeasonScores).set({
            totalWins: isWin && !isDraw ? score.totalWins + 1 : score.totalWins,
            totalLosses: !isWin && !isDraw ? score.totalLosses + 1 : score.totalLosses,
            totalDraws: isDraw ? score.totalDraws + 1 : score.totalDraws,
          }).where(eq(koperasiSeasonScores.id, score.id));
        } else {
          await db.insert(koperasiSeasonScores).values({
            koperasiId: coopId,
            seasonId: activeSeason.id,
            totalWins: isWin && !isDraw ? 1 : 0,
            totalLosses: !isWin && !isDraw ? 1 : 0,
            totalDraws: isDraw ? 1 : 0,
          });
        }
      };

      if (!draw) {
        if (winnerId) await updateScore(winnerId, true, false);
        if (loserId) await updateScore(loserId, false, false);
      } else {
        await updateScore(match.cooperativeAId, false, true);
        await updateScore(match.cooperativeBId, false, true);
      }
    }

    // Generate new matches
    const allCoops = await db.select().from(cooperatives);
    const shuffled = allCoops.sort(() => 0.5 - Math.random());

    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 7);

    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const coopA = shuffled[i];
      const coopB = shuffled[i+1];

      await db.insert(cooperativeMatches).values({
        seasonId: activeSeason.id,
        cooperativeAId: coopA.id,
        cooperativeBId: coopB.id,
        scoreA: 0,
        scoreB: 0,
        startDate: now,
        endDate: endDate,
        status: 'ongoing'
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Guild War Gen Error:", error);
    return { success: false, error: "Failed to generate weekly wars" };
  }
}
