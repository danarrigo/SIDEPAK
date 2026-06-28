"use client";
import React, { useState } from "react";

export default function MissionList({ initialQuests = [] }: { initialQuests?: { id: string | number; title: string; rewardPoints?: number; progress?: { isCompleted?: boolean }; category?: string }[] }) {
  const [missions, setMissions] = useState(
    initialQuests.map((q) => ({
      id: q.id.toString(),
      title: q.title,
      points: q.rewardPoints || 0,
      completed: q.progress?.isCompleted || false,
      category: q.category || "daily",
    }))
  );

  const handleToggleMission = (id: string) => {
    // Optimistic toggle (no DB update yet)
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === id) return { ...m, completed: !m.completed };
        return m;
      })
    );
  };

  return (
    <ul className="space-y-4">
      {missions.filter(m => m.category === "daily").slice(0, 3).map((mission) => (
        <li key={mission.id} className="flex items-center justify-between bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleToggleMission(mission.id)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                mission.completed
                  ? "bg-primary border-primary text-on-primary"
                  : "border-outline hover:border-primary"
              }`}
            >
              {mission.completed && <span className="material-symbols-outlined text-xs font-black">check</span>}
            </button>
            <span className={`text-xs font-semibold ${mission.completed ? "text-on-surface-variant line-through" : "text-on-surface"}`}>
              {mission.title}
            </span>
          </div>
          <span className="text-[10px] font-bold text-tertiary">+{mission.points}</span>
        </li>
      ))}
    </ul>
  );
}
