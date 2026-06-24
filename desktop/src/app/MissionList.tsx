"use client";
import React, { useState } from "react";

export default function MissionList() {
  const [missions, setMissions] = useState([
    { id: "d1", title: "Belanja hari ini", points: 20, completed: true, category: "daily" },
    { id: "d2", title: "Hadir RAT", points: 50, completed: false, category: "daily" },
    { id: "d3", title: "Baca berita koperasi", points: 15, completed: false, category: "daily" },
  ]);

  const handleToggleMission = (id: string) => {
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
