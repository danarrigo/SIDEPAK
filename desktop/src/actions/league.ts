"use server";

import { db } from "@/db";
import { seasons, koperasiSeasonScores, cooperatives } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getCurrentSeason() {
  const [activeSeason] = await db
    .select()
    .from(seasons)
    .where(eq(seasons.isActive, true))
    .limit(1);
    
  return activeSeason || null;
}

export async function getLeagueLeaderboard(seasonId: number) {
  const scores = await db
    .select({
      id: koperasiSeasonScores.id,
      koperasiId: koperasiSeasonScores.koperasiId,
      totalXp: koperasiSeasonScores.totalXp,
      koperasiName: cooperatives.name,
    })
    .from(koperasiSeasonScores)
    .innerJoin(cooperatives, eq(koperasiSeasonScores.koperasiId, cooperatives.id))
    .where(eq(koperasiSeasonScores.seasonId, seasonId))
    .orderBy(desc(koperasiSeasonScores.totalXp))
    .limit(50);
    
  return scores;
}

export async function addXpToKoperasi(koperasiId: number, xpAmount: number) {
  if (xpAmount <= 0) return;
  
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
      totalXp: xpAmount
    });
  } else {
    await db.update(koperasiSeasonScores)
      .set({
        totalXp: score.totalXp + xpAmount,
        updatedAt: new Date(),
      })
      .where(eq(koperasiSeasonScores.id, score.id));
  }
}
