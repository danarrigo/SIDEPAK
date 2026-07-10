"use server";
import { db } from "@/db";
import { quests, memberQuests } from "@/db/schema/achievements";
import { eq, and, gt, sql } from "drizzle-orm";
import { awardPoints } from "@/actions/gamification";

function getSeededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function selectRandomQuests(quests: any[], seed: number, count: number) {
  const shuffled = [...quests].sort((a, b) => {
    return getSeededRandom(seed + a.id) - 0.5;
  });
  return shuffled.slice(0, count);
}

export async function getActiveQuests(memberId: number = 1) {
  try {
    const now = new Date();
    
    // 1. Get all active member quests that haven't expired
    let activeMemberQuests = await db.select({
      memberQuest: memberQuests,
      quest: quests
    })
    .from(memberQuests)
    .innerJoin(quests, eq(memberQuests.questId, quests.id))
    .where(
      and(
        eq(memberQuests.memberId, memberId),
        gt(memberQuests.expiresAt, now)
      )
    );
    
    const currentDaily = activeMemberQuests.filter(q => q.quest.frequency === 'daily');
    const currentWeekly = activeMemberQuests.filter(q => q.quest.frequency === 'weekly');
    
    const newQuestsToInsert: any[] = [];
    
    // 2. Generate new daily quests if needed
    if (currentDaily.length < 5) {
      const allQuests = await db.select().from(quests);
      const dailyQuests = allQuests.filter(q => q.frequency === 'daily');
      
      const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
      const selectedDaily = selectRandomQuests(dailyQuests, dateSeed + memberId, 5);
      
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      
      selectedDaily.forEach(q => {
        newQuestsToInsert.push({
          memberId,
          questId: q.id,
          progress: 0,
          isCompleted: false,
          expiresAt: endOfDay
        });
      });
    }
    
    // 3. Generate new weekly quests if needed
    if (currentWeekly.length < 5) {
      const allQuests = await db.select().from(quests);
      const weeklyQuests = allQuests.filter(q => q.frequency === 'weekly');
      
      const weekSeed = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
      const selectedWeekly = selectRandomQuests(weeklyQuests, weekSeed + memberId, 5);
      
      const endOfWeek = new Date(now);
      const daysUntilSunday = 7 - now.getDay();
      endOfWeek.setDate(now.getDate() + (daysUntilSunday === 7 ? 0 : daysUntilSunday));
      endOfWeek.setHours(23, 59, 59, 999);
      
      selectedWeekly.forEach(q => {
        newQuestsToInsert.push({
          memberId,
          questId: q.id,
          progress: 0,
          isCompleted: false,
          expiresAt: endOfWeek
        });
      });
    }
    
    // 4. Save to DB if there are new quests
    if (newQuestsToInsert.length > 0) {
      await db.insert(memberQuests)
        .values(newQuestsToInsert)
        .onConflictDoUpdate({
          target: [memberQuests.memberId, memberQuests.questId],
          set: { 
            progress: 0, 
            isCompleted: false, 
            expiresAt: sql`EXCLUDED.expires_at`,
            updatedAt: new Date()
          }
        });
        
      // Re-fetch to get the updated list including new ids
      activeMemberQuests = await db.select({
        memberQuest: memberQuests,
        quest: quests
      })
      .from(memberQuests)
      .innerJoin(quests, eq(memberQuests.questId, quests.id))
      .where(
        and(
          eq(memberQuests.memberId, memberId),
          gt(memberQuests.expiresAt, now)
        )
      );
    }
    
    // 5. Format return data
    return activeMemberQuests.map(row => ({
      ...row.quest,
      progress: row.memberQuest
    }));
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
