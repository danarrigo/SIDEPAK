"use server";
import { db } from "@/db";
import { battles } from "@/db/schema/activities";
import { or, eq } from "drizzle-orm";

export async function getArenaData(memberId: number = 1) {
  try {
    const activeBattles = await db.select().from(battles).where(
      or(
        eq(battles.challengerId, memberId),
        eq(battles.opponentId, memberId)
      )
    );
    return { activeBattles };
  } catch (error) {
    console.error("Arena DB Error:", error);
    return { activeBattles: [] };
  }
}
