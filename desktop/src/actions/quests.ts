"use server";
import { db } from "@/db";
import { quests, memberQuests } from "@/db/schema/achievements";
import { eq } from "drizzle-orm";

export async function getActiveQuests(memberId: number = 1) {
  try {
    const activeMemberQuests = await db.select()
      .from(memberQuests)
      .where(eq(memberQuests.memberId, memberId));
      
    const allQuests = await db.select().from(quests);
    
    return allQuests.map(quest => {
      const progress = activeMemberQuests.find(mq => mq.questId === quest.id);
      return { ...quest, progress };
    });
  } catch (error) {
    console.error("Quests DB Error:", error);
    return [];
  }
}
