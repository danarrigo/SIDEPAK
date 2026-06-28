"use client";
import React, { useState } from "react";
import { claimQuestReward } from "@/actions/quests";
import { useRouter } from "next/navigation";

export default function MissionList({ initialQuests = [], memberId, frequency = "daily" }: { initialQuests?: any[], memberId: number, frequency?: "daily" | "weekly" | "monthly" }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleClaim = async (questId: number) => {
    setLoading(questId.toString());
    const res = await claimQuestReward(memberId, questId);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || "Gagal klaim hadiah");
    }
    setLoading(null);
  };

  return (
    <ul className="space-y-4">
      {initialQuests.filter(m => m.frequency === frequency).slice(0, 3).map((quest) => {
        const currentProgress = quest.progress?.progress || 0;
        const target = quest.targetCount || 1;
        const isCompleted = quest.progress?.isCompleted || false;
        const canClaim = currentProgress >= target && !isCompleted;

        return (
          <li key={quest.id} className="flex items-center justify-between bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/30">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                <span className="material-symbols-outlined text-sm">
                  {isCompleted ? "task_alt" : canClaim ? "star" : "pending_actions"}
                </span>
              </div>
              <div>
                <span className={`text-xs font-semibold ${isCompleted ? "text-on-surface-variant line-through" : "text-on-surface"}`}>
                  {quest.title}
                </span>
                <div className="text-[10px] text-on-surface-variant mt-0.5">
                  Progres: {currentProgress} / {target}
                </div>
              </div>
            </div>
            {canClaim ? (
              <button 
                onClick={() => handleClaim(quest.id)}
                disabled={loading === quest.id.toString()}
                className="bg-primary hover:bg-primary/90 text-on-primary text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
              >
                KLAIM
              </button>
            ) : isCompleted ? (
              <span className="text-[10px] font-bold text-outline">SELESAI</span>
            ) : (
              <span className="text-[10px] font-bold text-tertiary">+{quest.rewardPoints} XP</span>
            )}
          </li>
        )
      })}
    </ul>
  );
}
