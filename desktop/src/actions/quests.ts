"use server";
import { db } from "@/db";
import { quests, memberQuests } from "@/db/schema/achievements";
import { eq, and } from "drizzle-orm";
import { awardPoints } from "@/actions/gamification";

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

export async function claimQuestReward(memberId: number, questId: number) {
  try {
    const [memberQuest] = await db.select().from(memberQuests).where(
      and(eq(memberQuests.memberId, memberId), eq(memberQuests.questId, questId))
    );
    
    if (!memberQuest || memberQuest.isCompleted) return { success: false, error: "Misi tidak ditemukan atau sudah diklaim." };
    
    const [quest] = await db.select().from(quests).where(eq(quests.id, questId));
    
    if (memberQuest.progress < (quest.targetCount ?? 1)) {
       return { success: false, error: "Misi belum selesai." };
    }
    
    await db.update(memberQuests).set({ isCompleted: true, completedAt: new Date() }).where(eq(memberQuests.id, memberQuest.id));
    
    await awardPoints(memberId, quest.rewardPoints, 'quest', `Menyelesaikan misi: ${quest.title}`);
    
    return { success: true };
  } catch(error) {
    console.error("Claim Quest Error:", error);
    return { success: false, error: "Gagal klaim hadiah." };
  }
}
